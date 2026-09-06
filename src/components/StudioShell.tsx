"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Compass,
  Ticket,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface StudioShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function StudioShell({ children, user }: StudioShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const userName = user.name || "Creator";
  const userEmail = user.email || "Organizer Account";

  const navLinks = [
    {
      name: "Overview",
      href: "/studio",
      icon: LayoutDashboard,
      color: "text-fuchsia-400",
    },
    {
      name: "Create Event",
      href: "/studio/events/new",
      icon: PlusCircle,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-fuchsia-500 selection:text-white">
      {/* 📱 MOBILE HEADER BAR */}
      <header className="md:hidden h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-900 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Bamba
            <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-cyan-400">
              Studio
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio/events/new"
            className="bg-white text-black text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm"
          >
            New
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
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

      {/* 📱 MOBILE SLIDE-OVER DRAWER & BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark Glass Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-6 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-bold text-white">
                    BambaStudio
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-slate-900 text-white border border-slate-800 shadow-inner"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${link.color}`} />
                      {link.name}
                    </Link>
                  );
                })}

                <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Marketplace
                </div>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-all"
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Public Discovery
                </Link>
              </nav>
            </div>

            <div className="p-4 border-t border-slate-900/80 m-4 rounded-2xl bg-slate-900/40 border backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-fuchsia-600 to-cyan-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate pr-2">
                  <p className="text-xs font-semibold text-slate-200 truncate tracking-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
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

      {/* 💻 DESKTOP STICKY SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-slate-950 border-r border-slate-900/80 flex-col justify-between shrink-0 sticky top-0 h-screen select-none">
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center px-6 border-b border-slate-900/80 gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Bamba
                <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-cyan-400">
                  Studio
                </span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                Creator Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group tracking-wide ${
                    isActive
                      ? "bg-slate-900 text-white border border-slate-800/80 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform`}
                  />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Marketplace
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all group tracking-wide"
            >
              <Compass className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              Public Discovery
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-slate-900/80 m-4 rounded-2xl bg-slate-900/40 border backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-fuchsia-600 to-cyan-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-slate-200 truncate tracking-tight">
                {userName}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="hidden md:flex h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/80 px-10 items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">
              Workspace
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              Events Control Room
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio/events/new"
              className="bg-white hover:bg-slate-200 text-black text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 tracking-tight"
            >
              <PlusCircle className="w-4 h-4" />
              New Event
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
