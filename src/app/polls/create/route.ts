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
    const { title, slug, candidates } = body;

    if (!title || !slug || !candidates || candidates.length < 2) {
      return NextResponse.json({ error: "Invalid data. At least 2 candidates required." }, { status: 400 });
    }

    // 2. Insert into Neon Voting Database
    const campaign = await votingPrisma.campaign.create({
      data: {
        title,
        slug,
        host_id: session.user.id, // Soft link to the ticketing user
        candidates: {
          create: candidates.map((name: string) => ({ name })),
        },
      },
    });

    return NextResponse.json({ success: true, slug: campaign.slug });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A poll with this URL slug already exists. Try another." }, { status: 400 });
    }
    console.error("Create Poll Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}