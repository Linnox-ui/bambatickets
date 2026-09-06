import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Ticket, Info } from "lucide-react";
import prisma from "../../../../lib/prisma";
import ClientCheckoutWidget from "../../../../components/ClientCheckoutWidget";

interface PublicEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicEventPage({
  params,
}: PublicEventPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 1. Fetch event and ticket tiers securely
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTiers: true,
      organizer: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!event || !event.isPublished) {
    notFound();
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-fuchsia-500 selection:text-white pb-20">
      {/* HERO BANNER */}
      <div className="w-full h-[40vh] md:h-[50vh] bg-slate-900 relative border-b border-slate-800">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-tr from-fuchsia-900/20 to-cyan-900/20 flex items-center justify-center">
            <Ticket className="w-20 h-20 text-slate-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT COLUMN: EVENT DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-slate-300 font-medium mb-8">
                <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2.5 rounded-xl border border-slate-800">
                  <CalendarDays className="w-5 h-5 text-cyan-400" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2.5 rounded-xl border border-slate-800">
                  <MapPin className="w-5 h-5 text-fuchsia-400" />
                  {event.location}
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  About This Event
                </h3>
                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {event.description ||
                    "No description provided for this event."}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800/60 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-fuchsia-600 to-cyan-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                  {event.organizer.firstName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Organized by</p>
                  <p className="text-base font-bold text-white">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CHECKOUT WIDGET */}
          <div className="lg:col-span-1">
            <ClientCheckoutWidget
              eventId={event.id}
              tiers={event.ticketTiers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
