"use server";

import { auth } from "@/src/auth";
import { votingPrisma } from "@/src/lib/voting-db";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

interface NewCandidate {
  name: string;
  imageUrl?: string;
}

export async function createCampaignAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const candidateCount = parseInt(formData.get("candidateCount") as string);
  
  // ✨ NEW: Extract dates
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  if (!title || !slug || isNaN(candidateCount) || candidateCount < 2) {
    return { error: "Invalid data. At least 2 candidates required." };
  }

  // ✨ NEW: Validate timeline
  if (endDate <= startDate) {
    return { error: "Campaign closing time must be after the start time." };
  }

  try {
    const existingCampaign = await votingPrisma.campaign.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (existingCampaign) {
      return { error: "A poll with this URL slug already exists. Try another." };
    }

    const newCandidates: NewCandidate[] = [];

    for (let i = 0; i < candidateCount; i++) {
      const name = formData.get(`candidate_${i}_name`) as string;
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

      newCandidates.push({ name, imageUrl });
    }

    const campaign = await votingPrisma.campaign.create({
      data: {
        title,
        slug,
        host_id: session.user.id,
        start_date: startDate, // ✨ NEW
        end_date: endDate,     // ✨ NEW
        candidates: {
          create: newCandidates.map(c => ({
            name: c.name,
            image_url: c.imageUrl || null,
          })),
        },
      },
    });

    revalidatePath("/polls/dashboard");
    revalidatePath("/polls");

    return { success: true, slug: campaign.slug };

  } catch (error: any) {
    console.error("Create Campaign Action Error:", error);
    return { error: "An unexpected error occurred while creating the campaign." };
  }
}