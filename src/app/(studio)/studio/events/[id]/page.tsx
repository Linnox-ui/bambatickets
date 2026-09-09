import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";
import {
  ArrowLeft,
  Users,
  QrCode,
  ShieldCheck,
  Wallet,
  Sparkles,
  Settings,
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

  const totalTicketsSold = event.bookings.reduce(
    (sum, booking) => sum + (booking.tickets?.length || 0),
    0,
  );

  const revenue = event.bookings.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Hides scrollbar for horizontal button scrolling on tiny phones */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* HEADER WITH INTEGRATED ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 line-clamp-1">
              Event Control
            </h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm truncate max-wxs sm:max-w-md">
              Managing{" "}
              <span className="text-white font-bold">{event.title}</span>
            </p>
          </div>
        </div>

        {/* 🚀 ACTION BUTTONS (Scrollable horizontally on very small screens) */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap items-center gap-2 sm:gap-3 hide-scrollbar">
          <Link
            href={`/studio/events/${event.id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold rounded-xl transition-all shadow-inner whitespace-nowrap"
          >
            <Settings className="w-4 h-4" /> Edit Event
          </Link>
          <Link
            href={`/studio/events/${event.id}/attendees`}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-xl transition-all shadow-inner whitespace-nowrap"
          >
            <Users className="w-4 h-4" /> Guest List ({totalTicketsSold})
          </Link>
          <Link
            href={`/studio/events/${event.id}/scanner`}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl transition-all shadow-inner whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" /> Scanner
          </Link>
          <Link
            href={`/studio/events/${event.id}/finance`}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all shadow-inner whitespace-nowrap"
          >
            <Wallet className="w-4 h-4" /> Payouts
          </Link>
          <Link
            href={`/studio/events/${event.id}/staff`}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-xl transition-all shadow-inner whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" /> Staff
          </Link>
        </div>
      </div>

      {/* 🚀 FIXED MOBILE GRID: Stacked correctly on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
              Total Revenue
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span className="text-emerald-500 text-lg sm:text-xl mr-1">
                KES
              </span>
              {revenue.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center justify-between group hover:border-orange-500/30 transition-colors">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
              Active Tiers
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {event.ticketTiers.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
