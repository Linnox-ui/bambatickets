import { notFound } from "next/navigation";
import prisma from "../../../../lib/prisma";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import TicketSelector from "./TicketSelector"; // Client component for handling quantities

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicEventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId, isPublished: true },
    include: {
      ticketTiers: true,
      organizer: { select: { firstName: true, lastName: true } },
    },
  });

  if (!event) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black pb-24">
      {/* NAVBAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Tickets Available
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* BANNER & HEADER */}
        <div className="space-y-6">
          <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700 font-mono">
                NO BANNER IMAGE
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" />
                {event.location}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-slate-400 text-xs font-mono">
              Hosted by{" "}
              <span className="text-white font-bold">
                {event.organizer.firstName} {event.organizer.lastName}
              </span>
            </p>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT: DESCRIPTION & TICKET SELECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* EVENT DESCRIPTION */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
              About This Event
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {event.description || "No description provided for this event."}
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>
                All tickets are secure, encrypted with unique QR codes, and
                verified at the gate via Bamba Tickets security terminals.
              </span>
            </div>
          </div>

          {/* TICKET SELECTION CARD (Interactive Component) */}
          <div className="lg:col-span-1">
            <TicketSelector
              eventId={event.id}
              ticketTiers={event.ticketTiers}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
