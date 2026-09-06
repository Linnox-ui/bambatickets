"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

interface CheckoutItem {
  tierId: string;
  quantity: number;
}

export async function createGuestBooking(
  eventId: string,
  items: CheckoutItem[],
  customerEmail: string,
  customerName: string,
  customerPhone: string,
) {
  try {
    if (!customerEmail || !customerName || !customerPhone) {
      return {
        error: "Please provide your name, email, and phone/WhatsApp number.",
      };
    }

    // 1. Fetch event and ticket tiers
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTiers: true },
    });

    if (!event) {
      return { error: "Event not found." };
    }

    let totalAmount = 0;
    const ticketsToCreate: { tierId: string }[] = [];

    // 2. Validate quantities and calculate total
    for (const item of items) {
      if (item.quantity <= 0) continue;
      const tier = event.ticketTiers.find((t) => t.id === item.tierId);
      if (!tier) {
        return { error: "Invalid ticket tier selected." };
      }
      totalAmount += tier.price * item.quantity;

      for (let i = 0; i < item.quantity; i++) {
        ticketsToCreate.push({ tierId: tier.id });
      }
    }

    if (ticketsToCreate.length === 0) {
      return { error: "Please select at least one ticket." };
    }

    const reference = `BAMBA-FREE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Create the Booking and Tickets in Neon database instantly (Success status for now)
    const booking = await prisma.booking.create({
      data: {
        reference,
        amount: totalAmount,
        status: "SUCCESS", // Instantly confirmed since payment is bypassed for now
        customerEmail,
        customerName,
        eventId,
        tickets: {
          create: ticketsToCreate.map((t) => ({
            tierId: t.tierId,
          })),
        },
      },
      include: {
        tickets: {
          include: { tier: true },
        },
        event: true,
      },
    });

    revalidatePath(`/events/${eventId}`);

    // Return booking details so the frontend can display the success screen & ticket codes immediately
    return { success: true, booking };
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: "Something went wrong processing your ticket." };
  }
}
