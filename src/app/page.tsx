import prisma from "../lib/prisma";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { Calendar, MapPin, Ticket, ArrowRight, Search } from "lucide-react";

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

      <Navbar />

      <section className="relative py-8 sm:py-12 flex justify-center items-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative z-10 group cursor-default flex flex-col items-center gap-4 sm:gap-5 w-full">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center transition-all duration-700 ease-out group-hover:scale-110">
            <div
              className="absolute inset-0 rounded-full border-[3px] border-orange-500/60 opacity-0 group-hover:animate-shockwave"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-[3px] border-orange-500/40 opacity-0 group-hover:animate-shockwave"
              style={{ animationDelay: "0.6s" }}
            />

            <div className="relative w-full h-full animate-float drop-shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(249,115,22,0.9)] transition-all duration-500">
              <img
                src="/logo.svg"
                alt="Bamba Tickets"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col items-center relative h-12 sm:h-16 justify-start">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter transition-all duration-700 ease-out group-hover:tracking-widest sm:group-hover:tracking-[0.15em] flex items-center">
              BAMBA<span className="animate-shine ml-1 sm:ml-2">TICKETS</span>
            </h1>

            <div className="absolute top-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-orange-500 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest hidden group-hover:block animate-typing">
                SYSTEM ONLINE. READY FOR EVENTS.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-16 sm:pb-24 pt-8 sm:pt-12 space-y-8 sm:space-y-12 relative z-10">
        <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-900">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3">
            <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            Upcoming
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-950 border border-slate-800 text-orange-500 text-xs sm:text-sm font-mono">
              {events.length}
            </span>
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full sm:rounded-xl border border-slate-800 transition-colors cursor-pointer">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />{" "}
            <span className="hidden xs:inline">Browse All</span>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-24 sm:py-32 space-y-5 bg-slate-900 border border-slate-800 rounded-4xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-xl relative z-10">
              <Ticket className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 animate-pulse" />
            </div>
            <div className="relative z-10 px-4">
              <p className="text-slate-300 font-bold text-lg sm:text-xl">
                No published events right now.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {events.map((event, index) => {
              const lowestPrice =
                event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => t.price))
                  : 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="animate-fade-in-up group relative bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
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

                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                      <div className="absolute top-4 sm:top-5 right-4 sm:right-5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-[10px] sm:text-xs font-mono font-bold">
                        KES{" "}
                        <span className="text-orange-500">
                          {lowestPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-3 sm:space-y-4 relative -mt-5 sm:-mt-6">
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-orange-500 uppercase tracking-widest font-black">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 flex items-center justify-center text-[9px] sm:text-[10px] text-white font-black border border-slate-700">
                        {event.organizer.firstName.charAt(0)}
                      </div>
                      {event.organizer.firstName}
                    </span>
                    <span className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-800 group-hover:bg-orange-500 border border-slate-700 text-slate-300 group-hover:text-slate-950 font-black rounded-full sm:rounded-xl text-[10px] sm:text-xs transition-all flex items-center gap-2">
                      Tickets{" "}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
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
