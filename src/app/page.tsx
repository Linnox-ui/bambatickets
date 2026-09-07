import prisma from "../lib/prisma";
import Navbar from "../components/Navbar";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  Search,
  ChevronDown,
} from "lucide-react";

export default async function PublicHomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      ticketTiers: true,
      organizer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

      <Navbar />

      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-orange-500/30 rounded-full text-orange-400 text-xs font-mono font-bold shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            Kenya's Premier Secure Ticketing Engine
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter max-w-5xl mx-auto leading-[1.1] drop-shadow-2xl">
            Experience Live Events. <br />
            <span className="text-orange-500 animate-pulse inline-block mt-2">
              Zero Hassle, Instant Access.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover underground raves, tech conferences, concerts, and VIP
            parties. Get verifiable QR tickets instantly secured via M-Pesa.
          </p>

          <div className="flex justify-center pt-8 opacity-50">
            <ChevronDown className="w-8 h-8 text-orange-500 animate-bounce" />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 space-y-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-orange-500" />
            Upcoming Events
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-orange-500 text-sm font-mono">
              {events.length}
            </span>
          </h2>

          <div className="flex items-center gap-2 text-sm font-mono text-slate-400 bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-800 transition-colors cursor-pointer">
            <Search className="w-4 h-4 text-orange-500" /> Browse All
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-32 space-y-5 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-xl relative z-10">
              <Ticket className="w-12 h-12 text-slate-600 animate-pulse" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-300 font-bold text-xl">
                No published events right now.
              </p>
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                Check back soon or launch your own via the Organizer Studio.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {events.map((event) => {
              const lowestPrice =
                event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => t.price))
                  : 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-2"
                >
                  <div>
                    <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs">
                          BAMBA
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 to-transparent opacity-90" />

                      <div className="absolute top-5 right-5 bg-slate-950 border border-slate-800 px-4 py-2 rounded-full text-white text-xs font-mono font-bold">
                        KES{" "}
                        <span className="text-orange-500">
                          {lowestPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 space-y-4 relative -mt-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-orange-500 uppercase tracking-widest font-black">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })}
                        </div>
                        <h3 className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 pb-8 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-black border border-slate-700">
                        {event.organizer.firstName.charAt(0)}
                      </div>
                      {event.organizer.firstName}
                    </span>
                    <span className="px-5 py-2.5 bg-slate-800 group-hover:bg-orange-500 border border-slate-700 text-slate-300 group-hover:text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2">
                      Tickets{" "}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
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
