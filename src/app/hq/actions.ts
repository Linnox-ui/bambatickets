"use server";

import { cookies, headers } from "next/headers";
import prisma from "../../lib/prisma";
import { auth } from "../../auth";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
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

export async function requestHQ2FACode() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Authentication required." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"].includes(user.role)) {
    return { error: "Unauthorized." };
  }

  const identifier = `HQ_2FA_${user.id}`;
  let otp;

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
  });

  if (existingToken && new Date() < existingToken.expires) {
    otp = existingToken.token;
  } else {
    otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: { identifier, token: otp, expires },
    });
  }

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
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; padding: 12px 0;">
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

export async function provisionHQNode(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  const creator = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!creator || !["SUPER_ADMIN", "SUPERVISOR"].includes(creator.role)) {
    return { success: false, error: "Insufficient clearance." };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const targetRole = formData.get("role") as string;

  if (!firstName || !lastName || !email || !password || !targetRole) {
    return { success: false, error: "Missing parameters." };
  }

  if (creator.role === "SUPERVISOR" && targetRole !== "IT_TEAM") {
    return { success: false, error: "Clearance restricted to IT_TEAM only." };
  }

  if (
    creator.role === "SUPER_ADMIN" &&
    !["SUPERVISOR", "IT_TEAM"].includes(targetRole)
  ) {
    return { success: false, error: "Invalid role assignment." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return { success: false, error: "Identity already exists." };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: targetRole as Role,
      isIdVerified: true,
    },
  });

  revalidatePath("/hq");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.passwordHash)
    return { success: false, error: "Invalid user state." };

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid)
    return { success: false, error: "Incorrect current credential." };

  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}

export async function searchHQUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { success: false, error: "Unauthorized.", data: [] };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "SUPERVISOR"].includes(user.role)) {
    return { success: false, error: "Insufficient clearance.", data: [] };
  }

  if (!query.trim()) {
    return { success: true, data: [] };
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
    take: 12,
  });

  return { success: true, data: users };
}
