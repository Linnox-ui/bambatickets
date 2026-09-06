import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";
import EditEventForm from "./EditEventForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTiers: true,
      bookings: {
        include: {
          tickets: true,
        },
      },
    },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  const dateObj = new Date(event.date);
  const dateString = dateObj.toISOString().split("T")[0];
  const timeString = dateObj.toTimeString().split(" ")[0].slice(0, 5);

  const totalTicketsSold = event.bookings.reduce(
    (sum, booking) =>
      sum + (booking.status === "SUCCESS" ? booking.tickets?.length || 0 : 0),
    0,
  );
  const revenue = event.bookings.reduce(
    (sum, booking) => sum + (booking.status === "SUCCESS" ? booking.amount : 0),
    0,
  );

  const hasSales = totalTicketsSold > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* HEADER WITH INTEGRATED ATTENDEES & SCANNER BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Edit Event
            </h1>
            <p className="text-slate-400 mt-1">
              Update details for {event.title}
            </p>
          </div>
        </div>

        {/* 🚀 ACTION BUTTONS LINKED TO ATTENDEES & SCANNER */}
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/events/${event.id}/scanner`}
            className="px-4 py-2.5 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl transition-all"
          >
            Open Scanner
          </Link>
          <Link
            href={`/studio/events/${event.id}/attendees`}
            className="px-4 py-2.5 bg-fuchsia-600/10 hover:bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold rounded-xl transition-all"
          >
            Guest List ({totalTicketsSold})
          </Link>
          <Link
            href={`/studio/events/${event.id}/staff`}
            className="px-4 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-xl transition-all"
          >
            Manage Staff
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase">Revenue</p>
          <p className="text-2xl font-black text-emerald-400">
            KES {revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Tiers Active
          </p>
          <p className="text-2xl font-black text-cyan-400">
            {event.ticketTiers.length}
          </p>
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
