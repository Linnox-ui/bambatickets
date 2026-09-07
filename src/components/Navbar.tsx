import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function Navbar() {
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

        <Link
          href="/"
          className="order-1 flex items-center gap-2 sm:gap-4 group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden">
            <img
              src="/logo.svg"
              alt="Bamba Tickets Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="relative w-24 sm:w-32 lg:w-40 h-8 overflow-hidden fade-edges flex items-center shrink-0">
            <div className="animate-tv-scroll text-sm sm:text-base lg:text-lg font-black tracking-wider text-white">
              BAMBA <span className="text-orange-500">TICKETS</span>
            </div>
          </div>
        </Link>

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

        <div className="order-3 sm:order-2 w-full sm:flex-1 sm:max-w-md px-1 sm:px-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 rounded-full pl-9 sm:pl-11 pr-4 py-2 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
            />
          </div>
        </div>
      </header>
    </div>
  );
}
