"use server";

import prisma from "../lib/prisma";

export async function checkInTicket(ticketCode: string) {
  try {
    if (!ticketCode) {
      return { success: false, message: "Please enter a ticket code." };
    }

    // 1. Find the ticket and include the booking/event info
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode: ticketCode.trim() },
      include: {
        tier: true,
        booking: {
          include: {
            event: true,
          },
        },
      },
    });

    // 2. If it doesn't exist
    if (!ticket) {
      return {
        success: false,
        message: "INVALID TICKET: Not found in system.",
      };
    }

    // 3. If it has already been used
    if (ticket.isUsed) {
      return {
        success: false,
        message: "ALREADY USED: This ticket was already scanned at the gate.",
      };
    }

    // 4. Mark the ticket as used!
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      message: "ACCESS GRANTED",
      ticketDetails: {
        eventTitle: ticket.booking.event.title,
        customerName: ticket.booking.customerName,
        tierName: ticket.tier.name,
      },
    };
  } catch (error) {
    console.error("Scanning Error:", error);
    return { success: false, message: "System error while scanning." };
  }
}
