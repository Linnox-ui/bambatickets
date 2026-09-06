"use server";

import prisma from "../lib/prisma";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

// UPDATE ORGANIZER PAYOUT DETAILS
export async function updatePayoutSettings(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const payoutPhone = formData.get("payoutPhone") as string;
    const bankName = formData.get("bankName") as string;
    const accountNumber = formData.get("accountNumber") as string;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        payoutPhone,
        bankName,
        accountNumber,
      },
    });

    revalidatePath("/studio/settings");
    return { success: "Payout settings updated successfully!" };
  } catch (error) {
    console.error("Failed to update payouts:", error);
    return { error: "Failed to update payout settings." };
  }
}
