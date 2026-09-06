"use server";

import prisma from "../lib/prisma";

interface CheckoutItemInput {
  tierId: string;
  quantity: number;
}

export async function initializeCheckout(
  eventId: string,
  itemsParam: string,
  formData: FormData,
) {
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;

  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
  }

  const items: CheckoutItemInput[] = itemsParam
    .split(",")
    .map((item) => {
      const [tierId, qty] = item.split(":");
      return { tierId, quantity: parseInt(qty, 10) };
    })
    .filter((i) => i.tierId && i.quantity > 0);

  if (items.length === 0) {
    return { error: "No valid tickets selected." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { ticketTiers: true },
  });

  if (!event) return { error: "Event not found." };

  let grossAmount = 0;
  const ticketCreations: { tierId: string }[] = [];

  for (const item of items) {
    const tier = event.ticketTiers.find((t) => t.id === item.tierId);
    if (!tier) return { error: "Invalid ticket tier selected." };

    grossAmount += tier.price * item.quantity;
    for (let i = 0; i < item.quantity; i++) {
      ticketCreations.push({ tierId: tier.id });
    }
  }

  const platformFee = grossAmount * 0.05; // 5% platform fee
  const organizerPayout = grossAmount - platformFee;
  const reference = `BAMBA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // 1. Create Booking in PENDING state with nested tickets in database
  await prisma.booking.create({
    data: {
      reference,
      amount: grossAmount,
      platformFee,
      organizerPayout,
      status: "PENDING",
      customerEmail,
      customerName,
      eventId,
      tickets: {
        create: ticketCreations.map((tc) => ({
          tierId: tc.tierId,
          isUsed: false,
        })),
      },
    },
  });

  // 2. Return payment details to client to trigger popup
  return {
    success: true,
    reference,
    amountInCents: Math.round(grossAmount * 100),
    customerEmail,
    customerName,
  };
}
