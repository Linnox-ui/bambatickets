import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Clock,
  Info,
} from "lucide-react";
import Link from "next/link";
import TicketSelector from "./TicketSelector";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicEventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId, isPublished: true },
    include: {
      ticketTiers: {
        include: {
          _count: { select: { tickets: true } },
        },
      },
      organizer: { select: { firstName: true, lastName: true } },
    },
  });

  if (!event) notFound();

  const dateObj = new Date(event.date);
  const isPast = dateObj.getTime() < new Date().getTime();

  const totalCapacity = event.ticketTiers.reduce(
    (acc, tier) => acc + tier.capacity,
    0,
  );
  const totalSold = event.ticketTiers.reduce(
    (acc, tier) => acc + (tier._count?.tickets || 0),
    0,
  );
  const isSoldOut = totalCapacity > 0 && totalSold >= totalCapacity;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 pb-24">
      <div className="relative w-full h-[40vh] sm:h-[50vh] min-h-87.5 bg-slate-900 overflow-hidden animate-fade-in-up">
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
          }}
        />

        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className={`w-full h-full object-cover ${isPast ? "opacity-30 grayscale" : "opacity-60"}`}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.3)_0,transparent_70%)]" />
            <Ticket className="w-20 h-20 text-slate-800 relative z-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 backdrop-blur-md rounded-xl text-xs font-bold text-white transition-all shadow-lg group"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Feed
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div
            className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="space-y-4">
              {isPast ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner backdrop-blur-md bg-slate-500/10 border-slate-500/20 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Event Ended
                </div>
              ) : isSoldOut ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner backdrop-blur-md bg-red-500/10 border-red-500/20 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Sold Out
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner backdrop-blur-md bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Tickets Available
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl wrap-break-word">
                {event.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-white shadow-inner">
                  {event.organizer.firstName.charAt(0)}
                  {event.organizer.lastName.charAt(0)}
                </div>
                <p className="text-slate-400 text-sm">
                  Hosted by{" "}
                  <span className="text-white font-bold">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg">
                <CalendarDays className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-bold text-slate-200">
                  {dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-lg">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-slate-200">
                  {dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 sm:p-6 rounded-3xl flex items-start gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 mt-1 border border-orange-500/20 shadow-inner">
                <MapPin className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1.5">Location</h3>
                <p className="text-slate-400 text-sm leading-relaxed wrap-break-word">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4">
                <Info className="w-5 h-5 text-slate-500" /> About This Event
              </h2>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {event.description ||
                  "No additional details provided by the organizer."}
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-start sm:items-center gap-3 text-xs text-slate-400 font-mono">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="leading-relaxed">
                  All tickets are secure, encrypted with unique QR codes, and
                  verified at the gate via Bamba Tickets security terminals.
                </span>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-5 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <TicketSelector
              eventId={event.id}
              feeBearer={event.feeBearer as "ATTENDEE" | "ORGANIZER"}
              ticketTiers={event.ticketTiers}
              isPast={isPast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
