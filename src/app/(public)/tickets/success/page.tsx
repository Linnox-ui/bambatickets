import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Ticket,
  CalendarDays,
  MapPin,
  User,
  ArrowRight,
} from "lucide-react";
import prisma from "../../../../lib/prisma";

interface SuccessPageProps {
  searchParams: Promise<{
    ref?: string;
  }>;
}

export default async function TicketSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const reference = resolvedParams?.ref;

  if (!reference) {
    notFound();
  }

  // Fetch booking with event and ticket details matching Prisma schema
  const booking = await prisma.booking.findFirst({
    where: { reference },
    include: {
      event: true,
      tickets: {
        include: {
          tier: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const eventDate = new Date(booking.event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        {/* SUCCESS HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            You're Going!
          </h1>
          <p className="text-slate-400 text-sm">
            Payment confirmed. Your tickets have been securely issued.
          </p>
        </div>

        {/* TICKET CARD CONTAINER */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                Event Pass
              </span>
              <h2 className="text-2xl font-bold text-white">
                {booking.event.title}
              </h2>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>{booking.event.location}</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {booking.customerName} ({booking.customerEmail})
                </span>
              </div>
            </div>

            {/* TICKETS LIST */}
            <div className="pt-4 border-t border-slate-800/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Issued Tickets ({booking.tickets.length})
              </h3>

              <div className="space-y-2">
                {booking.tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-fuchsia-400" />
                      <span className="text-white font-bold">
                        Ticket #{index + 1}
                      </span>
                      <span className="text-slate-500">
                        ({ticket.tier?.name || "Standard"})
                      </span>
                    </div>
                    <span className="text-cyan-400 tracking-widest">
                      {ticket.ticketCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Ref: {booking.reference}</span>
              <span className="text-white font-bold">
                KES {booking.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Browse More Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
