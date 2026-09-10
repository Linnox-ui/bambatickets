import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";
import Airlock from "./Airlock";
import TwoFactorGate from "./TwoFactorGate";
import { verifyClearanceToken } from "../../lib/hq-security";
import { Role } from "@prisma/client"; // 🚀 FIXED: Imported the strict Role enum from Prisma
import {
  ShieldAlert,
  Terminal,
  Users,
  Banknote,
  Ticket,
  LogOut,
  Calendar,
  Cpu,
  Activity,
  Server,
} from "lucide-react";

export default async function HQDashboard() {
  const cookieStore = await cookies();

  // ==========================================
  // RING 1: AIRLOCK (HMAC SIGNATURE CHECK)
  // ==========================================
  const hqClearance = cookieStore.get("bamba_hq_clearance");
  if (!hqClearance || !verifyClearanceToken(hqClearance.value, 15)) {
    return <Airlock />;
  }

  // ==========================================
  // RING 2: IDENTITY CHECK
  // ==========================================
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/hq");
  }

  // ==========================================
  // RING 3: CLEARANCE LEVEL CHECK
  // ==========================================
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // 🚀 FIXED: Strictly typed the array as Role[] so Prisma doesn't throw the string[] error
  const hqRoles: Role[] = ["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"];

  if (!user || !hqRoles.includes(user.role as Role)) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center font-mono text-center p-4 selection:bg-red-900 selection:text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="max-w-xl w-full border border-red-900/60 bg-black p-8 sm:p-12 shadow-[0_0_80px_rgba(220,38,38,0.2)] text-left space-y-6 relative z-10">
          <div className="flex items-center gap-4 text-red-500 border-b border-red-900/50 pb-4">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
            <div>
              <h1 className="text-xl font-black tracking-widest uppercase">
                Security Lockdown
              </h1>
              <p className="text-xs text-red-400 font-mono">
                Unauthorized Clearance Attempt
              </p>
            </div>
          </div>
          <div className="bg-red-950/20 border border-red-900/50 p-4 text-xs space-y-2 text-red-300">
            <div className="flex justify-between">
              <span>TARGET IDENTITY:</span>
              <span className="text-white font-bold">
                {user?.email || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ASSIGNED ROLE:</span>
              <span className="text-red-400 font-bold">
                {user?.role || "CUSTOMER"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>REQUIRED LEVEL:</span>
              <span className="text-white font-bold bg-red-950 px-1 border border-red-800">
                COMMAND_NODE_AUTHORIZED
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
            This incident has been logged. Terminate this connection
            immediately.
          </p>
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" /> Disconnect Node
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // RING 4: 2FA CRYPTOGRAPHIC CLEARANCE
  // ==========================================
  const twoFactorClearance = cookieStore.get("bamba_hq_2fa");
  if (
    !twoFactorClearance ||
    !verifyClearanceToken(twoFactorClearance.value, 15)
  ) {
    return <TwoFactorGate email={user.email} />;
  }

  // ==========================================
  // GOD MODE REACHED: REAL DATABASE AGGREGATIONS
  // ==========================================
  const [
    totalUsers,
    totalEvents,
    totalBookings,
    revenueAgg,
    staffMembers,
    systemLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: "SUCCESS" } }),
    prisma.booking.aggregate({
      where: { status: "SUCCESS" },
      _sum: { platformFee: true, amount: true },
    }),
    prisma.user.findMany({
      where: { role: { in: hqRoles } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6, // Fetch the latest 6 logs for the terminal
    }),
  ]);

  const platformRevenue = revenueAgg._sum.platformFee || 0;
  const grossVolume = revenueAgg._sum.amount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* GLOBAL COMMAND CENTER STYLES & ANIMATIONS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        @keyframes shockwave-slow {
          0% { transform: scale(0.8); opacity: 0.5; border-width: 2px; }
          100% { transform: scale(2); opacity: 0; border-width: 1px; }
        }
        .animate-shockwave-slow {
          animation: shockwave-slow 3s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
        .terminal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: #020617;
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `,
        }}
      />

      {/* SUBTLE GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />

      {/* HEADER SECTION */}
      {/* 🚀 FIXED: Replaced max-w-[90rem] with max-w-360 for Tailwind v4 compatibility */}
      <header className="max-w-360 mx-auto flex flex-wrap items-center justify-between pb-6 border-b border-slate-800/60 gap-4 relative z-10">
        <div className="flex items-center gap-5">
          {/* THE BAMBA COMMAND CORE LOGO */}
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
            {/* 🚀 FIXED: Removed conflicting text-color and upgraded to bg-linear-to-r */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              BAMBA{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-amber-500">
                COMMAND
              </span>
            </h1>
            <p className="text-[11px] font-mono tracking-widest text-slate-400 mt-0.5">
              NODE ACTIVE //{" "}
              {user.role === "SUPER_ADMIN" && (
                <span className="text-emerald-400 font-bold">
                  CEO CLEARANCE
                </span>
              )}
              {user.role === "SUPERVISOR" && (
                <span className="text-cyan-400 font-bold">SUPERVISOR</span>
              )}
              {user.role === "IT_TEAM" && (
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
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-all shadow-inner active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect
          </Link>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      {/* 🚀 FIXED: Replaced max-w-[90rem] with max-w-360 */}
      <main className="max-w-360 mx-auto py-8 space-y-8 relative z-10">
        {/* KPI METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Revenue Node */}
          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-emerald-400" />
              </div>
              <Activity className="w-4 h-4 text-emerald-500/50" />
            </div>
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
              Platform Revenue
            </h3>
            <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
              KES{" "}
              <span className="text-emerald-400">
                {platformRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
              Gross Vol: KES {grossVolume.toLocaleString()}
            </p>
          </div>

          {/* Tickets Node */}
          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-orange-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
              Confirmed Orders
            </h3>
            <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
              {totalBookings.toLocaleString()}
            </div>
            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden relative z-10">
              <div className="bg-orange-500 h-full w-[85%]" />
            </div>
          </div>

          {/* Events Node */}
          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
              Active Events
            </h3>
            <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
              {totalEvents.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
              Public & Unpublished Drafts
            </p>
          </div>

          {/* Users Node */}
          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-purple-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
              Registered Identities
            </h3>
            <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
              Customers & Organizers
            </p>
          </div>
        </div>

        {/* LOWER SECTION: TERMINAL & STAFF */}
        {/* 🚀 FIXED: Replaced lg:h-[32rem] with lg:h-128 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 h-auto lg:h-128">
          {/* THE TERMINAL (System Logs) */}
          <div className="lg:col-span-2 flex flex-col bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
            {/* Terminal Header */}
            <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 font-bold tracking-widest flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> SYSTEM.LOG
              </div>
            </div>

            {/* Terminal Window */}
            <div className="relative flex-1 p-5 font-mono text-xs overflow-y-auto terminal-scroll bg-[#030712] z-0">
              {/* Fake Scanline Effect */}
              {/* 🚀 FIXED: Replaced bg-gradient-to-b with bg-linear-to-b */}
              <div className="absolute top-0 left-0 w-full h-8 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none animate-scanline z-20" />

              <div className="space-y-4 relative z-10">
                <div className="text-emerald-500/70 pb-2 border-b border-slate-800/50 mb-4">
                  Bamba OS [Version 10.0.19045.3324]
                  <br />
                  (c) Bamba Tickets Corporation. All rights reserved.
                  <br />
                  <br />
                  C:\\HQ\\Command&gt; tail -f /var/log/system.log
                </div>

                {systemLogs.length === 0 ? (
                  <div className="text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
                    Listening for events...
                  </div>
                ) : (
                  systemLogs.map((log) => (
                    // 🚀 FIXED: Replaced break-words with wrap-break-word
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4 wrap-break-word"
                    >
                      <div className="shrink-0 text-slate-500 w-32">
                        {new Date(log.createdAt).toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                      <div
                        className={`shrink-0 w-24 font-bold ${
                          log.level === "CRITICAL"
                            ? "text-red-500"
                            : log.level === "WARNING"
                              ? "text-amber-500"
                              : "text-cyan-500"
                        }`}
                      >
                        [{log.level}]
                      </div>
                      <div
                        className={`${
                          log.level === "CRITICAL"
                            ? "text-red-400"
                            : log.level === "WARNING"
                              ? "text-amber-300"
                              : "text-slate-300"
                        }`}
                      >
                        {log.message}
                        {log.path && (
                          <span className="text-slate-600 ml-2">
                            ({log.path})
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Blinking Cursor */}
                <div className="flex items-center gap-2 mt-4 text-emerald-500">
                  <span className="text-slate-500">C:\\HQ\\Command&gt;</span>{" "}
                  <span className="w-2 h-4 bg-emerald-500 animate-[pulse_1s_steps(2,start)_infinite]" />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE STAFF WIDGET */}
          <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col">
            <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
              <Server className="w-4 h-4 text-orange-500" /> Active Nodes (
              {staffMembers.length})
            </h2>

            <div className="flex-1 space-y-3 overflow-y-auto terminal-scroll pr-2">
              {staffMembers.map((staff) => (
                <div
                  key={staff.id}
                  className="group flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border font-black text-[10px] ${
                        staff.role === "SUPER_ADMIN"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : staff.role === "IT_TEAM"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-500"
                            : "bg-cyan-500/10 border-cyan-500/30 text-cyan-500"
                      }`}
                    >
                      {staff.firstName.charAt(0)}
                      {staff.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">
                        {staff.firstName} {staff.lastName}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500">
                        {staff.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-mono font-bold px-2 py-1 rounded shadow-inner ${
                      staff.role === "SUPER_ADMIN"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : staff.role === "IT_TEAM"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {staff.role.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
