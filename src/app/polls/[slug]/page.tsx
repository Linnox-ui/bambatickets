import { notFound } from "next/navigation";
import { PrismaClient as VotingPrismaClient } from "../../../generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Crown } from "lucide-react";
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
  
  // Identify the leading candidate(s) safely
  const leader = campaign.candidates.find(c => c.total_votes === highestVotes);
  
  // Calculate the leader's percentage of the total votes
  const leaderPercentage = totalCampaignVotes > 0 
    ? Math.round((highestVotes / totalCampaignVotes) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 animate-fade-in-up">
        
        {/* Navigation */}
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all text-xs font-bold text-slate-400 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>

        {/* --- ENHANCED HEADER & ANALYTICS STRIP --- */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          
          <div className="relative group inline-block mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-400 drop-shadow-sm relative z-10 transition-transform duration-500 hover:scale-[1.02] wrap-break-word">
              {campaign.title}
            </h1>
          </div>
          
          <p className="text-slate-400 text-lg sm:text-xl font-medium mb-8">
            Select your favorite nominee below and cast your vote securely.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-2xl backdrop-blur-md shadow-inner">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Nominees</span>
                <span className="text-lg font-black text-slate-200 leading-none">{campaign.candidates.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-2xl backdrop-blur-md shadow-inner">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Total Votes</span>
                <span className="text-lg font-black text-slate-200 leading-none">{totalCampaignVotes.toLocaleString()}</span>
              </div>
            </div>

            {totalCampaignVotes > 0 && leader && (
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-5 py-3 rounded-2xl backdrop-blur-md shadow-inner">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Current Leader</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-200 leading-none truncate max-w-30">
                      {leader.name.split(" ")[0]}
                    </span>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
                      {leaderPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --------------------------------------- */}

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