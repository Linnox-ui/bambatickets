import { redirect } from "next/navigation";
import Link from "next/link";
import { Ticket, CalendarDays, MapPin, QrCode, ArrowRight } from "lucide-react";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

export default async function MyTicketsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch all successful bookings for this user's email (Case Insensitive!)
  const bookings = await prisma.booking.findMany({
    where: {
      status: "SUCCESS",
      OR: [
        {
          customerEmail: {
            equals: session.user.email,
            mode: "insensitive",
          },
        },
        { buyerId: session.user.id },
      ],
    },
    include: {
      event: true,
      tickets: {
        include: { tier: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-2xl">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Tickets
            </h1>
            <p className="text-slate-400 mt-1">
              All your purchased event passes in one place.
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {bookings.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center shadow-xl">
            <QrCode className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No tickets found
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              We couldn't find any tickets linked to{" "}
              <strong className="text-white">{session.user.email}</strong>. If
              you used a different email during checkout, your tickets are
              linked to that email!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Browse Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* TICKETS LIST */
          <div className="space-y-8">
            {bookings.map((booking) => {
              const eventDate = new Date(booking.event.date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={booking.id}
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                  {/* EVENT INFO STRIP */}
                  <div className="bg-slate-800/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        {booking.event.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-cyan-400" />
                          {eventDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-fuchsia-400" />
                          {booking.event.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-400 mb-0.5">Reference</p>
                      <p className="font-mono text-xs text-slate-500">
                        {booking.reference}
                      </p>
                    </div>
                  </div>

                  {/* INDIVIDUAL TICKETS GRID */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.tickets.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border ${
                          ticket.isUsed
                            ? "bg-slate-950/50 border-slate-800/50 opacity-60"
                            : "bg-slate-950 border-slate-800 hover:border-fuchsia-500/50 transition-colors"
                        }`}
                      >
                        <div className="w-20 h-20 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-white truncate">
                              Ticket #{index + 1}
                            </span>
                            {ticket.isUsed && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 rounded-md">
                                Used
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-fuchsia-400 mb-2">
                            {ticket.tier?.name || "Standard Pass"}
                          </p>
                          <p className="text-xs font-mono text-slate-500 truncate">
                            {ticket.ticketCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
