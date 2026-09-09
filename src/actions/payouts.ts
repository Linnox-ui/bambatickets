"use server";

import { auth } from "../auth";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function savePayoutSettings(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "Unauthorized access." };
  }

  const method = formData.get("method") as string;
  const accountName = formData.get("accountName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const bankName = formData.get("bankName") as string;

  if (!method || !accountName || !accountNumber) {
    return { error: "Missing required fields." };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        payoutMethod: method,
        payoutAccountName: accountName,
        payoutAccountNumber: accountNumber,
        payoutBankName: method === "BANK" ? bankName : null,
      },
    });

    revalidatePath("/studio/payouts");
    return {
      success: true,
      data: {
        payoutMethod: updatedUser.payoutMethod,
        payoutAccountName: updatedUser.payoutAccountName,
        payoutAccountNumber: updatedUser.payoutAccountNumber,
        payoutBankName: updatedUser.payoutBankName,
      },
    };
  } catch (error) {
    return { error: "Failed to update payout network. Try again." };
  }
}
