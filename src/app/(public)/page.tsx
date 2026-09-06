import Link from "next/link";
import prisma from "../../lib/prisma";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default async function PublicHomePage() {
  // Fetch only published events
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      ticketTiers: true,
      organizer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* NAVBAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-2xl flex items-center justify-center font-black text-slate-950 text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              B
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Bamba<span className="text-cyan-400">Tickets</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all"
            >
              Organizer Studio
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Kenya's Premier Secure
            Ticketing Engine
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-none">
            Experience Live Events. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-fuchsia-500">
              Zero Hassle, Instant Access.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover underground raves, tech conferences, concerts, and VIP
            parties. Get verifiable QR tickets instantly sent to your email.
          </p>
        </div>
      </section>

      {/* EVENTS DISCOVERY GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" /> Upcoming Published
            Events ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-slate-900/40 border border-slate-900 rounded-3xl">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-bold text-sm">
              No published events right now.
            </p>
            <p className="text-slate-600 text-xs">
              Check back soon or launch your own event via the Organizer Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              // Find lowest ticket price
              const lowestPrice =
                event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => t.price))
                  : 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.01]"
                >
                  <div>
                    {/* EVENT BANNER IMAGE */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden border-b border-slate-800">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 font-mono text-xs">
                          NO BANNER
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-xl text-cyan-400 text-xs font-mono font-bold">
                        From KES {lowestPrice.toLocaleString()}
                      </div>
                    </div>

                    {/* EVENT INFO */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      By {event.organizer.firstName} {event.organizer.lastName}
                    </span>
                    <span className="px-3.5 py-2 bg-cyan-600/10 group-hover:bg-cyan-600 group-hover:text-white border border-cyan-500/20 text-cyan-400 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5">
                      Get Tickets <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
