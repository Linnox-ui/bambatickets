"use server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

export async function requestOrganizerPayout(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const amountStr = formData.get("amount") as string;
    const requestedAmount = parseFloat(amountStr);

    // Hardened validation matching client-side rules
    if (isNaN(requestedAmount) || requestedAmount < 100) {
      return {
        success: false,
        error: "Invalid payout amount. Minimum is KES 100.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        payoutMethod: true,
        payoutAccountNumber: true,
        payoutBankName: true,
      },
    });

    if (!user?.payoutAccountNumber || !user?.payoutMethod) {
      return {
        success: false,
        error: "Payment destination not configured in profile.",
      };
    }

    const destinationString = `${user.payoutMethod} - ${user.payoutBankName || "Mobile Money"} - ${user.payoutAccountNumber}`;

    // Recalculating balance server-side to prevent tampering
    const bookings = await prisma.booking.aggregate({
      where: {
        event: { organizerId: session.user.id },
        status: "SUCCESS",
      },
      _sum: { organizerPayout: true },
    });

    const totalClearedRevenue = bookings._sum.organizerPayout || 0;

    const previousPayouts = await prisma.payout.aggregate({
      where: {
        organizerId: session.user.id,
        status: { in: ["COMPLETED", "PENDING", "PROCESSING"] },
      },
      _sum: { amount: true },
    });

    const totalPaidAndPending = previousPayouts._sum.amount || 0;
    const availableBalance = totalClearedRevenue - totalPaidAndPending;

    if (requestedAmount > availableBalance) {
      return {
        success: false,
        error: "Requested amount exceeds cleared balance.",
      };
    }

    await prisma.payout.create({
      data: {
        amount: requestedAmount,
        method: user.payoutMethod,
        destination: destinationString,
        organizerId: session.user.id,
        status: "PENDING",
      },
    });

    // Email dispatch is separated so a failed email doesn't roll back a successful DB write
    try {
      const hqStaff = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "SUPERVISOR"] } },
        select: { email: true },
      });

      const hqEmails = hqStaff.map((staff) => staff.email);

      if (hqEmails.length > 0) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        await transporter.sendMail({
          from: `"Bamba HQ" <${process.env.GMAIL_USER}>`,
          to: hqEmails,
          subject: `🚨 ACTION REQUIRED: KES ${requestedAmount.toLocaleString()} Payout Request`,
          html: `
            <div style="background-color: #020617; color: #f8fafc; font-family: monospace; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; margin-top: 0; font-family: sans-serif; letter-spacing: 2px;">BAMBA HQ // FINANCIAL ALERT</h2>
              <p>A new payout request requires God Mode clearance in the HQ Command Center.</p>
              <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #1e293b;">
                <p style="margin: 0 0 8px 0;"><strong>Organizer:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
                <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> <span style="color: #10b981; font-weight: bold;">KES ${requestedAmount.toLocaleString()}</span></p>
                <p style="margin: 0;"><strong>Destination:</strong> ${destinationString}</p>
              </div>
              <a href="${appUrl}/hq" style="display: inline-block; background-color: #10b981; color: #020617; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 12px; font-family: sans-serif;">
                EXECUTE PAYOUT IN HQ
              </a>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Failed to dispatch HQ financial alert:", err);
    }

    revalidatePath("/studio");
    return { success: true };
  } catch (error) {
    console.error("Critical error in requestOrganizerPayout:", error);
    return { success: false, error: "An unexpected internal error occurred." };
  }
}
