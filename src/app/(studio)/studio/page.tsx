import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import {
  TrendingUp,
  Ticket as TicketIcon,
  Plus,
  CalendarDays,
  ArrowRight,
  Activity,
  Banknote,
} from "lucide-react";

export default async function StudioDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

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

  let totalRevenue = 0;
  let totalTicketsSold = 0;
  const recentBookings: any[] = [];

  events.forEach((event) => {
    event.bookings.forEach((booking) => {
      totalRevenue += booking.amount;
      totalTicketsSold += booking.tickets.length;
      recentBookings.push({
        ...booking,
        eventName: event.title,
      });
    });
  });

  // Sort recent bookings across all events and grab the latest 5
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Organizer Studio
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
            Welcome back. Here is the live telemetry for your events.
          </p>
        </div>
        <Link
          href="/studio/events/new"
          className="group flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 overflow-hidden relative"
        >
          <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <Plus className="w-5 h-5 relative" />
          <span className="relative">Create Event</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-emerald-500/30 rounded-3xl p-6 shadow-2xl transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">
              Total Revenue
            </h3>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            <span className="text-emerald-500 text-2xl mr-1">KES</span>
            {totalRevenue.toLocaleString()}
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(0, 6).map((event) => (
              <Link
                key={event.id}
                href={`/studio/events/${event.id}`}
                className="block p-5 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl hover:border-orange-500/50 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white leading-snug pr-4 group-hover:text-orange-400 transition-colors">
                    {event.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:border-orange-400 transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-950 transition-colors" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md border ${
                      event.isPublished
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {event.isPublished ? "LIVE" : "DRAFT"}
                  </span>
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
                  className="inline-block mt-4 px-4 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Create your first event
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
                        +KES {booking.amount.toLocaleString()}
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
    </div>
  );
}
