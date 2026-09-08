"use server";

import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { sendVerificationEmail } from "../lib/mail";

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleType = formData.get("roleType") as string;

  if (!firstName || !lastName || !email || !password || !phone) {
    return { error: "All fields are required." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email is already registered." };
  }
  const existingPhone = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });
  if (existingPhone) {
    return { error: "This phone number is already in use by another account." };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phoneNumber: phone,
      passwordHash,
      role: roleType === "ORGANIZER" ? "ORGANIZER" : "CUSTOMER",
    },
  });

  const code = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  });

  await sendVerificationEmail(user.email, code, user.firstName);

  return { success: true, email: user.email };
}

export async function verifyEmailToken(code: string, email: string) {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { token: code, identifier: email },
  });

  if (!existingToken) {
    return { error: "Invalid authorization code. Please try again." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return {
      error: "This code has expired. Please request a new one.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User account not found." };
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({
    where: { token: existingToken.token },
  });

  return { success: true };
}
