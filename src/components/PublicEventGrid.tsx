"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CalendarDays, MapPin, Ticket } from "lucide-react";

interface TicketTier {
  id: string;
  price: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string;
  date: Date;
  imageUrl: string | null;
  organizer: { firstName: string; lastName: string };
  ticketTiers: TicketTier[];
}

interface PublicEventGridProps {
  initialEvents: EventItem[];
}

export default function PublicEventGrid({
  initialEvents,
}: PublicEventGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  const filteredEvents = initialEvents.filter((event) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = event.title.toLowerCase().includes(query);
    const matchesLocation = event.location.toLowerCase().includes(query);
    return matchesTitle || matchesLocation;
  });

  const handleImageError = (eventId: string) => {
    setImageError((prev) => ({ ...prev, [eventId]: true }));
  };

  return (
    <div className="space-y-10">
      {/* SEARCH BAR */}
      <div className="max-w-xl mx-auto relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by event name or location (e.g., KICC, Nairobi)..."
          className="w-full pl-12 pr-4 py-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 transition-all shadow-xl"
        />
      </div>

      {/* EVENT GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 border border-slate-800/60 border-dashed rounded-3xl p-8">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No events found</h3>
          <p className="text-slate-400 text-sm">
            Try searching for a different keyword or location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            // Find lowest ticket price
            const lowestPrice =
              event.ticketTiers.length > 0
                ? Math.min(...event.ticketTiers.map((t) => t.price))
                : 0;

            const formattedDate = new Date(event.date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            const hasValidImage = Boolean(
              event.imageUrl &&
              typeof event.imageUrl === "string" &&
              event.imageUrl.trim() !== "" &&
              !imageError[event.id],
            );

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-xl hover:-translate-y-1"
              >
                {/* Banner Thumbnail */}
                <div className="h-48 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {hasValidImage ? (
                    <img
                      src={event.imageUrl as string}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={() => handleImageError(event.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950/40 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fuchsia-600/15 via-transparent to-transparent opacity-75" />
                      <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 z-10">
                        <Ticket className="w-7 h-7 text-fuchsia-400" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-xs font-semibold text-cyan-400 z-10">
                    KES {lowestPrice.toLocaleString()}+
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      By {event.organizer.firstName} {event.organizer.lastName}
                    </span>
                    <span className="font-semibold text-cyan-400 group-hover:underline">
                      Get Tickets →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
