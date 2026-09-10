import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";
import {
  ArrowLeft,
  Users,
  QrCode,
  ShieldCheck,
  Wallet,
  Settings,
  CalendarDays,
  MapPin,
  Globe,
  FileEdit,
  CheckCircle2,
  Ticket as TicketIcon,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventControlDashboard({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTiers: true,
      bookings: {
        where: { status: "SUCCESS" },
        include: {
          tickets: true,
        },
      },
    },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  // Telemetry Calculations
  const totalTicketsSold = event.bookings.reduce(
    (sum, booking) => sum + (booking.tickets?.length || 0),
    0,
  );

  const totalCheckedIn = event.bookings.reduce(
    (sum, booking) => sum + booking.tickets.filter((t) => t.isUsed).length,
    0,
  );

  const revenue = event.bookings.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  // Safe Date Parsing
  const dateObj = new Date(event.date);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pb-24 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* TOP NAVIGATION */}
      <div className="flex items-center mt-6 sm:mt-8 mb-2">
        <Link
          href="/studio"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group w-fit text-xs font-bold text-slate-300"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-orange-500 transition-colors" />
          Back to Studio
        </Link>
      </div>

      {/* 🚀 WORLD-CLASS HERO CARD */}
      <div className="relative rounded-4xl border border-slate-800/80 bg-slate-900/50 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 z-0">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt=""
              className="w-full h-full object-cover opacity-20 blur-3xl mix-blend-overlay group-hover:opacity-30 transition-opacity duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-slate-900 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
            <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-slate-950 border-2 border-slate-800/80 shadow-2xl overflow-hidden relative">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <CalendarDays className="w-8 h-8 text-slate-700" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                {event.isPublished ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner">
                    <Globe className="w-3 h-3" /> Live & Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner">
                    <FileEdit className="w-3 h-3" /> Draft Mode
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight line-clamp-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  {dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="truncate max-w-37.5 sm:max-w-none">
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 TELEMETRY GRID (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Gross Revenue
          </p>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            <span className="text-emerald-500 text-lg sm:text-xl mr-1">
              KES
            </span>
            {revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-orange-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TicketIcon className="w-3.5 h-3.5 text-orange-500" /> Tickets Sold
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {totalTicketsSold}
            </p>
            <p className="text-xs text-slate-500 font-mono mb-1">
              Across {event.ticketTiers.length} Tiers
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-amber-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Turnout
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {totalCheckedIn}
            </p>
            <p className="text-xs text-amber-500/50 font-mono mb-1">
              {totalTicketsSold > 0
                ? Math.round((totalCheckedIn / totalTicketsSold) * 100)
                : 0}
              % Check-in
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 COMMAND CENTER (App-like Grid Layout) */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 ml-2">
          Command Center
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <Link
            href={`/studio/events/${event.id}/edit`}
            className="bg-slate-900/50 border border-slate-800/80 p-4 sm:p-6 rounded-3xl hover:bg-slate-800 hover:border-slate-600 transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform shadow-inner border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Config</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Edit Details</p>
            </div>
          </Link>

          <Link
            href={`/studio/events/${event.id}/attendees`}
            className="bg-slate-900/50 border border-slate-800/80 p-4 sm:p-6 rounded-3xl hover:bg-orange-500/10 hover:border-orange-500/50 transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-inner border border-orange-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Guest List
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">View Roster</p>
            </div>
          </Link>

          <Link
            href={`/studio/events/${event.id}/scanner`}
            className="bg-slate-900/50 border border-slate-800/80 p-4 sm:p-6 rounded-3xl hover:bg-amber-500/10 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-inner border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Scanner</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Gate Entry</p>
            </div>
          </Link>

          <Link
            href={`/studio/events/${event.id}/finance`}
            className="bg-slate-900/50 border border-slate-800/80 p-4 sm:p-6 rounded-3xl hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Ledger</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Finances</p>
            </div>
          </Link>

          <Link
            href={`/studio/events/${event.id}/staff`}
            className="bg-slate-900/50 border border-slate-800/80 p-4 sm:p-6 rounded-3xl hover:bg-purple-500/10 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center gap-3 text-center group shadow-lg col-span-2 sm:col-span-1 md:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-inner border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Staff</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Access Control</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
