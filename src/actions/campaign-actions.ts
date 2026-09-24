"use server";

import { auth } from "@/src/auth";
import { votingPrisma } from "@/src/lib/voting-db";
import { revalidatePath } from "next/cache";

export async function deleteCampaignAction(campaignId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  try {
    // SECURITY VERIFICATION: Ensure the campaign belongs to the logged-in user
    const campaign = await votingPrisma.campaign.findUnique({
      where: { id: campaignId },
      select: { host_id: true },
    });

    if (!campaign) {
      return { error: "Campaign not found." };
    }

    if (campaign.host_id !== session.user.id) {
      return { error: "Forbidden. You do not own this campaign." };
    }

    // Delete the campaign (Cascading delete will remove candidates/votes if configured in Prisma schema)
    await votingPrisma.campaign.delete({
      where: { id: campaignId },
    });

    // Instantly refresh the dashboard page
    revalidatePath("/polls/dashboard");
    return { success: true };
    
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return { error: "An unexpected error occurred while deleting." };
  }
}