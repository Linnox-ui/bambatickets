import Link from "next/link";
import { Ticket, Sparkles, LayoutDashboard, UserPlus } from "lucide-react";
import prisma from "../lib/prisma";
import { auth } from "../auth"; // <-- Import auth
import PublicEventGrid from "../components/PublicEventGrid";

export default async function PublicHomePage() {
  // Check if an organizer is currently logged in
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Fetch all published events
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      ticketTiers: true,
      organizer: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-fuchsia-500 selection:text-white">
      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Bamba
              <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-cyan-400">
                Tickets
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Smart Button: Changes based on whether user is an Organizer or a Guest */}
            {isLoggedIn ? (
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-fuchsia-400" />
                Go to Studio
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-fuchsia-500/25 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Host an Event
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-linear-to-tr from-fuchsia-600/20 to-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-fuchsia-400 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            Kenya's Premier Event Ticketing Experience
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Discover Unforgettable <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 via-purple-300 to-cyan-400">
              Live Experiences
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Browse concerts, festivals, tech meetups, and parties. Secure your
            spot in seconds with instant WhatsApp and email ticketing.
          </p>
        </div>
      </section>

      {/* EVENTS EXPLORER SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PublicEventGrid initialEvents={events} />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-4 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} BambaTickets. Built for creators and
          fans across Kenya.
        </p>
      </footer>
    </div>
  );
}
