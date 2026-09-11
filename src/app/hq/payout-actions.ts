"use server";

import prisma from "../../lib/prisma";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

export async function executePaystackPayout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Security Update: Now allows both SUPER_ADMIN and SUPERVISOR
  if (!admin || !["SUPER_ADMIN", "SUPERVISOR"].includes(admin.role)) {
    return { success: false, error: "Financial execution clearance required." };
  }

  const payoutId = formData.get("payoutId") as string;

  if (!payoutId) {
    return { success: false, error: "Missing required execution parameters." };
  }

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      organizer: true,
    },
  });

  if (!payout || payout.status === "COMPLETED") {
    return { success: false, error: "Payout invalid or already processed." };
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return { success: false, error: "Paystack secret key is missing." };
  }

  try {
    const recipientRes = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type:
            payout.organizer.payoutMethod === "BANK" ? "nuban" : "mobile_money",
          name:
            payout.organizer.payoutAccountName ||
            `${payout.organizer.firstName} ${payout.organizer.lastName}`,
          account_number: payout.organizer.payoutAccountNumber,
          bank_code: payout.organizer.payoutBankName || "MPESA",
          currency: "KES",
        }),
      },
    );

    const recipientData = await recipientRes.json();

    if (!recipientData.status) {
      return {
        success: false,
        error: `Paystack Recipient Error: ${recipientData.message}`,
      };
    }

    const recipientCode = recipientData.data.recipient_code;

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: payout.amount * 100,
        recipient: recipientCode,
        reason: `Bamba Tickets Payout - ${payout.id}`,
      }),
    });

    const transferData = await transferRes.json();

    if (!transferData.status) {
      return {
        success: false,
        error: `Paystack Transfer Error: ${transferData.message}`,
      };
    }

    const paystackReference = transferData.data.reference;

    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "COMPLETED",
        reference: paystackReference,
      },
    });

    await prisma.systemLog.create({
      data: {
        level: "WARNING",
        message: `FUNDS DISBURSED VIA PAYSTACK: Payout ID ${payoutId} executed automatically by ${admin.email}. Ref: ${paystackReference}`,
        path: "/hq/payouts",
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Bamba Tickets" <${process.env.GMAIL_USER}>`,
      to: payout.organizer.email,
      subject: "Bamba Tickets: Funds Disbursed Successfully",
      html: `
        <div style="background-color: #020617; color: #f8fafc; font-family: monospace; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #06b6d4; margin-top: 0; font-family: sans-serif; letter-spacing: 2px;">BAMBA TICKETS // PAYOUT EXECUTED</h2>
          <p>Your requested funds have been successfully disbursed to your designated account.</p>
          <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #1e293b;">
            <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> <span style="color: #06b6d4; font-weight: bold;">KES ${payout.amount.toLocaleString()}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Destination:</strong> ${payout.destination}</p>
            <p style="margin: 0 0 8px 0;"><strong>Status:</strong> COMPLETED</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${paystackReference}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Depending on your bank or mobile money provider, funds may take a few minutes to reflect in your balance.</p>
        </div>
      `,
    });

    revalidatePath("/hq");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: "Network error communicating with Paystack.",
    };
  }
}
