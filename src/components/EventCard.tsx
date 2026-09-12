"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

interface TicketTier {
  id: string;
  price: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string;
  date: Date | string;
  imageUrl: string | null;
  ticketTiers: TicketTier[];
}

export default function EventCard({ event }: { event: EventItem }) {
  const [imageError, setImageError] = useState(false);

  // Strict validation: ensures image exists, is a valid non-empty string, and hasn't errored out
  const hasValidImage = Boolean(
    event.imageUrl &&
    typeof event.imageUrl === "string" &&
    event.imageUrl.trim() !== "" &&
    !imageError,
  );

  const lowestPrice =
    event.ticketTiers.length > 0
      ? Math.min(...event.ticketTiers.map((t) => t.price))
      : 0;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-xl">
      {/* Event Image Banner or Glowing Placeholder */}
      <div className="h-48 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
        {hasValidImage ? (
          <img
            src={event.imageUrl as string}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950/40 relative">
            {/* Atmospheric Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fuchsia-600/15 via-transparent to-transparent opacity-75" />

            {/* Glassmorphic Icon Badge */}
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
          <span className="text-slate-500 font-medium">Event Status</span>
          <Link
            href={`/studio/events/${event.id}`}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Manage →
          </Link>
        </div>
      </div>
    </div>
  );
}
