"use server";

import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

interface CheckoutItemInput {
  tierId: string;
  quantity: number;
}

interface LockedTier {
  id: string;
  price: number;
  capacity: number;
  name: string;
  eventId: string;
}

const FEE_PERCENTAGE = 0.055; // 5.5% platform fee
const MAX_TICKETS_PER_ORDER = 20;

class CheckoutError extends Error {}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function initializeCheckout(
  eventId: string,
  itemsParam: string,
  formData: FormData,
) {
  const customerName = (formData.get("customerName") as string)?.trim();
  const customerEmail = (formData.get("customerEmail") as string)
    ?.trim()
    .toLowerCase();

  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
  }
  if (!isValidEmail(customerEmail)) {
    return { error: "Please provide a valid email address." };
  }

  const rawItems: CheckoutItemInput[] = itemsParam
    .split(",")
    .map((item) => {
      const [tierId, qty] = item.split(":");
      return { tierId, quantity: parseInt(qty, 10) };
    })
    .filter((i) => i.tierId && Number.isFinite(i.quantity) && i.quantity > 0);

  if (rawItems.length === 0) {
    return { error: "No valid tickets selected." };
  }

  // Merge duplicate tierId entries
  const mergedItems = new Map<string, number>();
  for (const item of rawItems) {
    mergedItems.set(
      item.tierId,
      (mergedItems.get(item.tierId) ?? 0) + item.quantity,
    );
  }

  const totalRequested = [...mergedItems.values()].reduce((a, b) => a + b, 0);
  if (totalRequested > MAX_TICKETS_PER_ORDER) {
    return {
      error: `You can order at most ${MAX_TICKETS_PER_ORDER} tickets at a time.`,
    };
  }

  let bookingId: string | null = null;
  let bookingReference: string | null = null;
  let totalCharge = 0;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new CheckoutError("Event not found.");
      if (!event.isPublished) {
        throw new CheckoutError("This event is not available for booking.");
      }

      let subtotal = 0;
      const ticketCreations: { tierId: string }[] = [];

      for (const [tierId, quantity] of mergedItems) {
        const rows = await tx.$queryRaw(
          Prisma.sql`SELECT id, price, capacity, name, "eventId" FROM ticket_tiers WHERE id = ${tierId} FOR UPDATE`,
        );
        const tier = (rows as LockedTier[])[0];

        if (!tier || tier.eventId !== eventId) {
          throw new CheckoutError("Invalid ticket tier selected.");
        }

        const soldCount = await tx.ticket.count({ where: { tierId } });
        if (soldCount + quantity > tier.capacity) {
          throw new CheckoutError(
            `Only ${Math.max(tier.capacity - soldCount, 0)} ticket(s) left for "${tier.name}".`,
          );
        }

        subtotal += Number(tier.price) * quantity;
        for (let i = 0; i < quantity; i++) ticketCreations.push({ tierId });
      }

      subtotal = round2(subtotal);
      const platformFee = round2(subtotal * FEE_PERCENTAGE);
      const charge =
        event.feeBearer === "ATTENDEE"
          ? round2(subtotal + platformFee)
          : subtotal;
      const payout =
        event.feeBearer === "ATTENDEE"
          ? subtotal
          : round2(subtotal - platformFee);

      const reference = `BAMBA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const booking = await tx.booking.create({
        data: {
          reference,
          amount: charge,
          platformFee,
          organizerPayout: payout,
          status: "PENDING",
          customerEmail,
          customerName,
          eventId,
          tickets: { create: ticketCreations },
        },
      });

      return { booking, charge };
    });

    bookingId = result.booking.id;
    bookingReference = result.booking.reference;
    totalCharge = result.charge;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      await cleanupFailedBooking(bookingId);
      return {
        error: "Server configuration error: Paystack secret key is missing.",
      };
    }

    // Paystack requires integer subunit (cents/kobo)
    const amountInSubunits = Math.round(totalCharge * 100);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: amountInSubunits,
          currency: "KES",
          reference: bookingReference,
          channels: ["mobile_money", "card"],
          metadata: {
            customer_name: customerName,
            booking_id: bookingId,
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack Init Error Details:", paystackData);
      await cleanupFailedBooking(bookingId);
      return {
        error: paystackData.message || "Failed to initialize payment gateway.",
      };
    }

    return {
      success: true,
      reference: bookingReference,
      access_code: paystackData.data.access_code,
    };
  } catch (err) {
    if (err instanceof CheckoutError) {
      return { error: err.message };
    }
    console.error("Checkout transaction error:", err);
    if (bookingId) await cleanupFailedBooking(bookingId).catch(() => {});
    return { error: "An unexpected error occurred during checkout." };
  }
}

async function cleanupFailedBooking(bookingId: string) {
  await prisma.booking.deleteMany({
    where: { id: bookingId, status: "PENDING" },
  });
}
