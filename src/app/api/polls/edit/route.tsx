import { NextResponse } from "next/server";
import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import { auth } from "@/src/auth"; 

const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    // 1. Verify Ticketing Identity
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, title, candidates } = body;

    if (!campaignId || !title || !candidates || candidates.length < 2) {
      return NextResponse.json({ error: "Invalid data. At least 2 candidates required." }, { status: 400 });
    }

    // 2. Verify Campaign Ownership
    const existingCampaign = await votingPrisma.campaign.findUnique({
      where: { id: campaignId },
      select: { host_id: true }
    });

    if (!existingCampaign || existingCampaign.host_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden. You do not own this campaign." }, { status: 403 });
    }

    // 3. Database Transaction (Atomic update)
    await votingPrisma.$transaction(async (tx) => {
      // Update Campaign Title
      await tx.campaign.update({
        where: { id: campaignId },
        data: { title },
      });

      // Get existing candidates from the database
      const existingCandidates = await tx.candidate.findMany({
        where: { campaign_id: campaignId },
        select: { id: true }
      });
      const existingIds = existingCandidates.map(c => c.id);

      // Extract incoming IDs to see who was kept
      const incomingIds = candidates.map((c: any) => c.id).filter(Boolean);
      
      // Delete candidates that were removed from the UI
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (idsToDelete.length > 0) {
        await tx.candidate.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      // Update existing names or create new candidates
      for (const cand of candidates) {
        if (cand.id) {
          // Existing candidate: Update name
          await tx.candidate.update({
            where: { id: cand.id },
            data: { name: cand.name }
          });
        } else {
          // New candidate added during edit: Create
          await tx.candidate.create({
            data: { 
              name: cand.name, 
              campaign_id: campaignId 
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Edit Poll Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}