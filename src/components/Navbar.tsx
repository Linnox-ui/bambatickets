import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-orange-500/20 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-transform duration-300 group-hover:scale-105 overflow-hidden shrink-0">
            <img
              src="/logo.svg"
              alt="Bamba Tickets Logo"
              className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <div className="relative w-40 sm:w-48 h-8 overflow-hidden flex items-center fade-edges xs:flex">
            <div className="animate-tv-scroll text-lg font-black tracking-wider text-white">
              BAMBA <span className="text-orange-500">TICKETS</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all"
          >
            Organizer Studio
          </Link>
          <Link
            href="/login"
            className="group relative px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative">Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
