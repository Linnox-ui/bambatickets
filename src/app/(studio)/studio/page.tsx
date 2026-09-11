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
} from "lucide-react";
import WalletWidget from "./components/WalletWidget";

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
  const recentBookings: any[] = [];

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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
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

      <div className="pb-6 border-b border-slate-800/80">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Organizer Studio
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
          Welcome back. Here is the live telemetry for your events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WalletWidget
          availableBalance={availableBalance}
          hasPaymentMethod={hasPaymentMethod}
        />

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-emerald-500/30 rounded-3xl p-6 shadow-2xl transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">
              Gross Revenue
            </h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            <span className="text-emerald-500 text-2xl mr-1">KES</span>
            {totalGrossRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest pt-4 border-t border-slate-800/60">
            Total historical sales
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-orange-500/30 rounded-3xl p-6 shadow-2xl transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
              <TicketIcon className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">
              Tickets Sold
            </h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {totalTicketsSold}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest pt-4 border-t border-slate-800/60">
            Across all events
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-amber-500/30 rounded-3xl p-6 shadow-2xl transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">
              Active Events
            </h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {events.length}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest pt-4 border-t border-slate-800/60">
            Platform wide assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              Your Events
            </h2>
            {events.length > 0 && (
              <Link
                href="/studio/events"
                className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors"
              >
                View All &rarr;
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.slice(0, 6).map((event) => (
              <Link
                key={event.id}
                href={`/studio/events/${event.id}`}
                className="block bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group flex-col h-full"
              >
                <div className="h-36 w-full relative overflow-hidden bg-slate-950">
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

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-white leading-snug pr-2 group-hover:text-orange-400 transition-colors line-clamp-2 mb-4">
                    {event.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs font-mono mt-auto pt-4 border-t border-slate-800/60">
                    <span className="text-slate-400">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            {events.length === 0 && (
              <div className="md:col-span-2 text-center p-12 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-medium">
                  You haven't created any events yet.
                </p>
                <Link
                  href="/studio/events/new"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-950 font-bold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create First Event
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Live Sales Feed
          </h2>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            {topRecentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-3 border border-slate-800">
                  <Activity className="w-5 h-5 opacity-40" />
                </div>
                <p className="font-bold text-slate-400 text-sm">
                  No sales telemetry yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {topRecentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-black text-white">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span className="truncate">{booking.eventName}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-emerald-400">
                        +KES {booking.organizerPayout.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 bg-slate-950 inline-block px-1.5 py-0.5 rounded border border-slate-800">
                        {booking.tickets.length} Ticket(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl overflow-hidden mt-8">
        <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6">
          <Receipt className="w-5 h-5 text-cyan-500" />
          Payout & Settlement History
        </h2>

        {payoutHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-3 border border-slate-800">
              <Receipt className="w-5 h-5 opacity-40" />
            </div>
            <p className="font-bold text-slate-400 text-sm">
              No payout requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto terminal-scroll">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs font-mono uppercase bg-slate-950/50 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Date requested</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {new Date(payout.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="bg-slate-950 inline-flex items-center gap-2 px-2 py-1 rounded border border-slate-800/60 text-[10px] font-mono text-slate-400 max-w-50 truncate">
                        <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate">{payout.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {payout.reference ? (
                        <span className="text-slate-300 font-bold">
                          {payout.reference}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-black text-white text-xs">
                        KES {payout.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1.5 rounded text-[9px] font-bold font-mono flex items-center gap-1.5 w-fit uppercase tracking-widest ${
                          payout.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : payout.status === "FAILED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {payout.status === "COMPLETED" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {payout.status === "FAILED" && (
                          <XOctagon className="w-3.5 h-3.5" />
                        )}
                        {(payout.status === "PENDING" ||
                          payout.status === "PROCESSING") && (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {payout.status === "COMPLETED"
                          ? "DISBURSED"
                          : payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="mt-24 border-t border-slate-800/60 py-8 bg-transparent relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} Bamba Tickets Corporation. All
            rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs font-mono font-bold text-slate-300 hover:text-orange-500 uppercase tracking-widest transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
