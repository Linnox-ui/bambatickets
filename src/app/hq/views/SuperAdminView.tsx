import prisma from "../../../lib/prisma";
import { Role } from "@prisma/client";
import {
  Banknote,
  Activity,
  Ticket,
  Calendar,
  Users,
  Cpu,
  Server,
  ActivitySquare,
  CheckCircle2,
  XOctagon,
  Clock,
  Receipt,
} from "lucide-react";
import CreateNodeForm from "../components/CreateNodeForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import UserSearchRadar from "../components/UserSearchRadar";
import PayoutQueue from "../components/PayoutQueue";

export default async function SuperAdminView({ role }: { role: Role }) {
  const [
    totalUsers,
    totalEvents,
    totalBookings,
    revenueAgg,
    staffMembers,
    systemLogs,
    recentBookings,
    radarUsers,
    pendingPayouts,
    completedPayouts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: "SUCCESS" } }),
    prisma.booking.aggregate({
      where: { status: "SUCCESS" },
      _sum: { platformFee: true, amount: true },
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
    prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { title: true } },
        _count: { select: { tickets: true } },
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
    prisma.payout.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        organizer: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.payout.findMany({
      where: { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        organizer: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  const platformRevenue = revenueAgg._sum.platformFee || 0;
  const grossVolume = revenueAgg._sum.amount || 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Total Event Assets
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
            {totalEvents.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            Public & Unpublished Drafts
          </p>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
        <div className="lg:col-span-2 flex flex-col bg-black border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative h-128">
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

          <div className="relative flex-1 p-5 font-mono text-xs overflow-y-auto terminal-scroll bg-[#030712] z-0">
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

              <div className="flex items-center gap-2 mt-4 text-emerald-500">
                <span className="text-slate-500">C:\\HQ\\Command&gt;</span>{" "}
                <span className="w-2 h-4 bg-emerald-500 animate-[pulse_1s_steps(2,start)_infinite]" />
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
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
          <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
            <ActivitySquare className="w-4 h-4 text-cyan-500" /> Global Ledger
            Stream
          </h2>
          <div className="overflow-x-auto flex-1 terminal-scroll">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs font-mono uppercase bg-slate-950/50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Ref ID</th>
                  <th className="px-4 py-3">Customer Identity</th>
                  <th className="px-4 py-3">Event Target</th>
                  <th className="px-4 py-3">Vol</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {booking.reference}
                    </td>
                    <td className="px-4 py-3 text-white text-xs font-bold">
                      {booking.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-30">
                      {booking.event.title}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 text-xs font-bold">
                      {booking._count.tickets}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold font-mono flex items-center gap-1 w-fit ${
                          booking.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : booking.status === "FAILED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {booking.status === "SUCCESS" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {booking.status === "FAILED" && (
                          <XOctagon className="w-3 h-3" />
                        )}
                        {booking.status === "PENDING" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 h-128">
          <PayoutQueue payouts={pendingPayouts} canExecute={true} />
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
          <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
            <Receipt className="w-4 h-4 text-emerald-500" /> Disbursed Payout
            History
          </h2>
          <div className="overflow-x-auto flex-1 terminal-scroll">
            {completedPayouts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Receipt className="w-8 h-8 mb-2" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  No disbursements logged yet
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs font-mono uppercase bg-slate-950/50 text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Organizer</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-bold">
                          {payout.organizer.firstName}{" "}
                          {payout.organizer.lastName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-35">
                          {payout.destination}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-300 font-bold">
                        {payout.reference || "Manual"}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-400 text-xs">
                        KES {payout.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-[9px] font-bold font-mono flex items-center gap-1 w-fit bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Disbursed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
        <div className="h-128">
          <CreateNodeForm creatorRole={role} />
        </div>

        <div className="h-128">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
