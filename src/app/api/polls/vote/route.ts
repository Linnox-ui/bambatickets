import { NextResponse } from "next/server";
import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, candidateId, userEmail, deviceHash, turnstileToken } = body;

    // 1. Basic Validation
    if (!campaignId || !candidateId || !userEmail || !deviceHash || !turnstileToken) {
      return NextResponse.json({ error: "Missing required voting data." }, { status: 400 });
    }

    // 2. Cloudflare Turnstile Bot Verification
    // This makes a server-to-server call to Cloudflare to verify the token is legitimate
    const turnstileVerify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
    });
    
    const turnstileResult = await turnstileVerify.json();
    
    if (!turnstileResult.success) {
      return NextResponse.json({ error: "Security check failed. We suspect bot activity." }, { status: 403 });
    }

    // 3. Check if the Campaign is still active
    const campaign = await votingPrisma.campaign.findUnique({
      where: { id: campaignId },
      select: { is_active: true }
    });

    if (!campaign || !campaign.is_active) {
      return NextResponse.json({ error: "This voting campaign is closed." }, { status: 400 });
    }

    // 4. Pre-check for duplicate votes (The "One Vote Per Person" rule)
    const existingVote = await votingPrisma.vote.findFirst({
      where: {
        campaign_id: campaignId,
        OR: [
          { user_email: userEmail },
          { device_hash: deviceHash }
        ]
      }
    });

    if (existingVote) {
      if (existingVote.user_email === userEmail) {
        return NextResponse.json({ error: "An account with this email has already voted." }, { status: 403 });
      }
      if (existingVote.device_hash === deviceHash) {
        return NextResponse.json({ error: "A vote has already been cast from this device." }, { status: 403 });
      }
    }

    // 5. Execute the Secure Transaction
    // This ensures the vote is created AND the total is incremented simultaneously
    await votingPrisma.$transaction([
      votingPrisma.vote.create({
        data: {
          campaign_id: campaignId,
          candidate_id: candidateId,
          user_email: userEmail,
          device_hash: deviceHash,
        }
      }),
      votingPrisma.candidate.update({
        where: { id: candidateId },
        data: {
          total_votes: {
            increment: 1
          }
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Vote recorded securely." });

  } catch (error: any) {
    console.error("Vote API Error:", error);
    
    // Safety net for database race conditions
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "You have already voted in this campaign." }, { status: 403 });
    }
    
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}