"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowRight,
  Search,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

type NavbarProps = {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
};

export default function Navbar({
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const router = useRouter();

  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const [taps, setTaps] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <div
      className={`sticky top-0 z-50 w-full pt-2 sm:pt-4 pb-2 px-4 sm:px-8 lg:px-12 pointer-events-none transition-all duration-300 ${isScrolled ? "-translate-y-2" : ""}`}
    >
      <header
        className={`pointer-events-auto max-w-7xl mx-auto border transition-all duration-500 rounded-2xl sm:rounded-3xl flex flex-wrap sm:flex-nowrap items-center justify-between p-3 sm:px-6 sm:py-0 min-h-16 sm:h-20 gap-x-2 gap-y-3 sm:gap-6 ${isScrolled ? "bg-slate-950/90 border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md" : "bg-slate-900/85 border-orange-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"}`}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes tv-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-tv-scroll { animation: tv-scroll 8s linear infinite; display: inline-block; white-space: nowrap; }
          .fade-edges { mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
        `,
          }}
        />

        {/* Brand / Logo */}
        <div className="order-1 flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-transform duration-300 hover:scale-105 overflow-hidden"
          >
            <img
              src="/logo.svg"
              alt="Bamba Tickets"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain hover:scale-110 transition-transform duration-300"
            />
          </Link>

          <div
            onClick={handlePhantomTap}
            className="relative w-24 sm:w-32 lg:w-40 h-8 overflow-hidden fade-edges flex items-center shrink-0 cursor-default select-none"
          >
            <div className="animate-tv-scroll text-sm sm:text-base lg:text-lg font-black tracking-wider text-white">
              BAMBA <span className="text-orange-500">TICKETS</span>
            </div>
          </div>
        </div>

        {/* User Actions (Top Right) */}
        <div className="order-2 sm:order-3 flex items-center gap-3 sm:gap-4 shrink-0 ml-auto sm:ml-0 min-h-10">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block w-32 h-9 bg-slate-800/50 rounded-full animate-pulse" />
              <div className="w-24 h-9 sm:h-10 bg-orange-500/20 rounded-full animate-pulse" />
            </div>
          ) : !session ? (
            <>
              <Link
                href="/studio"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-full text-xs transition-all"
              >
                Organizer Studio
              </Link>
              <Link
                href="/login"
                className="group relative px-4 py-2 sm:px-6 sm:py-2.5 bg-linear-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-slate-950 font-black rounded-full text-[11px] sm:text-xs tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 active:scale-95 overflow-hidden flex items-center gap-1.5 shrink-0"
              >
                <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center gap-1.5">
                  Sign In <ArrowRight className="w-3 h-3 hidden sm:block" />
                </span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 sm:border-l sm:border-slate-800/80">
              {/* Name & Role (Restored to normal visibility) */}
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white tracking-wide truncate max-w-20 sm:max-w-30">
                  {session?.user?.firstName || "User"}
                </span>
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest">
                  {session?.user?.role || "CUSTOMER"}
                </span>
              </div>

              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner shrink-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-orange-400 transition-colors relative z-10" />
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 sm:p-2.5 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search Block & Studio Button */}
        <div className="order-3 sm:order-2 w-full sm:flex-1 sm:max-w-md px-1 sm:px-4 flex gap-2 items-center">
          {/* Studio Button placed in front of search bar */}
          {session?.user?.role === "ORGANIZER" && (
            <Link
              href="/studio"
              title="Organizer Studio"
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 bg-slate-900 border border-slate-700 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 rounded-full transition-all text-xs font-bold shadow-inner shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Studio</span>
            </Link>
          )}

          <div className="relative w-full group flex-1">
            <Search
              className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchQuery ? "text-orange-500" : "text-slate-400 group-focus-within:text-orange-500"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 rounded-full pl-9 sm:pl-11 pr-10 py-2 sm:py-2.5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
            />
            {searchQuery && onSearchChange && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-800 hover:bg-orange-500 text-slate-400 hover:text-slate-950 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
