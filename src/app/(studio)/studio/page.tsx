import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import {
  TrendingUp,
  Ticket as TicketIcon,
  CalendarDays,
  ArrowRight,
  Activity,
  Banknote,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  XOctagon,
  Trophy,
} from "lucide-react";
import WalletWidget from "./components/WalletWidget";

type RecentBooking = {
  id: string;
  customerName: string;
  amount: number;
  organizerPayout: number;
  createdAt: Date;
  eventName: string;
  tickets: any[];
};

export default async function StudioDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { payoutMethod: true, payoutAccountNumber: true },
  });

  const hasPaymentMethod = !!(user?.payoutMethod && user?.payoutAccountNumber);

  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id },
    include: {
      bookings: {
        where: { status: "SUCCESS" },
        include: { tickets: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const previousPayouts = await prisma.payout.aggregate({
    where: {
      organizerId: session.user.id,
      status: { in: ["COMPLETED", "PENDING", "PROCESSING"] },
    },
    _sum: { amount: true },
  });

  const payoutHistory = await prisma.payout.findMany({
    where: { organizerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalPaidAndPending = previousPayouts._sum.amount || 0;

  let totalGrossRevenue = 0;
  let totalClearedRevenue = 0;
  let totalTicketsSold = 0;
  const recentBookings: RecentBooking[] = [];

  events.forEach((event) => {
    event.bookings.forEach((booking) => {
      totalGrossRevenue += booking.amount;
      totalClearedRevenue += booking.organizerPayout;
      totalTicketsSold += booking.tickets.length;
      recentBookings.push({
        ...booking,
        eventName: event.title,
      });
    });
  });

  const availableBalance = totalClearedRevenue - totalPaidAndPending;

  recentBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const topRecentBookings = recentBookings.slice(0, 5);

  return (
    <div className="w-full overflow-x-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fade-in-up pb-16">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />

      {/* --- UPDATED HEADER WITH POLLS LINK --- */}
      <div className="pb-5 sm:pb-6 border-b border-slate-800/80 mt-4 sm:mt-0 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Organizer Studio
          </h1>
          <p className="text-slate-400 mt-1.5 text-xs sm:text-base">
            Welcome back. Here is the live telemetry for your events.
          </p>
        </div>
        
        <Link
          href="/polls/dashboard"
          className="inline-flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-900 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800 rounded-xl text-slate-200 transition-all shadow-lg shrink-0 group w-full sm:w-auto justify-center sm:justify-start"
        >
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none mb-1">Voting Center</p>
            <p className="text-sm font-bold tracking-wide leading-none">Manage Polls</p>
          </div>
        </Link>
      </div>
      {/* -------------------------------------- */}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        <div className="min-w-0 w-full overflow-hidden max-w-full">
          <WalletWidget
            availableBalance={availableBalance}
            hasPaymentMethod={hasPaymentMethod}
          />
        </div>

        <div className="min-w-0 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-emerald-500/30 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-colors group flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="p-3 sm:p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
                <Banknote className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-slate-400 font-medium text-sm sm:text-base uppercase tracking-wider truncate min-w-0">
                Gross Revenue
              </h3>
            </div>
            <div className="flex flex-row items-baseline gap-2 min-w-0 w-full overflow-hidden">
              <span className="text-emerald-500 text-sm sm:text-base font-bold font-mono shrink-0">
                KES
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight truncate min-w-0">
                {totalGrossRevenue.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-6 uppercase tracking-widest pt-4 border-t border-slate-800/60 truncate min-w-0">
            Total historical sales
          </p>
        </div>

        <div className="min-w-0 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-orange-500/30 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-colors group flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="p-3 sm:p-4 bg-orange-500/10 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
                <TicketIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-slate-400 font-medium text-sm sm:text-base uppercase tracking-wider truncate min-w-0">
                Tickets Sold
              </h3>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight truncate min-w-0">
              {totalTicketsSold.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-6 uppercase tracking-widest pt-4 border-t border-slate-800/60 truncate min-w-0">
            Across all events
          </p>
        </div>

        <div className="min-w-0 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-amber-500/30 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl transition-colors group flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="p-3 sm:p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
                <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-slate-400 font-medium text-sm sm:text-base uppercase tracking-wider truncate min-w-0">
                Active Events
              </h3>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight truncate min-w-0">
              {events.length.toLocaleString()}
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-6 uppercase tracking-widest pt-4 border-t border-slate-800/60 truncate min-w-0">
            Platform wide assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-4 min-w-0 w-full overflow-hidden">
        {/* Your Events Section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="flex items-center justify-between min-w-0 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 sm:gap-3 min-w-0">
              <CalendarDays className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="truncate">Your Events</span>
            </h2>
            {events.length > 0 && (
              <Link
                href="/studio/events"
                className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors whitespace-nowrap shrink-0 ml-2"
              >
                View All &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 min-w-0">
            {events.slice(0, 6).map((event) => (
              <Link
                key={event.id}
                href={`/studio/events/${event.id}`}
                className="block min-w-0 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group flex-col h-full"
              >
                <div className="h-36 sm:h-40 w-full relative overflow-hidden bg-slate-950 shrink-0">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500 relative">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.4)_0,transparent_70%)]" />
                      <TicketIcon className="w-10 h-10 text-slate-700 relative z-10 group-hover:text-orange-500/50 transition-colors" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-md border backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                        event.isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          : "bg-slate-900/80 text-slate-400 border-slate-700"
                      }`}
                    >
                      {event.isPublished ? "LIVE" : "DRAFT"}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-orange-400 transition-colors line-clamp-2 mb-4 wrap-break-word">
                    {event.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs font-mono pt-4 border-t border-slate-800/60 mt-auto min-w-0">
                    <span className="text-slate-400 truncate">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-500 transition-colors shrink-0 ml-2" />
                  </div>
                </div>
              </Link>
            ))}

            {events.length === 0 && (
              <div className="sm:col-span-2 text-center p-8 sm:p-12 border border-dashed border-slate-800 rounded-3xl min-w-0">
                <p className="text-slate-500 font-medium text-sm truncate">
                  You haven't created any events yet.
                </p>
                <Link
                  href="/studio/events/new"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-950 font-bold rounded-xl transition-colors text-xs uppercase tracking-wider whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create First Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Live Sales Feed Section */}
        <div className="lg:col-span-1 space-y-6 min-w-0 max-w-full">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 min-w-0">
            <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="truncate">Live Sales Feed</span>
          </h2>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl min-w-0 max-w-full">
            {topRecentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-3 border border-slate-800 shrink-0">
                  <Activity className="w-5 h-5 opacity-40" />
                </div>
                <p className="font-bold text-slate-400 text-sm truncate min-w-0 max-w-full">
                  No sales telemetry yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 min-w-0 w-full">
                {topRecentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors min-w-0 w-full"
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="font-black text-white text-xs sm:text-sm truncate block min-w-0 w-full">
                        {booking.customerName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 min-w-0 w-full overflow-hidden">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span className="truncate min-w-0 flex-1">{booking.eventName}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-black text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
                        +KES {booking.organizerPayout.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500 mt-1 bg-slate-950 inline-block px-1.5 py-0.5 rounded border border-slate-800">
                        {booking.tickets.length} Tix
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout & Settlement History */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden mt-8 min-w-0 w-full max-w-full">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 mb-4 sm:mb-6 min-w-0 overflow-hidden">
          <Receipt className="w-5 h-5 text-cyan-500 shrink-0" />
          <span className="truncate">Payout & Settlement History</span>
        </h2>

        {payoutHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center min-w-0">
            <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-3 border border-slate-800 shrink-0">
              <Receipt className="w-5 h-5 opacity-40" />
            </div>
            <p className="font-bold text-slate-400 text-sm truncate max-w-full">
              No payout requests yet.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Stacked Cards */}
            <div className="block md:hidden space-y-3 min-w-0 w-full max-w-full">
              {payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 min-w-0 w-full max-w-full overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                      {new Date(payout.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-[9px] font-bold font-mono flex items-center justify-center gap-1 uppercase tracking-widest shrink-0 ${
                        payout.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : payout.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {payout.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      {payout.status === "FAILED" && <XOctagon className="w-3 h-3 shrink-0" />}
                      {(payout.status === "PENDING" || payout.status === "PROCESSING") && (
                        <Clock className="w-3 h-3 shrink-0" />
                      )}
                      {payout.status === "COMPLETED" ? "DISBURSED" : payout.status}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-3 border-t border-slate-800/40 min-w-0 w-full">
                    <div className="flex-1 min-w-0 max-w-[70%]">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900 rounded border border-slate-800 text-[10px] font-mono text-slate-400 w-full overflow-hidden min-w-0">
                        <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate block flex-1 min-w-0 w-full">
                          {payout.destination}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-2 truncate min-w-0 w-full">
                        Ref:{" "}
                        <span className="text-slate-300 font-bold truncate">
                          {payout.reference || "-"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                        Amount
                      </p>
                      <p className="font-black text-white text-sm whitespace-nowrap">
                        KES {payout.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Standard Table */}
            <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/30">
              <table className="w-full text-left text-sm text-slate-400 min-w-200">
                <thead className="text-xs font-mono uppercase bg-slate-950/80 text-slate-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-4 rounded-tl-2xl border-b border-slate-800/80">Date requested</th>
                    <th className="px-5 py-4 border-b border-slate-800/80">Destination</th>
                    <th className="px-5 py-4 border-b border-slate-800/80">Reference</th>
                    <th className="px-5 py-4 text-right border-b border-slate-800/80">Amount</th>
                    <th className="px-5 py-4 rounded-tr-2xl border-b border-slate-800/80">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {payoutHistory.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(payout.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="bg-slate-950 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800/60 text-[11px] font-mono text-slate-400 max-w-50 overflow-hidden shadow-inner">
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate w-full block">{payout.destination}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {payout.reference ? (
                          <span className="text-slate-300 font-bold">{payout.reference}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <p className="font-black text-white text-sm">
                          KES {payout.amount.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold font-mono flex items-center gap-1.5 w-fit uppercase tracking-widest shadow-inner border ${
                            payout.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : payout.status === "FAILED"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {payout.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {payout.status === "FAILED" && <XOctagon className="w-3.5 h-3.5" />}
                          {(payout.status === "PENDING" || payout.status === "PROCESSING") && (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {payout.status === "COMPLETED" ? "DISBURSED" : payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <footer className="mt-16 sm:mt-24 border-t border-slate-800/60 py-8 bg-transparent relative z-50 min-w-0">
        <div className="max-w-7xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-center sm:text-left min-w-0">
          <p className="text-[10px] text-slate-500 font-mono truncate min-w-0">
            &copy; {new Date().getFullYear()} Bamba Tickets Corporation. All rights reserved.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/terms"
              className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}