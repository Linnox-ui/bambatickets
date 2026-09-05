"use server";

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required" };
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists" };
    }

    // 2. Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create the user in the Neon database
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        // Role defaults to CUSTOMER as defined in our Prisma schema
      },
    });

    return { success: "Account created successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration" };
  }
}

export async function loginUser(formData: FormData) {
  try {
    // This will securely authenticate the user and set the session cookie
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong during login." };
      }
    }
    // In Next.js, successful redirects are actually thrown as errors.
    // We MUST rethrow non-AuthErrors so the redirect to the homepage works!
    throw error;
  }
}
