"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "./Header";
import VenueNavigator from "@/components/VenueNavigator";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Clock,
  Search,
  X,
} from "lucide-react";

export type EventItem = {
  id: string;
  title: string;
  date: Date | string;
  location: string;
  imageUrl: string | null;
  isPublished: boolean;
  category?: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ticketTiers: {
    price: number;
    capacity: number;
    _count?: { tickets: number };
  }[];
  organizer?: { firstName: string; lastName: string };
};

export default function EventBrowser({
  initialEvents,
}: {
  initialEvents: EventItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("All Kenya");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [activeCategory, setActiveCategory] = useState("All Events");

  // Multi-variable filtering matching the Header search bar
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const lowerQuery = searchQuery.toLowerCase().trim();
      const eventDate = new Date(event.date);
      const now = new Date();

      // 1. Text search (Artist / Title / Venue / Organizer)
      const matchesSearch =
        !lowerQuery ||
        event.title.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery) ||
        Boolean(event.organizer?.firstName?.toLowerCase().includes(lowerQuery)) ||
        Boolean(event.organizer?.lastName?.toLowerCase().includes(lowerQuery));

      // 2. Location filter
      const matchesLocation =
        location === "All Kenya" ||
        event.location.toLowerCase().includes(location.toLowerCase());

      // 3. Category filter
      const matchesCategory =
        activeCategory === "All Events" ||
        (event.category &&
          event.category.toLowerCase() === activeCategory.toLowerCase());

      // 4. Date filter (accruing Friday through Sunday correctly)
      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate =
          eventDate.getDate() === now.getDate() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "This Weekend") {
        const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
        const weekendStart = new Date(now);
        const weekendEnd = new Date(now);

        if (dayOfWeek === 0) {
          // Sunday: include from Friday (2 days ago) to end of today
          weekendStart.setDate(now.getDate() - 2);
          weekendEnd.setDate(now.getDate());
        } else if (dayOfWeek === 6) {
          // Saturday: include from Friday (1 day ago) to end of tomorrow (Sunday)
          weekendStart.setDate(now.getDate() - 1);
          weekendEnd.setDate(now.getDate() + 1);
        } else {
          // Mon-Fri: find coming Friday through Sunday
          const daysToFriday = 5 - dayOfWeek;
          weekendStart.setDate(now.getDate() + daysToFriday);
          weekendEnd.setDate(now.getDate() + daysToFriday + 2);
        }

        weekendStart.setHours(0, 0, 0, 0);
        weekendEnd.setHours(23, 59, 59, 999);

        matchesDate = eventDate >= weekendStart && eventDate <= weekendEnd;
      } else if (dateFilter === "This Month") {
        matchesDate =
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "Upcoming") {
        matchesDate = eventDate.getTime() >= now.getTime();
      }

      return matchesSearch && matchesLocation && matchesCategory && matchesDate;
    });
  }, [searchQuery, location, dateFilter, activeCategory, initialEvents]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setLocation("All Kenya");
    setDateFilter("All Dates");
    setActiveCategory("All Events");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    location !== "All Kenya" ||
    dateFilter !== "All Dates" ||
    activeCategory !== "All Events";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50">
      
      {/* Header with Search & Live Discovery Dialog */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        location={location}
        setLocation={setLocation}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        events={initialEvents}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-10">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-8">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-orange-500 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeCategory === "All Events" ? "Upcoming Events in Kenya" : activeCategory}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-orange-400">
              {filteredEvents.length}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-orange-400 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Reset All Filters <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-24 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-white font-bold text-lg">No events found</h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
              We couldn&apos;t find any events matching your selected criteria. Try adjusting your location, dates, or search term.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              View All Events
            </button>
          </div>
        ) : (
          /* Event Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((event) => {
              const lowestPrice =
                event.ticketTiers.length > 0
                  ? Math.min(...event.ticketTiers.map((t) => t.price))
                  : 0;

              const totalCapacity = event.ticketTiers.reduce((acc, t) => acc + t.capacity, 0);
              const totalSold = event.ticketTiers.reduce((acc, t) => acc + (t._count?.tickets || 0), 0);
              const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity;
              const isPast = new Date(event.date).getTime() < new Date().getTime();

              const cardClasses = `group relative bg-slate-900/60 border border-slate-800/90 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                isPast
                  ? "opacity-60 grayscale"
                  : "hover:border-orange-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5"
              }`;

              return (
                <div key={event.id} className={cardClasses}>
                  {/* Clickable Card Body Content */}
                  {isPast ? (
                    <div className="block flex-1 cursor-not-allowed">
                      <EventCardContent event={event} lowestPrice={lowestPrice} isPast={isPast} isSoldOut={isSoldOut} />
                    </div>
                  ) : (
                    <Link href={`/events/${event.id}`} className="block flex-1">
                      <EventCardContent event={event} lowestPrice={lowestPrice} isPast={isPast} isSoldOut={isSoldOut} />
                    </Link>
                  )}

                  {/* Card Bottom Meta: Location Pin acts as the directions button, Get Tickets prioritized */}
                  <div className="px-6 pb-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    
                    {/* Location Pin Trigger for Navigator Modal */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <VenueNavigator 
                        locationName={event.location}
                        venueAddress={event.venueAddress}
                        latitude={event.latitude}
                        longitude={event.longitude}
                        renderAsIconOnly={true}
                      />
                    </div>

                    {isPast ? (
                      <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                        Event Ended
                      </span>
                    ) : isSoldOut ? (
                      <span className="font-bold text-red-400 uppercase text-[10px] tracking-wider">
                        Sold Out
                      </span>
                    ) : (
                      <Link 
                        href={`/events/${event.id}`}
                        className="font-bold text-white group-hover:text-orange-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Get Tickets</span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Global Landing Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Bamba Tickets. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/become-organizer" className="hover:text-orange-400 transition-colors">
              Host an Event
            </Link>
            <Link href="/polls" className="hover:text-orange-400 transition-colors">
              Voting Center
            </Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EventCardContent({ event, lowestPrice, isPast, isSoldOut }: { event: EventItem; lowestPrice: number; isPast: boolean; isSoldOut: boolean }) {
  return (
    <div>
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isPast && "group-hover:scale-105"}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <Ticket className="w-10 h-10 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-white text-xs font-mono font-bold shadow-md">
            {lowestPrice === 0 ? "FREE" : `KES ${lowestPrice.toLocaleString()}`}
          </div>

          {isPast ? (
            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-700">
              Ended
            </span>
          ) : isSoldOut ? (
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
              Sold Out
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3 text-xs font-mono text-orange-400 font-bold">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {new Date(event.date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <h2 className={`text-lg font-bold text-white transition-colors line-clamp-1 ${!isPast && "group-hover:text-orange-400"}`}>
          {event.title}
        </h2>

        <p className="flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {event.location}
        </p>
      </div>
    </div>
  );
}