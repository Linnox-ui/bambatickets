"use server";

import { auth } from "@/src/auth";
import { votingPrisma } from "@/src/lib/voting-db";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

interface IncomingCandidate {
  id: string | null;
  name: string;
  imageUrl?: string;
}

export async function editCampaignAction(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const campaignId = formData.get("campaignId") as string;
  const title = formData.get("title") as string;
  const candidateCount = parseInt(formData.get("candidateCount") as string);

  // ✨ NEW: Extract dates
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  if (!campaignId || !title || isNaN(candidateCount) || candidateCount < 2) {
    return { error: "Invalid data. At least 2 candidates required." };
  }

  // ✨ NEW: Validate timeline
  if (endDate <= startDate) {
    return { error: "Campaign closing time must be after the start time." };
  }

  try {
    const existingCampaign = await votingPrisma.campaign.findUnique({
      where: { id: campaignId },
      select: { host_id: true, slug: true }
    });

    if (!existingCampaign || existingCampaign.host_id !== session.user.id) {
      return { error: "Forbidden. You do not own this campaign." };
    }

    const incomingCandidates: IncomingCandidate[] = [];
    
    for (let i = 0; i < candidateCount; i++) {
      const name = formData.get(`candidate_${i}_name`) as string;
      const id = formData.get(`candidate_${i}_id`) as string | null;
      const file = formData.get(`candidate_${i}_image`) as File | null;
      
      let imageUrl: string | undefined = undefined;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "bamba-voting" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        
        imageUrl = uploadResult.secure_url;
      }

      incomingCandidates.push({ id, name, imageUrl });
    }

    await votingPrisma.$transaction(async (tx) => {
      // ✨ NEW: Update Campaign Title AND Timeline
      await tx.campaign.update({
        where: { id: campaignId },
        data: { 
          title,
          start_date: startDate, // ✨ NEW
          end_date: endDate      // ✨ NEW
        },
      });

      const existingCandidates = await tx.candidate.findMany({
        where: { campaign_id: campaignId },
        select: { id: true }
      });
      const existingIds = existingCandidates.map(c => c.id);
      
      const incomingIds = incomingCandidates.map(c => c.id).filter(Boolean);
      
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id as string));
      if (idsToDelete.length > 0) {
        await tx.candidate.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      for (const cand of incomingCandidates) {
        if (cand.id) {
          await tx.candidate.update({
            where: { id: cand.id },
            data: { 
              name: cand.name,
              ...(cand.imageUrl ? { image_url: cand.imageUrl } : {}) 
            }
          });
        } else {
          await tx.candidate.create({
            data: { 
              name: cand.name, 
              image_url: cand.imageUrl || null,
              campaign_id: campaignId 
            }
          });
        }
      }
    });

    revalidatePath("/polls/dashboard");
    revalidatePath(`/polls/${existingCampaign.slug}`);
    
    return { success: true };

  } catch (error: any) {
    console.error("Edit Campaign Action Error:", error);
    return { error: error.message || "Failed to update campaign." };
  }
}