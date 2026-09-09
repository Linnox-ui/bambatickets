import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  Mail,
  QrCode,
  Search,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id?: string; eventId?: string }>;
}

export default async function EventAttendeesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const targetId = resolvedParams?.id || resolvedParams?.eventId;

  if (!targetId) notFound();

  // Fetch event, bookings, and nested tickets with tier info
  const event = await prisma.event.findUnique({
    where: { id: targetId },
    include: {
      ticketTiers: true,
      bookings: {
        where: { status: "SUCCESS" },
        include: {
          tickets: {
            include: {
              tier: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  // Flatten tickets for easy metrics and table rendering
  const allTickets = event.bookings.flatMap((booking) =>
    booking.tickets.map((ticket) => ({
      ...ticket,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      bookingReference: booking.reference,
      purchasedAt: booking.createdAt,
    })),
  );

  const totalSold = allTickets.length;
  const totalCheckedIn = allTickets.filter((t) => t.isUsed).length;
  const totalPending = totalSold - totalCheckedIn;
  const checkInRate =
    totalSold > 0 ? Math.round((totalCheckedIn / totalSold) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-24 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* PREMIUM HEADER - MOBILE OPTIMIZED */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/studio/events/${targetId}`}
            className="p-2.5 sm:p-3 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 mb-1">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Live Guest List
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 line-clamp-1">
              {event.title}
            </h1>
          </div>
        </div>

        <Link
          href={`/studio/events/${targetId}/scanner`}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-amber-500 font-black rounded-xl text-xs transition-all shadow-inner tracking-wider uppercase"
        >
          <QrCode className="w-4 h-4" /> Launch Gate Scanner
        </Link>
      </div>

      {/* TELEMETRY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 shadow-xl group hover:border-orange-500/30 transition-colors">
          <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <TicketIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" />{" "}
            Total Sold
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {totalSold}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 shadow-xl group hover:border-emerald-500/30 transition-colors">
          <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />{" "}
            Checked In
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            {totalCheckedIn}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 shadow-xl group hover:border-amber-500/30 transition-colors">
          <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />{" "}
            Pending
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {totalPending}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1 sm:space-y-2 shadow-xl group hover:border-orange-500/30 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 relative z-10">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" />{" "}
            Turnout
          </p>
          <p className="text-2xl sm:text-3xl font-black text-orange-400 relative z-10">
            {checkInRate}%
          </p>
        </div>
      </div>

      {/* ROSTER CONTAINER */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
        {/* Roster Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            Ticket Roster
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guests..."
              className="pl-9 pr-4 py-2.5 sm:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-orange-500 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
        </div>

        {allTickets.length === 0 ? (
          <div className="text-center py-12 sm:py-16 space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed mx-2 sm:mx-0">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto opacity-50" />
            <p className="text-white font-bold text-base sm:text-lg tracking-tight">
              Awaiting First Sale
            </p>
            <p className="text-slate-500 text-[10px] sm:text-xs max-w-xs mx-auto px-4">
              Attendees will automatically populate here in real-time as tickets
              are purchased.
            </p>
          </div>
        ) : (
          <>
            {/* 📱 MOBILE VIEW: Stacked Cards (Hidden on md screens) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {allTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Subtle Background Glow based on Status */}
                  {ticket.isUsed ? (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                  ) : (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                  )}

                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {ticket.customerName}
                      </p>
                      <p className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />{" "}
                        <span className="truncate">{ticket.customerEmail}</span>
                      </p>
                    </div>
                    <span className="font-black text-orange-400 text-xs shrink-0 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                      {ticket.tier.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 relative z-10">
                    <span className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 tracking-wider">
                      {ticket.ticketCode.slice(0, 8)}...
                    </span>

                    {ticket.isUsed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] uppercase tracking-wider shadow-inner">
                        <CheckCircle2 className="w-3 h-3" /> In Venue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold rounded-full text-[10px] uppercase tracking-wider shadow-inner">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 DESKTOP VIEW: Data Table (Hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    <th className="pb-4 px-4 font-bold">Guest Profile</th>
                    <th className="pb-4 px-4 font-bold">Pass Tier</th>
                    <th className="pb-4 px-4 font-bold">Ticket Hash</th>
                    <th className="pb-4 px-4 font-bold">Status</th>
                    <th className="pb-4 px-4 font-bold text-right">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm tracking-tight mb-1">
                          {ticket.customerName}
                        </div>
                        <div className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> {ticket.customerEmail}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-black text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                          {ticket.tier.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 shadow-inner">
                          {ticket.ticketCode.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {ticket.isUsed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> In Venue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold rounded-full text-[10px] uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-500 font-mono text-[10px]">
                        {new Date(ticket.purchasedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "2-digit" },
                        )}{" "}
                        <br />
                        <span className="text-slate-600">
                          {new Date(ticket.purchasedAt).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
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
    </div>
  );
}
