"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
  signOutAction: () => Promise<void>;
}

export default function DashboardLayout({
  children,
  user,
  signOutAction,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Events", href: "/events", icon: CalendarDays },
    { name: "Orders", href: "/orders", icon: Ticket },
    { name: "Attendees", href: "/attendees", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex">
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Ticket className="w-6 h-6 text-fuchsia-500" />
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-fuchsia-500">
            BambaTickets
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 p-1"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen
      `}
      >
        <div className="h-16 hidden md:flex items-center gap-2 px-6 border-b border-slate-800/60 shrink-0">
          <Ticket className="w-6 h-6 text-fuchsia-500" />
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-fuchsia-500">
            BambaTickets
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto mt-16 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  isActive
                    ? "bg-linear-to-r from-fuchsia-600/10 to-cyan-600/10 text-fuchsia-400 border border-fuchsia-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-fuchsia-400" : "text-slate-500"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60 shrink-0 bg-slate-900/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-fuchsia-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium text-slate-200 truncate">
                {user.name}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user.email}
              </span>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 z-10 relative">
          {children}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
