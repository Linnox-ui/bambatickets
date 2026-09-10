"use server";

import { cookies, headers } from "next/headers";
import prisma from "../../lib/prisma";
import { auth } from "../../auth";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  timingSafeCompare,
  signClearanceToken,
} from "../../lib/hq-security";

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// ==========================================
// 1. AIRLOCK PIN UNLOCK (WITH 3-STRIKE LOCKOUT)
// ==========================================
export async function unlockHQ(pin: string) {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(ip, 3, 15);

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Access Locked. Exceeded attempt threshold. Retry in ${rateLimit.waitTimeMinutes}m.`,
    };
  }

  const MASTER_PIN = process.env.HQ_PIN || "000000";

  if (!timingSafeCompare(pin, MASTER_PIN)) {
    recordFailedAttempt(ip, 3, 15);
    return {
      success: false,
      error: "Access Denied. Invalid Authorization PIN.",
    };
  }

  resetRateLimit(ip);

  const token = signClearanceToken({
    clearance: "AIRLOCK_CLEAR",
    timestamp: Date.now(),
  });
  const cookieStore = await cookies();

  cookieStore.set("bamba_hq_clearance", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 15,
    path: "/hq",
  });

  return { success: true };
}

// ==========================================
// 2. DISPATCH DYNAMIC 2FA CHALLENGE
// ==========================================
export async function requestHQ2FACode() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Authentication required." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"].includes(user.role)) {
    return { error: "Unauthorized." };
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 🔒 Locked back to a secure 5 minutes
  const identifier = `HQ_2FA_${user.id}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: otp, expires },
  });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Bamba HQ Security" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "BAMBA HQ: Elevated Clearance OTP",
      html: `
        <div style="background-color: #020617; color: #f8fafc; font-family: monospace; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #f97316; margin-top: 0;">BAMBA HQ // ELEVATED ACCESS</h2>
          <p>Authorization code for Root Terminal access requested by <strong>${user.email}</strong>:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981; padding: 12px 0;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Expires in 5 minutes. If you did not initiate this, sever connection immediately.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send HQ OTP:", err);
  }

  return { success: true };
}

// ==========================================
// 3. VERIFY DYNAMIC 2FA CHALLENGE
// ==========================================
export async function verifyHQ2FA(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Session expired." };

  const identifier = `HQ_2FA_${session.user.id}`;
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
  });

  if (!tokenRecord || !timingSafeCompare(tokenRecord.token, code)) {
    return { success: false, error: "Invalid or expired security code." };
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return {
      success: false,
      error: "Security code expired. Request a new one.",
    };
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = signClearanceToken({
    clearance: "2FA_VERIFIED",
    timestamp: Date.now(),
  });
  const cookieStore = await cookies();

  cookieStore.set("bamba_hq_2fa", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 15,
    path: "/hq",
  });

  return { success: true };
}
