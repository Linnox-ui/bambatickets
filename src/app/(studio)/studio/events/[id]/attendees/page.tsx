import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";
import {
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  Search,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventAttendeesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  // Fetch event, bookings, and nested tickets with tier info
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTiers: true,
      bookings: {
        where: { status: "SUCCESS" }, // Only successful purchases
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/studio/events/${event.id}`}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
              Live Guest List
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <Link
          href={`/studio/events/${event.id}/scanner`}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg text-center"
        >
          Launch Gate Scanner
        </Link>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TicketIcon className="w-4 h-4 text-cyan-400" /> Total Sold
          </p>
          <p className="text-2xl font-black text-white">{totalSold}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Checked In
          </p>
          <p className="text-2xl font-black text-emerald-400">
            {totalCheckedIn}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Arrival
          </p>
          <p className="text-2xl font-black text-amber-400">{totalPending}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-fuchsia-400" /> Turnout Rate
          </p>
          <p className="text-2xl font-black text-fuchsia-400">{checkInRate}%</p>
        </div>
      </div>

      {/* ATTENDEES TABLE CONTAINER */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Ticket Holders (
            {allTickets.length})
          </h2>
        </div>

        {allTickets.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">
              No tickets sold for this event yet.
            </p>
            <p className="text-slate-600 text-xs">
              Attendees will appear here automatically once purchases are
              completed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="pb-3 px-4">Guest Name</th>
                  <th className="pb-3 px-4">Pass Tier</th>
                  <th className="pb-3 px-4">Ticket Code</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {allTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-white font-sans">
                        {ticket.customerName}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {ticket.customerEmail}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-cyan-400 font-bold">
                      {ticket.tier.name}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
                        {ticket.ticketCode.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {ticket.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full text-[10px]">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-400">
                      {new Date(ticket.purchasedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
