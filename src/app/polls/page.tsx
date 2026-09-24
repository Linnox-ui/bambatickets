import Link from "next/link";
import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";
import { auth } from "@/src/auth";

const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
const votingPrisma = new VotingPrismaClient({ adapter });

export const revalidate = 60;

export default async function PollsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
      // NEW: Fetch up to 4 candidates to display in the avatar stack
      candidates: {
        take: 4,
        select: { id: true, name: true, image_url: true }
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-50 flex flex-col lg:flex-row">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; 
        }
      `,
        }}
      />

      {/* --- SIDEBAR (Desktop Only) --- */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-800/60 bg-slate-950/50 backdrop-blur-xl relative z-20 min-h-screen p-6 top-0">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="text-orange-500">Bamba</span>
            <span className="text-slate-100">Voting</span>
          </Link>
          <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest">
            Community Awards
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/polls" className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 text-orange-400 rounded-xl font-medium border border-orange-500/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Discover Polls
          </Link>
          
          <Link href={session ? "/admin/polls" : "/login?callbackUrl=/admin/polls"} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            My Dashboard
          </Link>
        </nav>

        <div className="pt-6 border-t border-slate-800/60 mt-auto">
          <div className="bg-linear-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-sm font-bold text-slate-200 relative z-10">Host an Award</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4 relative z-10">Launch a secure, professional voting campaign in seconds.</p>
            <Link
              href={session ? "/admin/polls/new" : "/login?callbackUrl=/admin/polls/new"}
              className="relative z-10 block w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 text-center text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              {session ? "Start Now" : "Sign In to Host"}
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative min-h-screen overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="lg:hidden p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="text-orange-500">Bamba</span>Voting
          </Link>
          <Link href={session ? "/admin/polls/new" : "/login"} className="text-xs font-mono font-bold text-orange-500 uppercase">
            Host Poll
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative z-10">
          <div className="max-w-5xl mx-auto">
            
            <header className="mb-12 animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                Discover <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-300">Campaigns</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Have your say in the latest community awards, competitions, and polls. Secure, transparent, and built for scale.
              </p>
            </header>

            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <form className="relative max-w-2xl" method="GET" action="/polls">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search campaigns, awards, or nominees..."
                  className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-100 rounded-2xl px-5 py-4 pl-14 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-500 shadow-xl"
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <Link href="/polls" className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-orange-500 transition-colors">
                    CLEAR
                  </Link>
                )}
              </form>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="text-5xl mb-4 block animate-bounce">🏆</span>
                <p className="text-slate-300 text-xl font-medium">No campaigns found.</p>
                <p className="text-sm text-slate-500 mt-2">Check back later or start your own community award.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeCampaigns.map((campaign, index) => (
                  <Link 
                    href={`/polls/${campaign.slug}`} 
                    key={campaign.id} 
                    className={`group h-full animate-fade-in-up`}
                    style={{ animationDelay: `${(index % 5 + 2) * 0.1}s` }}
                  >
                    <div className="h-full bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/80 hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgb(249,115,22,0.15)] flex flex-col justify-between relative overflow-hidden">
                      
                      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500 group-hover:via-orange-400 group-hover:to-orange-500 transition-all duration-500" />

                      <div>
                        <div className="flex justify-between items-start mb-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-green-500/10 text-green-400 uppercase tracking-wider border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Live Now
                          </span>

                          {/* --- NEW AVATAR STACK --- */}
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
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-slate-900 bg-linear-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-300 uppercase"
                                >
                                  {candidate.name.charAt(0)}
                                </div>
                              )
                            ))}
                            {/* Show a "+X" badge if there are more candidates than the 4 we fetched */}
                            {campaign._count.candidates > 4 && (
                              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800/80 text-[10px] font-bold text-slate-400">
                                +{campaign._count.candidates - 4}
                              </div>
                            )}
                          </div>
                          {/* ------------------------ */}

                        </div>
                        <h3 className="text-2xl font-bold text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-orange-400 group-hover:to-orange-200 transition-all duration-300 mb-3">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-8">
                          Official voting portal for the {campaign.title}. Cast your vote securely today.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-slate-800/60 text-xs font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {campaign._count.candidates} Nominees
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
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
    </div>
  );
}