"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";

type NavbarProps = {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
};

export default function Navbar({
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const router = useRouter();
  const [taps, setTaps] = useState(0);

  // 🚀 THE PHANTOM PROTOCOL (DESKTOP)
  // Listens for the secret word "bambahq" typed anywhere on the site
  useEffect(() => {
    let sequence = "";
    const secretCode = "bambahq";

    const handleKeyDown = (e: KeyboardEvent) => {
      sequence += e.key.toLowerCase();
      // Keep the sequence length capped to our secret code length
      if (sequence.length > secretCode.length) {
        sequence = sequence.slice(sequence.length - secretCode.length);
      }
      // If the sequence matches perfectly, execute jump
      if (sequence === secretCode) {
        router.push("/hq");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // 🚀 THE PHANTOM PROTOCOL (MOBILE)
  // Rapid tap the TV marquee 5 times to trigger the jump
  const handlePhantomTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stops the link from sending you to the homepage

    const newTaps = taps + 1;
    setTaps(newTaps);

    if (newTaps >= 5) {
      setTaps(0);
      router.push("/hq");
    }

    // Reset the counter if they don't tap fast enough (2 seconds)
    setTimeout(() => setTaps(0), 2000);
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 sm:px-8 lg:px-12 pt-2 sm:pt-4 pb-2 pointer-events-none">
      <header className="pointer-events-auto max-w-7xl mx-auto border border-orange-500/20 bg-slate-900/85 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-wrap sm:flex-nowrap items-center justify-between p-3 sm:px-6 sm:py-0 min-h-16 sm:h-20 gap-x-2 gap-y-3 sm:gap-6 transition-all duration-300">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes tv-scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-tv-scroll {
            animation: tv-scroll 8s linear infinite;
            display: inline-block;
            white-space: nowrap;
          }
          .fade-edges {
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          }
        `,
          }}
        />

        {/* 1. LEFT: Logo + Secret Marquee */}
        <div className="order-1 flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-transform duration-300 hover:scale-105 overflow-hidden"
          >
            <img
              src="/logo.svg"
              alt="Bamba Tickets Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {/* 🚀 HIDDEN TRIGGER: Clicking this 5 times opens HQ */}
          <div
            onClick={handlePhantomTap}
            className="relative w-24 sm:w-32 lg:w-40 h-8 overflow-hidden fade-edges flex items-center shrink-0 cursor-default select-none"
          >
            <div className="animate-tv-scroll text-sm sm:text-base lg:text-lg font-black tracking-wider text-white">
              BAMBA <span className="text-orange-500">TICKETS</span>
            </div>
          </div>
        </div>

        {/* 2. RIGHT: Action Buttons (No HQ Button anywhere in the HTML!) */}
        <div className="order-2 sm:order-3 flex items-center gap-3 sm:gap-4 shrink-0 ml-auto sm:ml-0">
          <Link
            href="/studio"
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-full text-xs transition-all"
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
        </div>

        {/* 3. CENTER: The Live Search Bar */}
        <div className="order-3 sm:order-2 w-full sm:flex-1 sm:max-w-md px-1 sm:px-4">
          <div className="relative w-full group">
            <Search
              className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchQuery ? "text-orange-500" : "text-slate-400 group-focus-within:text-orange-500"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 rounded-full pl-9 sm:pl-11 pr-10 py-2 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
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
