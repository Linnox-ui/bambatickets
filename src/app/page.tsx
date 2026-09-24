import prisma from "../lib/prisma";
import EventBrowser from "../components/EventBrowser";
import Link from "next/link";
import { auth } from "../auth";

export default async function PublicHomePage() {
  const session = await auth();

  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      ticketTiers: {
        include: {
          _count: {
            select: { tickets: true },
          },
        },
      },
      organizer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 font-sans relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes shockwave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
        }
        .animate-shockwave {
          animation: shockwave 2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          background: linear-gradient(120deg, #f97316 20%, #ffedd5 40%, #ffedd5 60%, #f97316 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3s linear infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #f97316; }
        }
        .animate-typing {
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.15em solid #f97316;
          animation: typing 1.5s steps(30, end), blink-caret 0.75s step-end infinite;
        }
      `,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <EventBrowser initialEvents={events} />

      {/* --- NEW VOTING HUB TEASER STRIP --- */}
      <div 
        className="relative z-10 max-w-7xl mx-auto px-4 mt-8 mb-12 animate-fade-in-up" 
        style={{ animationDelay: '0.8s' }}
      >
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group hover:border-orange-500/30 transition-colors duration-500">
          <div className="absolute inset-0 bg-linear-to-r from-orange-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center md:justify-start gap-3">
              <span className="text-orange-500 animate-float inline-block">🏆</span> 
              BambaTickets Voting Center
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Have your say in the latest community polls and awards. Support your favorite creators, artists, and nominees in a secure, transparent voting environment.
            </p>
          </div>

          <Link 
            href="/polls"
            className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-slate-100 font-mono text-xs uppercase tracking-widest rounded-lg transition-all duration-300"
          >
            <span>View Active Polls</span>
            <svg className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
      {/* ----------------------------------- */}

      <footer className="border-t border-slate-800/60 py-8 bg-transparent relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} Bamba Tickets Corporation. All
            rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {session?.user?.role === "CUSTOMER" && (
              <Link
                href="/become-organizer"
                className="text-xs font-mono font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest transition-colors"
              >
                Become an Organizer
              </Link>
            )}
            
            {/* Added Voting Link to Footer */}
            <Link
              href="/polls"
              className="text-xs font-mono font-bold text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors"
            >
              Voting Center
            </Link>

            <Link
              href="/terms"
              className="text-xs font-mono font-bold text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}