"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  MapPin, 
  Calendar, 
  Search, 
  User, 
  Vote, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut, 
  Sparkles,
  TrendingUp,
  Ticket,
  ArrowUpRight,
  Flame,
  X
} from "lucide-react";

export type SearchPreviewEvent = {
  id: string;
  title: string;
  date: Date | string;
  location: string;
  imageUrl: string | null;
  category?: string;
  ticketTiers: {
    price: number;
    capacity?: number;
    _count?: { tickets: number };
  }[];
  organizer?: { firstName: string; lastName: string };
};

export interface HeaderProps {
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  location?: string;
  setLocation?: (val: string) => void;
  dateFilter?: string;
  setDateFilter?: (val: string) => void;
  activeCategory?: string;
  setActiveCategory?: (val: string) => void;
  events?: SearchPreviewEvent[];
  onSearch?: (query: { search: string; location: string; date: string; category: string }) => void;
}

const CATEGORIES = [
  "All Events",
  "Concerts",
  "Festivals",
  "Nightlife",
  "Campus",
  "Sports",
  "Voting & Polls"
];

const CITIES = [
  "All Kenya",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Naivasha"
];

const DATES = [
  "All Dates",
  "Today",
  "This Weekend",
  "This Month",
  "Upcoming"
];

export default function Header({
  searchQuery: extQuery,
  setSearchQuery: extSetQuery,
  location: extLoc,
  setLocation: extSetLoc,
  dateFilter: extDate,
  setDateFilter: extSetDate,
  activeCategory: extCat,
  setActiveCategory: extSetCat,
  events = [],
  onSearch
}: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Secret doors state
  const [taps, setTaps] = useState(0);

  // Search Dialog State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Internal state fallbacks
  const [internalQuery, setInternalQuery] = useState("");
  const [internalLoc, setInternalLoc] = useState("All Kenya");
  const [internalDate, setInternalDate] = useState("All Dates");
  const [internalCat, setInternalCat] = useState("All Events");

  const query = extQuery !== undefined ? extQuery : internalQuery;
  const setQuery = extSetQuery || setInternalQuery;

  const loc = extLoc !== undefined ? extLoc : internalLoc;
  const setLoc = extSetLoc || setInternalLoc;

  const date = extDate !== undefined ? extDate : internalDate;
  const setDate = extSetDate || setInternalDate;

  const cat = extCat !== undefined ? extCat : internalCat;
  const setCat = extSetCat || setInternalCat;

  const isOrganizer = 
    session?.user?.role === "ORGANIZER" || 
    session?.user?.role === "SUPER_ADMIN" || 
    session?.user?.role === "SUPERVISOR";

  // =========================================================================
  // POPULARITY ALGORITHM (DERIVED ENTIRELY FROM LIVE PLATFORM DATA)
  // =========================================================================
  const { trendingEvents, popularVenues, activeEventKeywords } = useMemo(() => {
    if (!events || events.length === 0) {
      return { trendingEvents: [], popularVenues: [], activeEventKeywords: [] };
    }

    const now = Date.now();

    // 1. Calculate popularity score per event
    const scored = [...events].map((evt) => {
      const ticketsSold = evt.ticketTiers?.reduce(
        (sum, t) => sum + (t._count?.tickets || 0),
        0
      ) || 0;

      const totalCap = evt.ticketTiers?.reduce(
        (sum, t) => sum + (t.capacity || 0),
        0
      ) || 0;

      const isUpcoming = new Date(evt.date).getTime() >= now;

      // Score = (Tickets Sold * 100) + (Upcoming Bonus: 50) + (Capacity baseline: 10)
      const score = (ticketsSold * 100) + (isUpcoming ? 50 : 0) + (totalCap > 0 ? 10 : 0);

      return { event: evt, score, ticketsSold };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Top 4 trending events currently on platform
    const topTrending = scored.slice(0, 4).map((s) => s.event);

    // 2. Identify top active venues hosted on the platform
    const venueMap = new Map<string, number>();
    events.forEach((evt) => {
      if (evt.location) {
        const venueName = evt.location.trim();
        venueMap.set(venueName, (venueMap.get(venueName) || 0) + 1);
      }
    });

    const topVenues = Array.from(venueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([venue]) => venue);

    // 3. Extract keywords from popular event titles
    const keywords = scored.slice(0, 6).map((s) => s.event.title);

    return {
      trendingEvents: topTrending,
      popularVenues: topVenues,
      activeEventKeywords: keywords,
    };
  }, [events]);

  // Dismiss search modal & reset input
  const handleCancelSearch = () => {
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  // Close search popover on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Secret door 1: "bambahq" key sequence
  useEffect(() => {
    let sequence = "";
    const secretCode = "bambahq";

    const handleKeyDown = (e: KeyboardEvent) => {
      sequence += e.key.toLowerCase();
      if (sequence.length > secretCode.length) {
        sequence = sequence.slice(sequence.length - secretCode.length);
      }
      if (sequence === secretCode) {
        router.push("/hq");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Secret door 2: 5 phantom taps on logo text
  const handlePhantomTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newTaps = taps + 1;
    setTaps(newTaps);

    if (newTaps >= 5) {
      setTaps(0);
      router.push("/hq");
    }

    setTimeout(() => setTaps(0), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    if (onSearch) {
      onSearch({ search: query, location: loc, date, category: cat });
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setQuery(keyword);
    setIsSearchOpen(false);
    if (onSearch) {
      onSearch({ search: keyword, location: loc, date, category: cat });
    }
  };

  // Instant keystroke preview matches
  const matchedEvents = query.trim().length > 0
    ? events.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.location.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  return (
    <header className="w-full bg-slate-950 font-sans border-b border-slate-900 relative">
      
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-slate-950 border-b border-slate-900 text-xs text-slate-400 py-1.5 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-white font-mono text-[11px] font-bold">
              <svg 
                className="w-4 h-3 rounded-xs shadow-xs shrink-0" 
                viewBox="0 0 900 600" 
                aria-label="Kenya Flag"
              >
                <rect width="900" height="600" fill="#000000" />
                <rect y="160" width="900" height="40" fill="#FFFFFF" />
                <rect y="200" width="900" height="200" fill="#BA121A" />
                <rect y="400" width="900" height="40" fill="#FFFFFF" />
                <rect y="440" width="900" height="160" fill="#037A24" />
                <ellipse cx="450" cy="300" rx="46" ry="120" fill="#BA121A" stroke="#FFFFFF" strokeWidth="8" />
                <ellipse cx="450" cy="300" rx="14" ry="40" fill="#000000" />
              </svg>
              <span>KE</span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Nairobi, Kenya</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link 
              href="/studio" 
              className="hover:text-white transition-colors text-[11px] font-medium"
            >
              Host Event
            </Link>

            <Link 
              href="/polls" 
              className="hover:text-orange-400 transition-colors flex items-center gap-1 text-[11px] font-medium"
            >
              <Vote className="w-3.5 h-3.5 text-orange-500" />
              <span>Voting Center</span>
            </Link>

            <Link 
              href="/help" 
              className="hover:text-white transition-colors text-[11px]"
            >
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & CATEGORY BAR */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                <img
                  src="/logo.svg"
                  alt="Bamba Tickets"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </div>

              <div
                onClick={handlePhantomTap}
                className="cursor-default select-none"
              >
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  BAMBA<span className="text-orange-500">TICKETS</span>
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCat(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  cat === item
                    ? "bg-slate-800 text-orange-400 shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {isLoading ? (
              <div className="w-24 h-9 bg-slate-800/60 rounded-xl animate-pulse" />
            ) : !session ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {isOrganizer ? (
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-orange-300 border border-orange-500/30 text-xs font-bold transition-all shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                    <span>Studio</span>
                  </Link>
                ) : (
                  <Link
                    href="/become-organizer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>Become an Organiser</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="flex flex-col items-end leading-tight sm:flex">
                    <span className="text-xs font-bold text-white truncate max-w-28">
                      {session.user?.firstName || "Account"}
                    </span>
                    <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider">
                      {session.user?.role || "CUSTOMER"}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. GREYFIED 3-SEGMENT SEARCH CARD & SMART DIALOG */}
      <div className="bg-slate-900 px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto relative" ref={searchContainerRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="bg-slate-200/90 hover:bg-slate-200 border border-slate-300 rounded-2xl p-1.5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-1 items-center transition-colors relative z-20"
          >
            {/* Segment 1: Location */}
            <div className="md:col-span-3 flex items-center gap-3 px-3 py-1.5 hover:bg-slate-300/50 rounded-xl transition-colors border-b md:border-b-0 md:border-r border-slate-300">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[9px] font-mono font-bold uppercase text-slate-600 tracking-wider">
                  Location
                </span>
                <div className="relative">
                  <select
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-bold outline-none cursor-pointer pr-4 appearance-none truncate"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="text-slate-900 bg-white">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Segment 2: Dates */}
            <div className="md:col-span-3 flex items-center gap-3 px-3 py-1.5 hover:bg-slate-300/50 rounded-xl transition-colors border-b md:border-b-0 md:border-r border-slate-300">
              <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block text-[9px] font-mono font-bold uppercase text-slate-600 tracking-wider">
                  Dates
                </span>
                <div className="relative">
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-bold outline-none cursor-pointer pr-4 appearance-none truncate"
                  >
                    {DATES.map((d) => (
                      <option key={d} value={d} className="text-slate-900 bg-white">
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Segment 3: Search Query & Actions */}
            <div className="md:col-span-6 flex items-center gap-2 pl-3 pr-1 py-1">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex-1 min-w-0 pr-2">
                <span className="block text-[9px] font-mono font-bold uppercase text-slate-600 tracking-wider">
                  Search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  placeholder="Artist, Event, Venue, or Poll..."
                  className="w-full bg-transparent text-slate-950 text-xs sm:text-sm font-semibold placeholder:text-slate-500 outline-none truncate"
                />
              </div>

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-slate-300 text-slate-500 rounded-full transition-colors cursor-pointer mr-0.5"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Cancel Button: Available whenever search view is active */}
              {isSearchOpen && (
                <button
                  type="button"
                  onClick={handleCancelSearch}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-300/50 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-orange-500/25 shrink-0 active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* ========================================================================= */}
          {/* BAMBATICKETS LIVE SEARCH DIALOG (POWERED BY REAL PLATFORM EVENTS)         */}
          {/* ========================================================================= */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-950/95 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl p-4 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header with quick Cancel / Dismiss action */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-900">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  {query.trim() ? "Live Search Results" : "Platform Discoveries"}
                </span>
                <button
                  type="button"
                  onClick={handleCancelSearch}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-orange-400 font-bold transition-colors cursor-pointer"
                >
                  Cancel <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* STATE A: User has NOT typed yet -> Show REAL Trending Events & Venues */}
              {!query.trim() ? (
                <div className="space-y-6">
                  
                  {/* Real Trending Events */}
                  {trendingEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        Trending on BambaTickets
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {trendingEvents.map((evt) => {
                          const lowestPrice = evt.ticketTiers?.length > 0
                            ? Math.min(...evt.ticketTiers.map((t) => t.price))
                            : 0;

                          return (
                            <Link
                              key={evt.id}
                              href={`/events/${evt.id}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all"
                            >
                              <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 relative">
                                {evt.imageUrl ? (
                                  <img
                                    src={evt.imageUrl}
                                    alt={evt.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <Ticket className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                                  {evt.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {evt.location}
                                </p>
                                <span className="text-[10px] font-mono text-orange-400 font-bold">
                                  {lowestPrice === 0 ? "FREE" : `KES ${lowestPrice.toLocaleString()}`}
                                </span>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Platform Venues */}
                  {popularVenues.length > 0 && (
                    <div className="border-t border-slate-900 pt-4">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        Popular Venues in Kenya
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {popularVenues.map((venue) => (
                          <button
                            key={venue}
                            type="button"
                            onClick={() => handleSelectKeyword(venue)}
                            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer text-left"
                          >
                            <span className="truncate">{venue}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Event Keywords */}
                  {activeEventKeywords.length > 0 && (
                    <div className="border-t border-slate-900 pt-4">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                        Suggested Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeEventKeywords.map((title) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => handleSelectKeyword(title)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-orange-500/40 text-xs font-medium transition-all cursor-pointer truncate max-w-xs"
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STATE B: User is actively typing -> Instant Live Event Matches */
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 pb-3 mb-3">
                    <span className="uppercase tracking-wider">
                      Matching &ldquo;<span className="text-orange-400">{query}</span>&rdquo;
                    </span>
                    <span className="text-slate-500">{matchedEvents.length} preview(s)</span>
                  </div>

                  {matchedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {matchedEvents.map((evt) => {
                        const lowestPrice = evt.ticketTiers?.length > 0
                          ? Math.min(...evt.ticketTiers.map((t) => t.price))
                          : 0;

                        return (
                          <Link
                            key={evt.id}
                            href={`/events/${evt.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="group flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all"
                          >
                            <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 relative">
                              {evt.imageUrl ? (
                                <img
                                  src={evt.imageUrl}
                                  alt={evt.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                  <Ticket className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                                {evt.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {evt.location}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-orange-400 font-bold">
                                  {lowestPrice === 0 ? "FREE" : `KES ${lowestPrice.toLocaleString()}`}
                                </span>
                              </div>
                            </div>

                            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors shrink-0 mr-1" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No matching events found for &ldquo;{query}&rdquo;. Press Enter to query all categories.
                    </div>
                  )}

                  {/* Dialog Footer Action */}
                  <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-300">Enter</kbd> to search
                    </span>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                    >
                      View all results &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </header>
  );
}