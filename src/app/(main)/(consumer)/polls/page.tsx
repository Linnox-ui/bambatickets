import Link from "next/link";
import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import { auth } from "@/src/auth";
import { 
  Search, 
  LayoutGrid, 
  ArrowLeft, 
  Trophy, 
  Users, 
  Activity,
  Plus,
  BarChart3 // ✨ ADDED FOR DASHBOARD ICON
} from "lucide-react";

// --- PRESERVED CONFIGURATION ---
const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export const dynamic = "force-dynamic";

export default async function PollsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  // --- PRESERVED DATA LOGIC ---
  const session = await auth();
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";

  const activeCampaigns = await votingPrisma.campaign.findMany({
    where: {
      is_active: true,
      ...(searchQuery ? { title: { contains: searchQuery, mode: "insensitive" } } : {}),
    },
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { candidates: true, votes: true } },
      candidates: {
        take: 4,
        select: { id: true, name: true, image_url: true }
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500/30 selection:text-orange-100 flex flex-col lg:flex-row pb-20 lg:pb-0">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/60 bg-slate-950/50 backdrop-blur-xl relative z-20 min-h-screen p-6 top-0">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-orange-500">Bamba</span>
            <span className="text-white">Voting</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/polls" className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 text-orange-400 rounded-xl font-bold border border-orange-500/20 transition-colors">
            <LayoutGrid className="w-5 h-5" />
            Discover Polls
          </Link>
          
          {/* ✨ NEW: Dashboard Link for Logged-In Users */}
          {session?.user && (
            <Link href="/polls/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-xl font-medium transition-colors border border-transparent hover:border-slate-800">
              <BarChart3 className="w-5 h-5" />
              My Dashboard
            </Link>
          )}
          
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-xl font-medium transition-colors border border-transparent">
            <ArrowLeft className="w-5 h-5" />
            Back to Tickets
          </Link>
        </nav>

        <div className="pt-6 border-t border-slate-800/60 mt-auto">
          <Link
            href={session ? "/polls/new" : "/login?callbackUrl=/polls/new"}
            className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <Plus className="w-4 h-4" />
            {session ? "Host Campaign" : "Sign In to Host"}
          </Link>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      <div className="lg:hidden p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="text-xl font-black tracking-tight">
          <span className="text-orange-500">Bamba</span><span className="text-white">Voting</span>
        </Link>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative min-h-screen flex flex-col">
        {/* Preserved Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 relative z-10">
          <div className="max-w-5xl mx-auto">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Live Campaigns
              </h1>
              
              <form method="GET" action="/polls" className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search campaigns..."
                  className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 text-white rounded-xl px-5 py-3 pl-11 pr-16 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-500 text-sm shadow-lg"
                />
                {searchQuery && (
                  <Link 
                    href="/polls" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded transition-colors uppercase tracking-wider"
                  >
                    Clear
                  </Link>
                )}
              </form>
            </div>

            {/* Content Grid */}
            {activeCampaigns.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-1">No campaigns found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeCampaigns.map((campaign) => (
                  <Link 
                    href={`/polls/${campaign.slug}`} 
                    key={campaign.id} 
                    className="group block h-full"
                  >
                    <div className="h-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgb(249,115,22,0.15)] flex flex-col justify-between relative overflow-hidden">
                      
                      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500 group-hover:via-orange-400 group-hover:to-orange-500 transition-all duration-500" />

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                          </span>

                          <div className="flex -space-x-2 overflow-hidden">
                            {campaign.candidates.map((candidate) => (
                              candidate.image_url ? (
                                <img 
                                  key={candidate.id} 
                                  src={candidate.image_url} 
                                  alt={candidate.name} 
                                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover bg-slate-800"
                                />
                              ) : (
                                <div 
                                  key={candidate.id} 
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 text-[10px] font-bold text-slate-300 uppercase"
                                >
                                  {candidate.name.charAt(0)}
                                </div>
                              )
                            ))}
                            {campaign._count.candidates > 4 && (
                              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800/80 text-[10px] font-bold text-slate-400">
                                +{campaign._count.candidates - 4}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors mb-2 line-clamp-2">
                          {campaign.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800/60 text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-500/70" />
                          {campaign._count.candidates} Nominees
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-orange-500/70" />
                          {campaign._count.votes} Votes
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible ONLY on Mobile) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/60 z-50 px-6 py-3 flex items-center justify-between pb-[env(safe-area-inset-bottom,12px)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tickets</span>
        </Link>
        <Link href="/polls" className="flex flex-col items-center gap-1 text-orange-500 transition-colors">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Polls</span>
        </Link>
        
        {/* ✨ NEW: Intelligent Mobile Action Button */}
        {session ? (
          <Link 
            href="/polls/dashboard" 
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
          </Link>
        ) : (
          <Link 
            href="/login?callbackUrl=/polls/new" 
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Host</span>
          </Link>
        )}
      </nav>

    </div>
  );
}