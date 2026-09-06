"use server";

import prisma from "../lib/prisma";
import axios from "axios";
import { auth } from "../auth"; // Import auth to get the logged-in user

export async function initializeCheckout(formData: FormData) {
  try {
    // 1. Get the current logged-in user (if any)
    const session = await auth();
    const buyerId = session?.user?.id || null;

    const eventId = formData.get("eventId") as string;
    const tierId = formData.get("tierId") as string;
    const customerEmail = formData.get("email") as string;
    const customerName = formData.get("name") as string;
    const quantityStr = formData.get("quantity") as string;
    const quantity = parseInt(quantityStr, 10) || 1;

    if (!eventId || !tierId || !customerEmail || !customerName) {
      return { error: "Please fill out all required fields." };
    }

    const tier = await prisma.ticketTier.findUnique({
      where: { id: tierId },
      include: { event: true },
    });

    if (!tier || tier.eventId !== eventId) {
      return { error: "Invalid ticket selection." };
    }

    if (tier.capacity < quantity) {
      return { error: "Not enough tickets remaining in this tier." };
    }

    const totalAmountKsh = tier.price * quantity;
    const amountInCents = Math.round(totalAmountKsh * 100);

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return { error: "Paystack secret key is missing on the server." };
    }

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: customerEmail,
        amount: amountInCents,
        currency: "KES",
        metadata: {
          eventId,
          tierId,
          customerName,
          quantity,
          buyerId, // <-- SECURELY PASS THE LOGGED-IN USER ID!
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (paystackResponse.data && paystackResponse.data.status) {
      return {
        success: true,
        accessCode: paystackResponse.data.data.access_code,
        reference: paystackResponse.data.data.reference,
      };
    } else {
      const errorMsg =
        paystackResponse.data?.message ||
        "Failed to initialize payment gateway.";
      return { error: errorMsg };
    }
  } catch (error: any) {
    console.error(
      "Checkout Initialization Error:",
      error?.response?.data || error,
    );
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong setting up your payment.";

    return {
      error:
        typeof errorMessage === "string"
          ? errorMessage
          : "Payment initialization failed.",
    };
  }
}

export async function verifyPayment(reference: string) {
  try {
    if (!reference) {
      return { error: "Transaction reference is missing." };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return { error: "Paystack secret key is missing." };
    }

    // 1. Verify transaction with Paystack API
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      },
    );

    const transaction = verifyResponse.data?.data;

    if (!verifyResponse.data?.status || transaction?.status !== "success") {
      return { error: "Payment verification failed or was not successful." };
    }

    // Extract the buyerId we secretly passed in the metadata!
    const { eventId, tierId, customerName, quantity, buyerId } =
      transaction.metadata;
    const customerEmail = transaction.customer.email;
    const totalPaid = transaction.amount / 100;

    const existingBooking = await prisma.booking.findFirst({
      where: { reference },
    });

    if (existingBooking) {
      return { success: true, bookingId: existingBooking.id };
    }

    // 3. Create Booking and Tickets securely inside a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          eventId,
          customerName,
          customerEmail,
          amount: totalPaid,
          reference,
          status: "SUCCESS",
          buyerId: buyerId || null, // <-- LINK IT TO THE ACCOUNT HERE!
        },
      });

      const ticketCreations = [];
      for (let i = 0; i < quantity; i++) {
        ticketCreations.push(
          tx.ticket.create({
            data: {
              bookingId: newBooking.id,
              tierId: tierId,
            },
          }),
        );
      }

      await Promise.all(ticketCreations);
      return newBooking;
    });

    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error(
      "Payment Verification Error:",
      error?.response?.data || error,
    );
    return { error: "Failed to verify payment and generate tickets." };
  }
}
