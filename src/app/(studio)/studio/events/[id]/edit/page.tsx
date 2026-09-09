import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, Sparkles } from "lucide-react";
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
    /* 🚀 FIX 1: Added px-4 sm:px-6 to give the page breathing room on mobile screens */
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* 🚀 FIX 2: Changed to flex-row for mobile so the back button sits beside the text, saving vertical space */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800/80">
        <Link
          href={`/studio/events/${targetId}`}
          className="p-2.5 sm:p-3 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group w-fit shrink-0 mt-1 sm:mt-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 mb-1">
            <Settings className="w-3.5 h-3.5" />
            Configuration Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight flex flex-wrap items-center gap-2">
            Edit Details{" "}
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 opacity-50 shrink-0" />
          </h1>
        </div>
      </div>

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
