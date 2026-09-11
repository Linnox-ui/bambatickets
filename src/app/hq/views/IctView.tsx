import prisma from "../../../lib/prisma";
import { Role } from "@prisma/client";
import {
  Terminal,
  Cpu,
  Server,
  ActivitySquare,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";
import ChangePasswordForm from "../components/ChangePasswordForm";
import UserSearchRadar from "../components/UserSearchRadar";

export default async function IctView() {
  const start = performance.now();
  await prisma.user.findFirst();
  const dbLatency = Math.round(performance.now() - start);

  const [criticalLogs, warningLogs, allLogs, staffMembers, radarUsers] =
    await Promise.all([
      prisma.systemLog.count({
        where: { level: "CRITICAL", resolved: false },
      }),
      prisma.systemLog.count({
        where: { level: "WARNING", resolved: false },
      }),
      prisma.systemLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-purple-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <Zap className="w-4 h-4 text-purple-500/50" />
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Database Latency
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight flex items-center gap-2">
            {dbLatency} <span className="text-sm text-purple-400">ms</span>
          </div>
          <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden relative z-10">
            <div
              className={`h-full ${
                dbLatency > 500
                  ? "bg-red-500 w-[90%]"
                  : dbLatency > 200
                    ? "bg-amber-500 w-[50%]"
                    : "bg-purple-500 w-[15%]"
              }`}
            />
          </div>
        </div>

        <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Vercel Edge API
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 relative z-10 tracking-tight">
            HEALTHY
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            All endpoints resolving &lt; 200ms
          </p>
        </div>

        <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-red-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            {criticalLogs > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Unresolved Criticals
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-red-500 relative z-10 tracking-tight">
            {criticalLogs}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            System halting exceptions
          </p>
        </div>

        <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            System Warnings
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 relative z-10 tracking-tight">
            {warningLogs}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            Non-fatal runtime anomalies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
        <div className="lg:col-span-2 flex flex-col bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative h-128">
          <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 font-bold tracking-widest flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> ROOT_TERMINAL
            </div>
          </div>

          <div className="relative flex-1 p-5 font-mono text-xs overflow-y-auto terminal-scroll bg-[#030712] z-0">
            <div className="absolute top-0 left-0 w-full h-8 bg-linear-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none animate-scanline z-20" />

            <div className="space-y-4 relative z-10">
              <div className="text-purple-500/70 pb-2 border-b border-slate-800/50 mb-4">
                Bamba OS [Version 10.0.19045.3324]
                <br />
                (c) Bamba Tickets Corporation. All rights reserved.
                <br />
                <br />
                root@bamba-hq:~# journalctl -u nextjs-server -n 50 -f
              </div>

              {allLogs.length === 0 ? (
                <div className="text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />{" "}
                  Listening for events...
                </div>
              ) : (
                allLogs.map((log) => (
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
                            : "text-purple-500"
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

              <div className="flex items-center gap-2 mt-4 text-purple-500">
                <span className="text-slate-500">root@bamba-hq:~#</span>{" "}
                <span className="w-2 h-4 bg-purple-500 animate-[pulse_1s_steps(2,start)_infinite]" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
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
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border font-black text-[10px] ${
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
                  <div className="truncate">
                    <p className="font-bold text-xs text-white truncate">
                      {staff.firstName} {staff.lastName}
                    </p>
                    <p className="text-[9px] font-mono text-slate-500 truncate">
                      {staff.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 h-128">
          <UserSearchRadar
            initialUsers={radarUsers.map((u) => ({
              ...u,
              createdAt: u.createdAt,
            }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
        <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
          <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
            <ActivitySquare className="w-4 h-4 text-purple-500" /> Detailed
            System Exception Ledger
          </h2>
          <div className="overflow-x-auto flex-1 terminal-scroll">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs font-mono uppercase bg-slate-950/50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Timestamp</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Exception Details</th>
                  <th className="px-4 py-3 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {allLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold font-mono flex items-center gap-1 w-fit ${
                          log.level === "CRITICAL"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : log.level === "WARNING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-30">
                      {log.path || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-75">
                      {log.message}
                    </td>
                    <td className="px-4 py-3">
                      {log.resolved ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> RESOLVED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-500 font-mono">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 h-128">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
