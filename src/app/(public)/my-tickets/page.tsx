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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-500/30 selection:text-orange-50 relative overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.1),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl shadow-inner">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Tickets
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-sm uppercase tracking-widest">
              Digital Event Passes
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center shadow-2xl animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <QrCode className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
              No tickets found
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              We couldn't find any tickets linked to{" "}
              <strong className="text-white bg-slate-800 px-2 py-0.5 rounded-md">
                {session.user.email}
              </strong>
              . If you used a different email during checkout, your tickets are
              linked to that address.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95"
            >
              Browse Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking, index) => {
              const eventDateObj = new Date(booking.event.date);
              const isPast = eventDateObj.getTime() < new Date().getTime();

              const eventDate = eventDateObj.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={booking.id}
                  className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl transition-all animate-fade-in-up ${
                    isPast
                      ? "border-slate-800/50 opacity-75 grayscale-[0.5]"
                      : "border-slate-800 hover:border-orange-500/30"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-slate-950/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 relative overflow-hidden">
                    {isPast && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800/20 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-black text-white tracking-tight">
                          {booking.event.title}
                        </h2>
                        {isPast ? (
                          <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md shadow-inner">
                            Ended
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-md shadow-inner flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Upcoming
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-orange-500" />
                          {eventDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span className="truncate max-w-50 sm:max-w-xs">
                            {booking.event.location}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right relative z-10 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                        Booking Reference
                      </p>
                      <p className="font-mono text-xs text-orange-400 font-bold">
                        {booking.reference}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {booking.tickets.map((ticket, tIndex) => (
                      <div
                        key={ticket.id}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          ticket.isUsed || isPast
                            ? "bg-slate-950/80 border-slate-800/50 opacity-60"
                            : "bg-slate-950 border-slate-800 hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                        }`}
                      >
                        <div className="w-20 h-20 bg-white p-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-sm font-black text-white truncate">
                              Pass #{tIndex + 1}
                            </span>
                            {ticket.isUsed ? (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
                                Scanned
                              </span>
                            ) : isPast ? (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 text-slate-400 rounded-md">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                                Valid
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-orange-400 mb-2">
                            {ticket.tier?.name || "Standard Pass"}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 truncate bg-slate-900 inline-block px-2 py-1 rounded border border-slate-800">
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
