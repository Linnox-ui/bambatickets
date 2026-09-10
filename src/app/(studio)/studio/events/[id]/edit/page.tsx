import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Sparkles,
  CalendarDays,
  Lock,
  Globe,
  FileEdit,
} from "lucide-react";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../auth";
import EditEventForm from "../../../../../../components/EditEventForm";

interface EditEventPageProps {
  params: Promise<{
    id?: string;
    eventId?: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = await params;
  const targetId = resolvedParams?.id || resolvedParams?.eventId;

  if (!targetId) {
    notFound();
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: targetId },
    include: {
      ticketTiers: true,
      bookings: {
        where: { status: "SUCCESS" },
        select: { id: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  if (event.organizerId !== session.user.id) {
    redirect("/studio");
  }

  // Safe Timezone Parsing (Avoids SSR Hydration Mismatches)
  const dateObj = new Date(event.date);
  const dateString = dateObj.toISOString().split("T")[0];
  const timeString = dateObj.toISOString().split("T")[1].slice(0, 5);

  const hasSales = event.bookings.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* TOP NAVIGATION */}
      <div className="flex items-center mt-6 sm:mt-8 mb-6">
        <Link
          href={`/studio/events/${targetId}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group w-fit text-xs font-bold text-slate-300"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-orange-500 transition-colors" />
          Back to Event Control
        </Link>
      </div>

      {/* 🚀 WORLD-CLASS HERO CONTEXT HEADER */}
      <div className="relative rounded-4xl border border-slate-800/80 bg-slate-900/50 shadow-2xl overflow-hidden mb-8 group">
        {/* Dynamic Ambient Background */}
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

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Event Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-slate-950 border-2 border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <CalendarDays className="w-10 h-10 text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
          </div>

          {/* Event Meta Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner">
                <Settings className="w-3 h-3" /> Config Mode
              </span>
              {event.isPublished ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner">
                  <Globe className="w-3 h-3" /> Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest shadow-inner">
                  <FileEdit className="w-3 h-3" /> Draft
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              {event.title}{" "}
              <Sparkles className="w-5 h-5 text-orange-500 opacity-50 shrink-0" />
            </h1>
          </div>
        </div>

        {/* Intelligent Lock Warning (Only shows if tickets are sold) */}
        {hasSales && (
          <div className="relative z-10 bg-amber-500/10 border-t border-amber-500/20 px-6 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-amber-500">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Event is active with sales
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-amber-500/80 font-mono">
              Deletion and major structural changes are securely locked.
            </p>
          </div>
        )}
      </div>

      {/* 🚀 THE EDIT FORM COMPONENTS */}
      <EditEventForm
        event={{
          id: event.id,
          title: event.title,
          description: event.description || "",
          location: event.location,
          dateString,
          timeString,
          imageUrl: event.imageUrl,
          feeBearer: event.feeBearer as "ATTENDEE" | "ORGANIZER",
          tiers: event.ticketTiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            capacity: t.capacity,
          })),
          hasSales: hasSales,
        }}
      />
    </div>
  );
}
