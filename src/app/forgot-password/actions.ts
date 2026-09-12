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
      from: `"Bamba Tickets" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Bamba Tickets: Password Reset Request",
      html: `
        <div style="background-color: #020617; color: #f8fafc; font-family: monospace; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #f97316; margin-top: 0;">BAMBA TICKETS // SECURITY UPDATE</h2>
          <p>A password reset was requested for the account: <strong>${user.email}</strong></p>
          <p>Click the secure link below to create a new password. This link will expire in 15 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #f97316; color: #020617; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 12px;">
            RESET MY PASSWORD
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    return {
      success: false,
      error: "Failed to send reset email. Please try again.",
    };
  }

  return { success: true };
}

export async function executePasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !token || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
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
