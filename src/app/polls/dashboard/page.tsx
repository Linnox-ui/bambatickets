import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import { BarChart3, Plus, ExternalLink, Trophy, Users } from "lucide-react";

const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export const dynamic = "force-dynamic";

export default async function HostPollsDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/polls/dashboard");
  }

  const myCampaigns = await votingPrisma.campaign.findMany({
    where: { host_id: session.user.id },
    orderBy: { created_at: "desc" },
    include: {
      candidates: {
        orderBy: { total_votes: "desc" }, 
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-500/30 selection:text-orange-50">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `,
        }}
      />

      <div className="max-w-4xl mx-auto animate-fade-in-up">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-12 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                Voting Analytics
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-mono uppercase tracking-widest">
                Host Dashboard
              </p>
            </div>
          </div>
          <Link
            href="/polls/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] whitespace-nowrap shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </Link>
        </div>

        {/* Empty State */}
        {myCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-800">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <Trophy className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-slate-300 text-lg font-medium">You haven't launched any polls yet.</p>
            <p className="text-sm text-slate-500 mt-2 mb-8">Create your first community award to see live analytics here.</p>
            <Link
              href="/polls/new"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Campaign
            </Link>
          </div>
        ) : (
          /* Campaigns List */
          <div className="space-y-8">
            {myCampaigns.map((campaign, index) => {
              const totalCampaignVotes = campaign.candidates.reduce(
                (sum, candidate) => sum + (candidate.total_votes || 0),
                0
              );

              return (
                <div 
                  key={campaign.id} 
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-600 group-hover:via-orange-400 group-hover:to-orange-600 transition-all duration-700" />

                  <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-800/60 pb-6 mb-6 gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-xl sm:text-2xl font-black text-white truncate wrap-break-word">
                          {campaign.title}
                        </h2>
                        {campaign.is_active ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20 shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-700 shrink-0">
                            Closed
                          </span>
                        )}
                      </div>
                      
                      <Link 
                        href={`/polls/${campaign.slug}`} 
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all font-mono group/link max-w-full overflow-hidden"
                      >
                        <span className="truncate">bambatickets.com/polls/{campaign.slug}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                      <div>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> Nominees
                        </p>
                        <p className="text-2xl font-black text-white">{campaign.candidates.length}</p>
                      </div>
                      <div className="w-px h-10 bg-slate-800" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Trophy className="w-3 h-3 text-orange-500" /> Total Votes
                        </p>
                        <p className="text-2xl font-black text-orange-400">{totalCampaignVotes.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {campaign.candidates.map((candidate, idx) => {
                      const candidateVotes = candidate.total_votes || 0;
                      const percentage = totalCampaignVotes > 0 
                        ? Math.round((candidateVotes / totalCampaignVotes) * 100) 
                        : 0;

                      const isLeader = idx === 0 && candidateVotes > 0;

                      return (
                        <div key={candidate.id} className="relative">
                          <div className="flex justify-between items-end mb-2 text-sm">
                            <div className="flex items-center gap-3 min-w-0">
                              {candidate.image_url ? (
                                <img 
                                  src={candidate.image_url} 
                                  alt={candidate.name} 
                                  className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-slate-400 uppercase">{candidate.name.charAt(0)}</span>
                                </div>
                              )}
                              <span className="font-bold text-slate-200 truncate">{candidate.name}</span>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <span className="font-black text-white text-base mr-2">{percentage}%</span>
                              <span className="font-mono text-slate-500 text-xs">
                                ({candidateVotes.toLocaleString()} votes)
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                                isLeader ? "bg-linear-to-r from-orange-600 to-orange-400" : "bg-slate-700"
                              }`}
                              style={{ width: `${percentage}%` }}
                            >
                              {isLeader && (
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}