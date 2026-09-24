import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { votingPrisma } from "@/src/lib/voting-db"; 
import CampaignActionsMenu from "@/src/components/CampaignActionsMenu";

import { 
  BarChart3, Plus, ExternalLink, Trophy, Users, 
  Calendar, CircleDot
} from "lucide-react";

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

      <div className="max-w-5xl mx-auto animate-fade-in-up">
        
        {/* --- PREMIUM DASHBOARD HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-800/80 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-linear-to-br from-orange-500/20 to-orange-600/5 text-orange-500 rounded-3xl border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <p className="text-slate-400 text-xs sm:text-sm font-mono uppercase tracking-widest mb-1">
                Command Center
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Voting Analytics
              </h1>
            </div>
          </div>
          
          <Link
            href="/polls/new"
            className="group inline-flex items-center gap-2 px-6 py-4 bg-slate-100 hover:bg-white text-slate-950 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] whitespace-nowrap shrink-0 w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
            New Campaign
          </Link>
        </div>

        {/* --- EMPTY STATE --- */}
        {myCampaigns.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-800 shadow-2xl">
            <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
              <Trophy className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-slate-200 text-2xl font-black mb-2">No active campaigns</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Launch your first community award or election poll to start gathering verified votes and real-time analytics.
            </p>
            <Link
              href="/polls/new"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold uppercase tracking-widest rounded-2xl transition-all border border-slate-700 hover:border-slate-600 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create Your First Poll
            </Link>
          </div>
        ) : (
          
          /* --- CAMPAIGNS GRID --- */
          <div className="space-y-10">
            {myCampaigns.map((campaign, index) => {
              const totalCampaignVotes = campaign.candidates.reduce(
                (sum, candidate) => sum + (candidate.total_votes || 0),
                0
              );

              const validDate = campaign.created_at ? new Date(campaign.created_at) : new Date();
              const formattedDate = new Intl.DateTimeFormat('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
              }).format(validDate);

              return (
                <div 
                  key={campaign.id} 
                  className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] shadow-2xl relative overflow-hidden group animate-fade-in-up transition-all hover:border-slate-700/80"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-700 ${
                    campaign.is_active 
                      ? "bg-linear-to-r from-orange-600 via-orange-400 to-orange-600 opacity-50 group-hover:opacity-100" 
                      : "bg-slate-800"
                  }`} />

                  <div className="p-8 sm:p-10">
                    
                    {/* CARD HEADER: Title & Meta */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {campaign.is_active ? (
                            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20 shrink-0 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-lg bg-slate-800/80 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-700 shrink-0 flex items-center gap-2">
                              <CircleDot className="w-3 h-3" /> Closed
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {formattedDate}
                          </span>
                        </div>
                        <h2 className="text-3xl font-black text-white truncate wrap-break-word tracking-tight">
                          {campaign.title}
                        </h2>
                      </div>

                      {/* Top Level Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 shrink-0">
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center min-w-30">
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Nominees
                          </p>
                          <p className="text-2xl font-black text-white">{campaign.candidates.length}</p>
                        </div>
                        <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 flex flex-col items-center justify-center min-w-30">
                          <p className="text-[10px] text-orange-500/70 font-mono uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Trophy className="w-3 h-3" /> Total Votes
                          </p>
                          <p className="text-2xl font-black text-orange-400">{totalCampaignVotes.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* CANDIDATES LEADERBOARD */}
                    <div className="bg-slate-950/40 rounded-3xl p-6 border border-slate-800/40 space-y-6">
                      {campaign.candidates.map((candidate, idx) => {
                        const candidateVotes = candidate.total_votes || 0;
                        const percentage = totalCampaignVotes > 0 
                          ? Math.round((candidateVotes / totalCampaignVotes) * 100) 
                          : 0;

                        const isLeader = idx === 0 && candidateVotes > 0;

                        return (
                          <div key={candidate.id} className="relative group/bar">
                            <div className="flex justify-between items-end mb-3 text-sm">
                              <div className="flex items-center gap-4 min-w-0">
                                <span className={`text-xs font-mono font-bold w-4 ${isLeader ? 'text-orange-500' : 'text-slate-600'}`}>
                                  {idx + 1}.
                                </span>
                                {candidate.image_url ? (
                                  <img 
                                    src={candidate.image_url} 
                                    alt={candidate.name} 
                                    className={`w-10 h-10 rounded-full object-cover shrink-0 ${isLeader ? 'border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border border-slate-700'}`}
                                  />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isLeader ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400' : 'bg-slate-800 border border-slate-700 text-slate-400'}`}>
                                    <span className="text-sm font-bold uppercase">{candidate.name.charAt(0)}</span>
                                  </div>
                                )}
                                <span className={`font-bold truncate text-lg tracking-tight ${isLeader ? 'text-white' : 'text-slate-300'}`}>
                                  {candidate.name}
                                </span>
                              </div>
                              <div className="text-right shrink-0 ml-4 flex flex-col items-end">
                                <span className="font-black text-white text-xl leading-none mb-1">{percentage}%</span>
                                <span className="font-mono text-slate-500 text-[10px] uppercase tracking-wider">
                                  {candidateVotes.toLocaleString()} votes
                                </span>
                              </div>
                            </div>
                            
                            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                                  isLeader ? "bg-linear-to-r from-orange-600 to-orange-400" : "bg-slate-700 group-hover/bar:bg-slate-600"
                                }`}
                                style={{ width: `${percentage}%` }}
                              >
                                {isLeader && (
                                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="bg-slate-900/80 border-t border-slate-800/60 p-4 sm:px-10 flex flex-wrap items-center justify-between gap-4">
                    
                    <Link 
                      href={`/polls/${campaign.slug}`} 
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-all font-mono group/link"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover/link:text-orange-500 transition-colors" />
                      <span className="hidden sm:inline">bambatickets.com/</span>polls/{campaign.slug}
                    </Link>

                    {/* ✨ REPLACED STATIC BUTTONS WITH DYNAMIC CLIENT COMPONENT */}
                    <CampaignActionsMenu 
                      campaignId={campaign.id} 
                      campaignSlug={campaign.slug} 
                    />

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