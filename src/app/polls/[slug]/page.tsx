import { notFound } from "next/navigation";
import { PrismaClient as VotingPrismaClient } from "../../../generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import VotingCard from "./VotingCard";

const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export const revalidate = 60; // Cache for 60 seconds

export default async function PublicPollPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const campaign = await votingPrisma.campaign.findUnique({
    where: { slug: slug },
    include: {
      candidates: {
        orderBy: { name: "asc" }, // Alphabetical for fairness during voting
        select: { id: true, name: true, image_url: true, total_votes: true },
      },
    },
  });

  if (!campaign || !campaign.is_active) {
    notFound();
  }

  // Pre-calculate the total votes across the whole campaign
  const totalCampaignVotes = campaign.candidates.reduce(
    (sum, cand) => sum + (cand.total_votes || 0),
    0
  );

  // Find the highest vote count to determine the current leader
  const highestVotes = Math.max(...campaign.candidates.map(c => c.total_votes || 0));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 animate-fade-in-up">
        
        {/* Navigation & Header */}
        <div className="mb-12">
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all text-xs font-bold text-slate-400 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 text-orange-500 rounded-2xl mb-6 shadow-inner border border-orange-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 wrap-break-word">
              {campaign.title}
            </h1>
            <p className="text-slate-400 text-lg">
              Select your favorite nominee below and cast your vote securely.
            </p>
          </div>
        </div>

        {/* Voting Grid */}
       <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {campaign.candidates.map((candidate) => {
            const candidateVotes = candidate.total_votes || 0;
            const isLeader = candidateVotes > 0 && candidateVotes === highestVotes;

            return (
              <VotingCard
                key={candidate.id}
                campaignId={campaign.id}
                candidateId={candidate.id}
                candidateName={candidate.name}
                imageUrl={candidate.image_url}
                // NEW PROPS PASSED DOWN
                candidateVotes={candidateVotes}
                totalCampaignVotes={totalCampaignVotes}
                isLeader={isLeader}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}