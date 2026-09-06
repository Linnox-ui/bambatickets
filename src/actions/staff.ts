"use server";

import prisma from "../lib/prisma";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET_KEY = process.env.AUTH_SECRET || "fallback_bamba_secret_key";

// Helper: Native Node.js token signer (No external JWT library needed)
function signToken(payload: object): string {
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(data)
    .digest("hex");
  return Buffer.from(JSON.stringify({ data, signature })).toString("base64");
}

// Helper: Native Node.js token verifier
function verifyToken(token: string): any {
  try {
    const decodedStr = Buffer.from(token, "base64").toString("utf8");
    const { data, signature } = JSON.parse(decodedStr);
    const expectedSig = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(data)
      .digest("hex");

    if (signature !== expectedSig) return null;
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

// 1. ADD GATE STAFF (Organizer Only)
export async function addEventStaff(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const eventId = formData.get("eventId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const pinCode = formData.get("pinCode") as string;

    if (!eventId || !name || !email || !pinCode) {
      return { error: "All fields are required." };
    }

    if (pinCode.length < 4) {
      return { error: "Gate PIN must be at least 4 digits." };
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== session.user.id) {
      return { error: "Unauthorized." };
    }

    // Hash the PIN securely
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pinCode, salt);

    await prisma.eventStaff.create({
      data: { eventId, name, email, pinCode: hashedPin },
    });

    revalidatePath(`/studio/events/${eventId}/staff`);
    return { success: "Gate staff added successfully!" };
  } catch (error) {
    console.error("Failed to add staff:", error);
    return { error: "Failed to add gate staff." };
  }
}

// 2. REMOVE GATE STAFF
export async function removeEventStaff(staffId: string, eventId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== session.user.id) {
      return { error: "Unauthorized." };
    }

    await prisma.eventStaff.delete({ where: { id: staffId } });

    revalidatePath(`/studio/events/${eventId}/staff`);
    return { success: "Staff member removed." };
  } catch (error) {
    return { error: "Failed to remove staff." };
  }
}

// 3. SECURE GATEKEEPER LOGIN (Using Native Crypto & HTTP-Only Cookies)
export async function verifyGateStaffPin(eventId: string, pinCode: string) {
  try {
    const staffList = await prisma.eventStaff.findMany({
      where: { eventId },
    });

    let matchedStaff = null;

    for (const staff of staffList) {
      const isMatch = await bcrypt.compare(pinCode, staff.pinCode);
      if (isMatch) {
        matchedStaff = staff;
        break;
      }
    }

    if (!matchedStaff) {
      return { error: "Invalid Gate PIN. Access denied." };
    }

    // Generate native secure token
    const token = signToken({
      staffId: matchedStaff.id,
      name: matchedStaff.name,
      eventId,
      exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    });

    const cookieStore = await cookies();
    cookieStore.set(`gate_session_${eventId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12,
      path: `/scan/${eventId}`,
    });

    return { success: true, staffName: matchedStaff.name };
  } catch (error) {
    console.error("Auth error:", error);
    return { error: "Authentication failed." };
  }
}

// 4. CHECK GATE SESSION
export async function checkGateSession(eventId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(`gate_session_${eventId}`)?.value;

    if (!token) return { isAuthenticated: false };

    const decoded = verifyToken(token);
    if (!decoded || decoded.eventId !== eventId || decoded.exp < Date.now()) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, staffName: decoded.name };
  } catch (err) {
    return { isAuthenticated: false };
  }
}

// 5. LOCK GATE (Logout) - Fixed with exact path and maxAge: 0
export async function logoutGateStaff(eventId: string) {
  const cookieStore = await cookies();
  cookieStore.set(`gate_session_${eventId}`, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: `/scan/${eventId}`,
  });
}
