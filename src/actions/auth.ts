"use server";

import prisma from "../lib/prisma";
// Note: You will need to install bcryptjs: npm install bcryptjs @types/bcryptjs
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const roleType = formData.get("roleType") as string; // "CUSTOMER" or "ORGANIZER"

  if (!firstName || !lastName || !email || !password || !phone) {
    return { error: "All fields are required." };
  }

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email is already registered." };
  }

  // 2. Hash the password securely
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create the user in the database
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

  // 4. Generate Email Verification Token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  // 5. TODO: Trigger Email Service (e.g., Resend, AWS SES) here
  // sendVerificationEmail(email, token);

  return { success: true, email: user.email };
}
