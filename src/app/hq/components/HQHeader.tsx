import Link from "next/link";
import { Role } from "@prisma/client";
import { LogOut } from "lucide-react";

export default function HQHeader({ role }: { role: Role }) {
  return (
    <header className="max-w-360 mx-auto flex flex-wrap items-center justify-between pb-6 border-b border-slate-800/60 gap-4 relative z-10">
      <div className="flex items-center gap-5">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-orange-500/60 opacity-0 animate-shockwave-slow"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-orange-500/40 opacity-0 animate-shockwave-slow"
            style={{ animationDelay: "1.5s" }}
          />
          <div className="relative w-full h-full bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] z-10 overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src="/logo.svg"
              alt="Bamba HQ"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            BAMBA{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-amber-500">
              COMMAND
            </span>
          </h1>
          <p className="text-[11px] font-mono tracking-widest text-slate-400 mt-0.5">
            NODE ACTIVE //{" "}
            {role === "SUPER_ADMIN" && (
              <span className="text-emerald-400 font-bold">CEO CLEARANCE</span>
            )}
            {role === "SUPERVISOR" && (
              <span className="text-cyan-400 font-bold">SUPERVISOR</span>
            )}
            {role === "IT_TEAM" && (
              <span className="text-purple-400 font-bold">SYSADMIN</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          ALL SYSTEMS NOMINAL
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-all shadow-inner active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" /> Disconnect
        </Link>
      </div>
    </header>
  );
}
