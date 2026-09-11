import prisma from "../../../lib/prisma";
import { Role } from "@prisma/client";
import {
  Calendar,
  Ticket,
  Users,
  ActivitySquare,
  AlertTriangle,
  Clock,
  TrendingUp,
  XOctagon,
  ShieldAlert,
  CheckCircle2,
  Receipt,
  ArrowRight,
} from "lucide-react";
import CreateNodeForm from "../components/CreateNodeForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import UserSearchRadar from "../components/UserSearchRadar";
import PayoutQueue from "../components/PayoutQueue";

export default async function SupervisorView({ role }: { role: Role }) {
  const [
    eventStats,
    bookingStats,
    organizersCount,
    recentBookings,
    liveEvents,
    pendingDrafts,
    radarUsers,
    pendingPayouts,
    completedPayouts,
  ] = await Promise.all([
    prisma.event.groupBy({
      by: ["isPublished"],
      _count: { id: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { title: true } },
        _count: { select: { tickets: true } },
      },
    }),
    prisma.event.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: { select: { firstName: true, lastName: true } },
        ticketTiers: { select: { capacity: true } },
        bookings: { select: { _count: { select: { tickets: true } } } },
      },
    }),
    prisma.event.findMany({
      where: { isPublished: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ORGANIZER", "IT_TEAM"] } },
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

  const activeEventsCount =
    eventStats.find((s) => s.isPublished)?._count.id || 0;
  const draftEventsCount =
    eventStats.find((s) => !s.isPublished)?._count.id || 0;

  const successBookings =
    bookingStats.find((s) => s.status === "SUCCESS")?._count.id || 0;
  const pendingBookings =
    bookingStats.find((s) => s.status === "PENDING")?._count.id || 0;
  const failedBookings =
    bookingStats.find((s) => s.status === "FAILED")?._count.id || 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-500/50" />
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Active Operations
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
            {activeEventsCount.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            Published events live on platform
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            {draftEventsCount > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Action Required
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
            {draftEventsCount.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            Pending draft approvals
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Transaction Health
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
            {successBookings.toLocaleString()}
          </div>
          <div className="flex items-center gap-3 mt-2 relative z-10">
            <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> {pendingBookings}
            </span>
            <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
              <XOctagon className="w-3 h-3 text-red-500" /> {failedBookings}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-1 relative z-10">
            Organizer Network
          </h3>
          <div className="text-2xl sm:text-3xl font-black text-white relative z-10 tracking-tight">
            {organizersCount.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono relative z-10">
            Verified platform partners
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mt-8">
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
          <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
            <TrendingUp className="w-4 h-4 text-cyan-500" /> Live Event
            Telemetry
          </h2>
          <div className="space-y-4 overflow-y-auto terminal-scroll pr-2">
            {liveEvents.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono text-center py-8">
                No active events detected on the network.
              </div>
            ) : (
              liveEvents.map((event) => {
                const capacity = event.ticketTiers.reduce(
                  (acc: number, tier: { capacity: number }) =>
                    acc + tier.capacity,
                  0,
                );
                const sold = event.bookings.reduce(
                  (acc: number, booking: { _count: { tickets: number } }) =>
                    acc + booking._count.tickets,
                  0,
                );
                const percentage =
                  capacity > 0
                    ? Math.min(100, Math.round((sold / capacity) * 100))
                    : 0;

                return (
                  <div
                    key={event.id}
                    className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">
                          {event.title}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-500">
                          ORG: {event.organizer.firstName}{" "}
                          {event.organizer.lastName} // DATE:{" "}
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                        {percentage}% SOLD
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          percentage > 90
                            ? "bg-red-500"
                            : percentage > 70
                              ? "bg-amber-500"
                              : "bg-cyan-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
                      <span>{sold.toLocaleString()} TIX ISSUED</span>
                      <span>MAX CAP: {capacity.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
          <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Pending Approvals
          </h2>
          <div className="flex-1 overflow-y-auto terminal-scroll pr-2 space-y-3">
            {pendingDrafts.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono text-center py-8">
                Queue is clear.
              </div>
            ) : (
              pendingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-2"
                >
                  <h4 className="text-xs font-bold text-amber-100 truncate">
                    {draft.title}
                  </h4>
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] font-mono text-amber-500/70">
                      BY: {draft.organizer.firstName.charAt(0)}.{" "}
                      {draft.organizer.lastName}
                    </p>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      REVIEW REQ
                    </span>
                  </div>
                </div>
              ))
            )}
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

        {/* Payout Queue with Execution Rights Enabled */}
        <div className="lg:col-span-2 h-128">
          <PayoutQueue payouts={pendingPayouts} canExecute={true} />
        </div>
      </div>

      {/* NEW: Disbursement History Stream for Supervisors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
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

        <div className="grid grid-cols-1 gap-6 h-128">
          <UserSearchRadar
            initialUsers={radarUsers.map((u) => ({
              ...u,
              createdAt: u.createdAt,
            }))}
          />
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
