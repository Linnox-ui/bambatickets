"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  Compass,
  Ticket,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

interface StudioShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function StudioShell({ children, user }: StudioShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = user.name || session?.user?.name || "Creator";
  const userEmail = user.email || session?.user?.email || "Organizer Account";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      name: "Overview",
      href: "/studio",
      icon: LayoutDashboard,
      color: "text-orange-400",
    },
    {
      name: "Create Event",
      href: "/studio/events/new",
      icon: PlusCircle,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-slate-950 font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes tv-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-tv-scroll { animation: tv-scroll 8s linear infinite; display: inline-block; white-space: nowrap; }
          .fade-edges { mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
        `,
        }}
      />

      <div
        className={`sticky top-0 z-50 w-full pt-2 sm:pt-4 pb-2 px-4 sm:px-8 lg:px-12 pointer-events-none transition-all duration-300 ${isScrolled ? "-translate-y-2" : ""}`}
      >
        <header
          className={`pointer-events-auto max-w-7xl mx-auto border transition-all duration-500 rounded-2xl sm:rounded-3xl flex items-center justify-between p-3 sm:px-6 sm:py-0 h-16 sm:h-20 gap-4 ${isScrolled ? "bg-slate-950/90 border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md" : "bg-slate-900/85 border-orange-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"}`}
        >
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/studio"
              className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-transform duration-300 hover:scale-105 overflow-hidden"
            >
              <img
                src="/logo.svg"
                alt="Bamba Studio"
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain hover:scale-110 transition-transform duration-300"
              />
            </Link>

            <div className="relative w-24 sm:w-32 h-8 overflow-hidden fade-edges flex items-center shrink-0 cursor-default select-none">
              <div className="animate-tv-scroll text-xs sm:text-sm font-black tracking-wider text-white">
                BAMBA <span className="text-orange-500">STUDIO</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3 pl-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white tracking-wide">
                  {userName}
                </span>
                <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest">
                  Organizer
                </span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner shrink-0 relative overflow-hidden group">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-orange-400 transition-colors relative z-10" />
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </header>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-6 gap-8">
        <aside className="hidden md:flex w-64 bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 flex-col justify-between shrink-0 h-[calc(100vh-140px)] sticky top-28 shadow-xl">
          <div>
            <div className="flex items-center gap-3 px-3.5 py-3 mb-6 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-500 shadow-inner">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-white block leading-tight">
                  Creator Hub
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">
                  Control Room
                </span>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="px-3 pb-1 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all group ${
                      isActive
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform`}
                    />
                    {link.name}
                  </Link>
                );
              })}

              <div className="pt-4 pb-1 px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                Network
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
              >
                <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                Public Discovery
              </Link>
            </nav>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-[10px] text-slate-950 shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {userName}
                </p>
                <p className="text-[9px] font-mono text-orange-500 truncate">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 z-10 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-white">
                      BAMBA STUDIO
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-6 space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? "bg-orange-500 text-slate-950 shadow-md"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.name}
                      </Link>
                    );
                  })}
                  <div className="pt-6 pb-2 px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    Marketplace
                  </div>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    Public Discovery
                  </Link>
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800 m-4 rounded-2xl bg-slate-950 border flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-xs text-slate-950 shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] font-mono text-orange-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      </div>
    </div>
  );
}
