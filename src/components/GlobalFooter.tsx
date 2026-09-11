import Link from "next/link";
import { Shield, FileText, Ticket } from "lucide-react";

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Bamba Tickets"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              BAMBA<span className="text-orange-500">TICKETS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-sm">
            The secure, high-performance event gateway. Connecting organizers
            with audiences through advanced ticketing architecture.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-cyan-500" /> Platform
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/events"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Discover Events
              </Link>
            </li>
            <li>
              <Link
                href="/register?role=organizer"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Host an Event
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                System Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Legal & Trust
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/terms"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/refunds"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Refund Guidelines
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Support Center
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-slate-500 font-mono">
          &copy; {currentYear} Bamba Tickets Corporation. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEMS OPERATIONAL
        </div>
      </div>
    </footer>
  );
}
