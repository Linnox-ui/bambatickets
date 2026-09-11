"use server";

import prisma from "../../lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  const identifier = `PWD_RESET_${user.email}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Bamba Security" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Bamba Tickets: Password Reset Authorization",
      html: `
        <div style="background-color: #020617; color: #f8fafc; font-family: monospace; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #06b6d4; margin-top: 0;">BAMBA SECURITY // CREDENTIAL RESET</h2>
          <p>A password reset was requested for the identity: <strong>${user.email}</strong></p>
          <p>Click the secure link below to authorize a new credential. This link will self-destruct in 15 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #06b6d4; color: #020617; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 12px;">
            AUTHORIZE NEW PASSWORD
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not initiate this request, safely ignore this transmission.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    return { success: false, error: "Failed to dispatch security email." };
  }

  return { success: true };
}

export async function executePasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !token || !newPassword || !confirmPassword) {
    return { success: false, error: "Incomplete payload parameters." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Cryptographic credentials do not match." };
  }

  const identifier = `PWD_RESET_${email}`;
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });

  if (!tokenRecord) {
    return { success: false, error: "Invalid or consumed security token." };
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return { success: false, error: "Security token has expired." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  return { success: true };
}
