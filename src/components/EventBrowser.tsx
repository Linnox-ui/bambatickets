"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Clock,
  X,
  Radar,
} from "lucide-react";

type Event = {
  id: string;
  title: string;
  date: Date | string;
  location: string;
  imageUrl: string | null;
  isPublished: boolean;
  ticketTiers: {
    price: number;
    capacity: number;
    _count?: { tickets: number };
  }[];
  organizer: { firstName: string; lastName: string };
};

export default function EventBrowser({
  initialEvents,
}: {
  initialEvents: Event[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return initialEvents;
    const lowerQuery = searchQuery.toLowerCase();
    return initialEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery) ||
        event.organizer.firstName.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery, initialEvents]);

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {!searchQuery && (
        <section className="relative py-8 sm:py-12 flex justify-center items-center animate-fade-in-up">
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
      )}

      <main
        className={`max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-16 sm:pb-24 relative z-10 min-h-[50vh] transition-all duration-500 ${searchQuery ? "pt-8 sm:pt-12" : "pt-4"}`}
      >
        <div className="flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-900 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3">
            <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            {searchQuery ? "Search Results" : "Upcoming Events"}
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-xs sm:text-sm font-mono transition-colors duration-300 ${filteredEvents.length === 0 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-950 border-slate-800 text-orange-500"}`}
            >
              {filteredEvents.length}
            </span>
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-24 sm:py-32 space-y-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-4xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden animate-fade-in-up">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes scan {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .radar-scanner {
                background: conic-gradient(from 0deg, transparent 70%, rgba(249,115,22,0.4) 100%);
                animation: scan 2s linear infinite;
              }
            `,
              }}
            />

            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full border border-slate-700/50 flex items-center justify-center bg-slate-950 shadow-inner overflow-hidden">
              <div className="absolute inset-0 radar-scanner origin-center" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-700/50 animate-[spin_10s_linear_infinite_reverse]" />
              <Radar className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500/50 relative z-10 animate-pulse" />
            </div>

            <div className="relative z-10 px-4 space-y-2">
              <h3 className="text-white font-black text-xl sm:text-2xl tracking-tight">
                Target Lost.
              </h3>
              <p className="text-slate-400 font-mono text-sm max-w-sm mx-auto uppercase tracking-widest">
                No telemetry found for{" "}
                <span className="text-orange-500 border-b border-orange-500/50">
                  "{searchQuery}"
                </span>
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-orange-500 text-slate-300 hover:text-slate-950 font-bold rounded-full text-xs transition-all duration-300"
              >
                Clear Search <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {filteredEvents.map((event, index) => {
              const lowestPrice =
                event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => t.price))
                  : 0;

              const totalCapacity = event.ticketTiers.reduce(
                (acc, tier) => acc + tier.capacity,
                0,
              );
              const totalSold = event.ticketTiers.reduce(
                (acc, tier) => acc + (tier._count?.tickets || 0),
                0,
              );
              const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity;
              const isPast =
                new Date(event.date).getTime() < new Date().getTime();

              const cardClasses = `animate-fade-in-up group relative bg-slate-900 border border-slate-800 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between ${
                isPast
                  ? "opacity-60 grayscale cursor-not-allowed"
                  : "hover:border-orange-500/50 hover:-translate-y-2 cursor-pointer"
              }`;
              const cardStyle = { animationDelay: `${(index % 10) * 50}ms` };

              const cardContent = (
                <>
                  <div>
                    <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${!isPast && "group-hover:scale-110"}`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-linear-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center transition-transform duration-500 relative ${!isPast && "group-hover:scale-105"}`}
                        >
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.4)_0,transparent_70%)]" />
                          <Ticket
                            className={`w-12 h-12 text-slate-700 relative z-10 transition-colors ${!isPast && "group-hover:text-orange-500/50"}`}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                      <div className="absolute top-4 sm:top-5 right-4 sm:right-5 flex flex-col gap-2 items-end">
                        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-[10px] sm:text-xs font-mono font-bold shadow-xl">
                          KES{" "}
                          <span className="text-orange-500">
                            {lowestPrice.toLocaleString()}
                          </span>
                        </div>

                        {isPast ? (
                          <div className="bg-slate-800/90 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            Ended
                          </div>
                        ) : isSoldOut ? (
                          <div className="bg-red-500/90 text-white border border-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                            Sold Out
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-3 sm:space-y-4 relative -mt-5 sm:-mt-6">
                      <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-black">
                        <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 shadow-inner">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50 shadow-inner">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                          {new Date(event.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <h3
                        className={`text-xl sm:text-2xl font-black text-white transition-colors line-clamp-2 leading-tight ${!isPast && "group-hover:text-orange-400"}`}
                      >
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-800 flex items-center justify-center text-[9px] sm:text-[10px] text-white font-black border border-slate-700 shadow-inner">
                        {event.organizer.firstName.charAt(0)}
                      </div>
                      {event.organizer.firstName}
                    </span>
                    <span
                      className={`px-4 py-2 sm:px-5 sm:py-2.5 font-black rounded-full sm:rounded-xl text-[10px] sm:text-xs transition-all flex items-center gap-2 shadow-lg ${isPast ? "bg-slate-800 text-slate-500 border border-slate-700" : "bg-slate-800 group-hover:bg-orange-500 border border-slate-700 text-slate-300 group-hover:text-slate-950"}`}
                    >
                      {isPast
                        ? "Unavailable"
                        : isSoldOut
                          ? "Sold Out"
                          : "Tickets"}
                      {!isPast && !isSoldOut && (
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform" />
                      )}
                    </span>
                  </div>
                </>
              );

              if (isPast) {
                return (
                  <div key={event.id} className={cardClasses} style={cardStyle}>
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={cardClasses}
                  style={cardStyle}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
