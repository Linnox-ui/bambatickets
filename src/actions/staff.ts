"use server";

import prisma from "../lib/prisma";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

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

    // Verify ownership
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== session.user.id) {
      return { error: "Unauthorized." };
    }

    await prisma.eventStaff.create({
      data: { eventId, name, email, pinCode },
    });

    revalidatePath(`/studio/events/${eventId}/staff`);
    return { success: "Gate staff added successfully!" };
  } catch (error) {
    console.error("Failed to add staff:", error);
    return { error: "Failed to add gate staff." };
  }
}

// 2. REMOVE GATE STAFF (Organizer Only)
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

// 3. AUTHENTICATE GATEKEEPER (Staff PIN login)
export async function verifyGateStaffPin(eventId: string, pinCode: string) {
  try {
    const staff = await prisma.eventStaff.findFirst({
      where: { eventId, pinCode },
    });

    if (!staff) {
      return { error: "Invalid Gate PIN. Access denied." };
    }

    return { success: true, staffName: staff.name };
  } catch (error) {
    return { error: "Authentication failed." };
  }
}
