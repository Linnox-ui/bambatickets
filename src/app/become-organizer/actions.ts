"use server";

import prisma from "../../lib/prisma";
import { auth } from "../../auth";

export async function upgradeToOrganizer() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "ORGANIZER",
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to upgrade account." };
  }
}
