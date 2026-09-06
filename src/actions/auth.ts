"use server";

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

export async function registerAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // FIX: Using passwordHash from your schema, and assigning ORGANIZER role
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        role: "ORGANIZER",
      },
    });

    return { success: "Account created successfully! You can now log in." };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: "Logged in successfully." };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong during login." };
      }
    }
    throw error;
  }
}
