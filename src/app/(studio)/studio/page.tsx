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

  // 1. Fetch all events by this organizer, including successful bookings
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

  // 2. Calculate Global Analytics
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Organizer Studio
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome back! Here is an overview of your events.
          </p>
        </div>
        <Link
          href="/studio/events/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
        >
          <Plus className="w-5 h-5" /> Create Event
        </Link>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Total Revenue</h3>
          </div>
          <div className="text-3xl font-black text-white">
            KES {totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <TicketIcon className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Tickets Sold</h3>
          </div>
          <div className="text-3xl font-black text-white">
            {totalTicketsSold}
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-slate-400 font-medium">Active Events</h3>
          </div>
          <div className="text-3xl font-black text-white">{events.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT SALES FEED */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            Recent Sales
          </h2>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {topRecentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No sales yet. Keep promoting your events!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {topRecentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-white">
                        {booking.customerName}
                      </p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {booking.eventName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-400">
                        +KES {booking.amount.toLocaleString()}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-1">
                        {booking.tickets.length} Ticket(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK EVENT MANAGEMENT */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            Your Events
          </h2>

          <div className="space-y-3">
            {events.slice(0, 4).map((event) => (
              <Link
                key={event.id}
                href={`/studio/events/${event.id}`}
                className="block p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white truncate pr-4">
                    {event.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-fuchsia-400 transition-colors shrink-0" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${event.isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                  >
                    {event.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </Link>
            ))}
            {events.length > 4 && (
              <div className="text-center pt-2">
                <span className="text-sm text-slate-500">
                  View all events...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
