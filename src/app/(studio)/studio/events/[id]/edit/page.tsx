import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../auth";
import EditEventForm from "../../../../../../components/EditEventForm";

// 1. Loose typing to accommodate Next.js 15 Promise params safely
interface EditEventPageProps {
  params: Promise<{
    id?: string;
    eventId?: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  // 2. Resolve the params object
  const resolvedParams = await params;

  // 3. Check for both common dynamic folder naming conventions
  const targetId = resolvedParams?.id || resolvedParams?.eventId;

  // 4. BULLETPROOF GUARD: If there is no ID, immediately 404 instead of crashing Prisma
  if (!targetId) {
    notFound();
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 5. Fetch the event securely using our guaranteed string ID
  const event = await prisma.event.findUnique({
    where: { id: targetId },
  });

  if (!event) {
    notFound();
  }

  if (event.organizerId !== session.user.id) {
    redirect("/studio");
  }

  const dateObj = new Date(event.date);
  const dateString = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeString = dateObj.toISOString().substring(11, 16); // HH:MM

  return (
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/studio/events/${targetId}`}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            EVENT CONFIGURATION
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Edit Event Details
          </h1>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <EditEventForm
          eventId={event.id}
          initialData={{
            title: event.title,
            description: event.description || "",
            location: event.location,
            date: dateString,
            time: timeString,
          }}
        />
      </div>
    </div>
  );
}
