"use server";

import prisma from "../../lib/prisma";
import { auth } from "../../auth";

export async function upgradeToOrganizer(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const payoutMethod = formData.get("payoutMethod") as string;
  const payoutAccountName = formData.get("payoutAccountName") as string;
  const payoutAccountNumber = formData.get("payoutAccountNumber") as string;
  const payoutBankName = (formData.get("payoutBankName") as string) || null;

  if (!payoutMethod || !payoutAccountName || !payoutAccountNumber) {
    return { success: false, error: "Missing required payout parameters." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "ORGANIZER",
        payoutMethod,
        payoutAccountName,
        payoutAccountNumber,
        payoutBankName,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to upgrade account." };
  }
}
