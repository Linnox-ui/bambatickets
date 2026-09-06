"use server";

import prisma from "../lib/prisma";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration (picks up CLOUDINARY_URL from .env automatically)
cloudinary.config({
  secure: true,
});

// ==========================================
// 1. CREATE EVENT (With Cloudinary)
// ==========================================
export async function createEvent(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to create an event." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const dateString = formData.get("date") as string;
    const timeString = formData.get("time") as string;
    const tiersJson = formData.get("tiers") as string;
    const imageFile = formData.get("imageFile") as File;

    if (!title || !location || !dateString || !timeString || !tiersJson) {
      return { error: "Missing required fields." };
    }

    const eventDate = new Date(`${dateString}T${timeString}:00`);

    let parsedTiers;
    try {
      parsedTiers = JSON.parse(tiersJson);
    } catch (e) {
      return { error: "Invalid ticket tiers data." };
    }

    if (parsedTiers.length === 0) {
      return { error: "Please add at least one ticket tier." };
    }

    // Upload Image to Cloudinary directly from memory
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 10 * 1024 * 1024) {
        return { error: "File size exceeds the 10MB limit." };
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      const fileUri = `data:${imageFile.type};base64,${base64Data}`;

      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "bamba_studio",
      });

      imageUrl = uploadResponse.secure_url;
    }

    // Save to Neon Postgres
    await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: eventDate,
        imageUrl,
        isPublished: true,
        organizerId: session.user.id,
        ticketTiers: {
          create: parsedTiers.map(
            (tier: { name: string; price: string; capacity: string }) => ({
              name: tier.name,
              price: parseFloat(tier.price) || 0,
              capacity: parseInt(tier.capacity, 10) || 100,
            }),
          ),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/studio");
    return { success: "Event published successfully!" };
  } catch (error) {
    console.error("Server Action Error in createEvent:", error);
    return { error: "An error occurred while creating the event." };
  }
}

// ==========================================
// 2. DELETE EVENT (SECURED)
// ==========================================
export async function deleteEvent(eventId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "You must be logged in." };

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizerId !== session.user.id) {
      return { error: "Unauthorized or event not found." };
    }

    // 🚀 SECURITY CHECK: Are there any sold tickets?
    const soldTicketsCount = await prisma.booking.count({
      where: { eventId, status: "SUCCESS" },
    });

    if (soldTicketsCount > 0) {
      return {
        error:
          "Cannot delete this event because tickets have already been sold. Please cancel the event and refund buyers first.",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Safe to delete everything since no real sales happened
      const bookings = await tx.booking.findMany({
        where: { eventId },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      if (bookingIds.length > 0) {
        await tx.ticket.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });
      }

      await tx.booking.deleteMany({ where: { eventId } });
      await tx.ticketTier.deleteMany({ where: { eventId } });
      await tx.event.delete({ where: { id: eventId } });
    });

    revalidatePath("/");
    revalidatePath("/studio");
    return { success: "Event deleted successfully." };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { error: "Failed to delete event." };
  }
}

// ==========================================
// 3. UPDATE EVENT & TIERS
// ==========================================
export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "You must be logged in." };

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== session.user.id) {
      return { error: "Unauthorized or event not found." };
    }

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const tiersJson = formData.get("tiers") as string;

    if (!title || !location || !dateStr || !timeStr || !tiersJson) {
      return { error: "Please fill out all required fields." };
    }

    const parsedTiers = JSON.parse(tiersJson);
    if (parsedTiers.length === 0)
      return { error: "Event must have at least one ticket tier." };

    const eventDate = new Date(`${dateStr}T${timeStr}:00`);

    // 🚀 USE A TRANSACTION TO SAFELY UPDATE EVENT AND TIERS
    await prisma.$transaction(async (tx) => {
      // 1. Update basic event details
      await tx.event.update({
        where: { id: eventId },
        data: { title, location, description, date: eventDate },
      });

      const incomingTierIds = parsedTiers.map((t: any) => t.id).filter(Boolean);
      const existingTiers = await tx.ticketTier.findMany({
        where: { eventId },
      });

      // 2. Delete removed tiers (Only if they have NO sold tickets)
      for (const existingTier of existingTiers) {
        if (!incomingTierIds.includes(existingTier.id)) {
          const soldCount = await tx.ticket.count({
            where: { tierId: existingTier.id, booking: { status: "SUCCESS" } },
          });

          if (soldCount > 0) {
            throw new Error(
              `Cannot delete tier '${existingTier.name}' because tickets have already been sold.`,
            );
          }
          await tx.ticketTier.delete({ where: { id: existingTier.id } });
        }
      }

      // 3. Update existing tiers and Create new ones
      for (const tier of parsedTiers) {
        if (tier.id) {
          await tx.ticketTier.update({
            where: { id: tier.id },
            data: {
              name: tier.name,
              price: Number(tier.price),
              capacity: Number(tier.capacity),
            },
          });
        } else {
          await tx.ticketTier.create({
            data: {
              eventId,
              name: tier.name,
              price: Number(tier.price),
              capacity: Number(tier.capacity),
            },
          });
        }
      }
    });

    revalidatePath("/");
    revalidatePath(`/studio/events/${eventId}`);
    return { success: "Event updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    // Return the specific error message if it's our custom tier deletion error
    return { error: error.message || "Failed to update event." };
  }
}
