import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, Sparkles } from "lucide-react";
import prisma from "../../../../../../lib/prisma"; // Adjust path if needed
import { auth } from "../../../../../../auth"; // Adjust path if needed
import EditEventForm from "../../../../../../components/EditEventForm"; // Adjust path to point to our new form

// 1. Loose typing to accommodate Next.js 15 Promise params safely
interface EditEventPageProps {
  params: Promise<{
    id?: string;
    eventId?: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  // 2. Resolve the params object safely
  const resolvedParams = await params;
  const targetId = resolvedParams?.id || resolvedParams?.eventId;

  // 3. BULLETPROOF GUARD: Immediate 404 if no ID
  if (!targetId) {
    notFound();
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  // 4. Fetch the event securely WITH all required relations (Tiers & Bookings)
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

  // Ensure this organizer actually owns this event
  if (event.organizerId !== session.user.id) {
    redirect("/studio");
  }

  // Formating Date and Time for HTML inputs
  const dateObj = new Date(event.date);
  const dateString = dateObj.toISOString().split("T")[0];
  const timeString = dateObj.toTimeString().split(" ")[0].slice(0, 5);

  const hasSales = event.bookings.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800/80">
        <Link
          href={`/studio/events/${targetId}`}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group w-fit"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500 mb-1.5">
            <Settings className="w-3.5 h-3.5" />
            Configuration Mode
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Edit Details{" "}
            <Sparkles className="w-6 h-6 text-orange-500 opacity-50" />
          </h1>
        </div>
      </div>

      {/* The component we built that handles the actual editing */}
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
