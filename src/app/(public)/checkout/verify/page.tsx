import { notFound, redirect } from "next/navigation";
import prisma from "../../../../lib/prisma";
import { CheckCircle2, Ticket, Calendar, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import PrintButton from "./PrintButton";
import nodemailer from "nodemailer";

interface PageProps {
  searchParams: Promise<{ reference?: string | string[] }>;
}

export default async function CheckoutVerifyPage({ searchParams }: PageProps) {
  const resolvedSearch = await searchParams;
  const rawReference = resolvedSearch.reference;
  const reference = Array.isArray(rawReference)
    ? rawReference[0]
    : rawReference;

  if (!reference) redirect("/");

  let booking = await prisma.booking.findUnique({
    where: { reference },
    include: {
      event: true,
      tickets: { include: { tier: true } },
    },
  });

  if (!booking) notFound();

  // 🚀 HELPER FUNCTION: Send Email via Gmail SMTP (Themed)
  const sendTicketEmail = async (
    customerEmail: string,
    customerName: string,
    eventTitle: string,
    ref: string,
  ) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Bamba Tickets" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: `Your passes for ${eventTitle} are ready! 🎟️`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #020617; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
            <h1 style="color: #f97316;">Payment Successful!</h1>
            <p>Hi ${customerName},</p>
            <p>Your tickets for <strong>${eventTitle}</strong> have been secured. Your booking reference is ${ref}.</p>
            <p>Click the link below to view, save, or print your scannable QR passes.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify?reference=${ref}" 
               style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: #020617; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
              View My Tickets
            </a>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">See you at the event!<br/>The Bamba Tickets Team</p>
          </div>
        `,
      });
      console.log("Ticket email sent successfully via Gmail!");
    } catch (error) {
      console.error("Failed to send email via Gmail:", error);
    }
  };

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;

  if (booking.status === "PENDING") {
    let paymentVerified = false;

    if (paystackKey && paystackKey !== "sk_test_xxx") {
      try {
        const res = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: { Authorization: `Bearer ${paystackKey}` },
            cache: "no-store",
          },
        );
        const data = await res.json();
        if (data.status && data.data.status === "success") {
          paymentVerified = true;
        }
      } catch (e) {
        console.error("Verification error:", e);
      }
    } else {
      paymentVerified = true; // Sandbox fallback
    }

    if (paymentVerified) {
      booking = await prisma.booking.update({
        where: { reference },
        data: { status: "SUCCESS" },
        include: {
          event: true,
          tickets: { include: { tier: true } },
        },
      });

      await sendTicketEmail(
        booking.customerEmail,
        booking.customerName,
        booking.event.title,
        booking.reference,
      );
    }
  }

  const isSuccessful = booking.status === "SUCCESS";

  return (
    <div className="min-h-screen bg-slate-950 print:bg-white text-slate-100 print:text-black selection:bg-orange-500/30 selection:text-orange-50 pb-24 print:pb-0 relative overflow-hidden animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
        }}
      />
      {/* AMBIENT GLOW (Hidden on print) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none print:hidden"></div>

      {/* HEADER (Hidden on print) */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Bamba<span className="text-orange-500">Tickets</span>
            </span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-all shadow-inner"
          >
            Browse Events
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10 print:pt-4 space-y-8 print:space-y-4 relative z-10">
        {/* STATUS BANNER (Hidden on print) */}
        <div
          className={`p-8 rounded-3xl border text-center space-y-4 shadow-2xl backdrop-blur-xl print:hidden ${
            isSuccessful
              ? "bg-emerald-950/20 border-emerald-500/30"
              : "bg-amber-950/20 border-amber-500/30"
          }`}
        >
          {isSuccessful ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
          ) : (
            <Ticket className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isSuccessful
                ? "Payment Successful! Passes Issued."
                : "Payment Pending Verification"}
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-2">
              Ref:{" "}
              <span className="text-orange-400 font-bold">
                {booking.reference}
              </span>{" "}
              • Sent to {booking.customerEmail}
            </p>
          </div>
        </div>

        {/* PRINT HEADER (Only visible when printing) */}
        <div className="hidden print:block text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-3xl font-black uppercase tracking-widest">
            {booking.event.title}
          </h1>
          <p className="text-gray-500 font-mono mt-1 text-sm">
            OFFICIAL EVENT ENTRY PASS
          </p>
        </div>

        {/* EVENT & TICKETS SECTION */}
        <div className="bg-slate-900/60 print:bg-transparent backdrop-blur-2xl border border-slate-800/80 print:border-none rounded-3xl print:rounded-none p-5 sm:p-8 print:p-0 space-y-6 print:space-y-8 shadow-2xl print:shadow-none">
          <div className="border-b border-slate-800 pb-4 space-y-2 print:hidden">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              {booking.event.title}{" "}
              <Sparkles className="w-5 h-5 text-orange-500 opacity-50" />
            </h2>
            <p className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-500" />{" "}
                {new Date(booking.event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />{" "}
                {booking.event.location}
              </span>
            </p>
          </div>

          <h3 className="text-[10px] font-mono text-orange-500 print:hidden uppercase tracking-widest font-bold flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5" /> Your Scannable Passes (
            {booking.tickets.length})
          </h3>

          <div className="space-y-6 print:space-y-12">
            {booking.tickets.map((ticket, index) => (
              /* HIGH-END TICKET CARD DESIGN */
              <div
                key={ticket.id}
                className="relative flex flex-col sm:flex-row w-full bg-slate-950 print:bg-white border border-slate-800 print:border-2 print:border-gray-800 rounded-2xl overflow-hidden print:break-inside-avoid shadow-xl print:shadow-none"
              >
                {/* LEFT SIDE: DETAILS */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-orange-500/10 print:bg-black border border-orange-500/20 print:border-black text-orange-500 print:text-white font-bold font-mono rounded-lg print:rounded-md text-[10px] print:text-xs uppercase tracking-wider shadow-inner print:shadow-none">
                        {ticket.tier.name} PASS
                      </span>
                      <span className="text-[10px] print:text-sm font-mono font-bold text-slate-500 print:text-gray-500 uppercase tracking-widest">
                        Admit One • #{index + 1}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl print:text-3xl font-black text-white print:text-black leading-tight line-clamp-2">
                        {booking.event.title}
                      </h2>
                      <div className="text-[10px] sm:text-xs print:text-sm font-mono text-slate-400 print:text-gray-700 mt-3 space-y-2">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 print:text-black shrink-0" />{" "}
                          {new Date(booking.event.date).toLocaleDateString()} @{" "}
                          {new Date(booking.event.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 print:text-black shrink-0" />{" "}
                          <span className="truncate">
                            {booking.event.location}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800 print:border-gray-300">
                    <p className="text-[9px] print:text-xs text-slate-500 print:text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Guest Name
                    </p>
                    <p className="text-lg print:text-2xl font-black text-white print:text-black uppercase truncate">
                      {booking.customerName}
                    </p>
                    <p className="text-[9px] print:text-sm font-mono text-slate-500 print:text-gray-600 mt-1 uppercase tracking-widest">
                      ID: {ticket.ticketCode}
                    </p>
                  </div>
                </div>

                {/* TICKET PERFORATION DIVIDER */}
                <div className="hidden sm:flex flex-col items-center justify-center relative border-l-2 border-dashed border-slate-800 print:border-gray-400">
                  <div className="absolute -top-px w-6 h-6 bg-slate-900 print:bg-white rounded-full -translate-y-1/2 border-b-2 border-slate-800 print:border-gray-800"></div>
                  <div className="absolute -bottom-px w-6 h-6 bg-slate-900 print:bg-white rounded-full translate-y-1/2 border-t-2 border-slate-800 print:border-gray-800"></div>
                </div>

                {/* RIGHT SIDE: HUGE SCANNABLE STUB */}
                <div className="p-6 sm:p-8 bg-slate-900/50 print:bg-gray-50 flex flex-col items-center justify-center shrink-0 border-t sm:border-t-0 border-slate-800 print:border-t-2 print:border-dashed print:sm:border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none print:hidden" />

                  <div className="bg-white p-3 print:p-0 rounded-xl print:rounded-none flex items-center justify-center shadow-lg print:shadow-none relative z-10">
                    <div className="w-32 h-32 print:w-48 print:h-48 flex items-center justify-center">
                      <QRCode
                        value={ticket.ticketCode}
                        size={256}
                        style={{ height: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] print:text-xs font-mono text-orange-500 print:text-black font-black mt-4 tracking-widest uppercase text-center relative z-10">
                    Scan At
                    <br />
                    Entrance
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* PRINT BUTTON */}
          <div className="pt-6 mt-6 border-t border-slate-800 print:hidden flex justify-end">
            <PrintButton />
          </div>
        </div>
      </main>
    </div>
  );
}
