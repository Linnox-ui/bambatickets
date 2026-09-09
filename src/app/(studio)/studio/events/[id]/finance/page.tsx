import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  Building2,
  Smartphone,
  Lock,
  ArrowRight,
  Receipt,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id?: string; eventId?: string }>;
}

export default async function EventFinancePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const targetId = resolvedParams?.id || resolvedParams?.eventId;

  if (!targetId) notFound();

  // Fetch event, successful bookings, and the organizer's global payout profile
  const [event, organizer] = await Promise.all([
    prisma.event.findUnique({
      where: { id: targetId },
      include: {
        bookings: {
          where: { status: "SUCCESS" },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        payoutMethod: true,
        payoutAccountName: true,
        payoutAccountNumber: true,
        payoutBankName: true,
      },
    }),
  ]);

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  // 🚀 FINANCIAL CALCULATIONS (Respecting the Fee Bearer model)
  // Assuming 5.5% Bamba platform fee for this example
  const platformFeeRate = 0.055;

  const totalGrossRevenue = event.bookings.reduce(
    (acc, b) => acc + b.amount,
    0,
  );

  let netOrganizerPayout = 0;
  let totalPlatformCommission = 0;

  if (event.feeBearer === "ATTENDEE") {
    // If attendee paid the fee, it was added on top of the ticket price.
    // The organizer gets exactly the gross ticket value they set.
    // (Note: In a real checkout, booking.amount would include the fee. For this dashboard, we rely on the DB fields.)
    netOrganizerPayout =
      event.bookings.reduce((acc, b) => acc + b.organizerPayout, 0) ||
      totalGrossRevenue;
    totalPlatformCommission =
      event.bookings.reduce((acc, b) => acc + b.platformFee, 0) || 0;
  } else {
    // If organizer absorbs the fee, it comes out of their gross ticket sales.
    totalPlatformCommission = totalGrossRevenue * platformFeeRate;
    netOrganizerPayout = totalGrossRevenue - totalPlatformCommission;
  }

  const maskNumber = (num: string | null) => {
    if (!num) return "Not Configured";
    if (num.length <= 4) return num;
    return `•••• ${num.slice(-4)}`;
  };

  const isPayoutConfigured = !!organizer?.payoutMethod;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      {/* PREMIUM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-800/80">
        <Link
          href={`/studio/events/${targetId}`}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-emerald-500/50 transition-all group w-fit"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 mb-1.5">
            <Receipt className="w-3.5 h-3.5" />
            Financial Ledger
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Revenue & Payouts
          </h1>
        </div>
      </div>

      {/* FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Gross Ticket Sales
          </p>
          <p className="text-3xl font-black text-white">
            <span className="text-lg text-slate-500 mr-1">KES</span>
            {totalGrossRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Total volume processed
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Platform Fee{" "}
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 ml-auto text-[9px]">
              {event.feeBearer === "ATTENDEE" ? "Passed to Buyer" : "Absorbed"}
            </span>
          </p>
          <p className="text-3xl font-black text-amber-400">
            <span className="text-lg text-amber-500/50 mr-1">KES</span>
            {totalPlatformCommission.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Bamba Tickets commission
          </p>
        </div>

        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-3xl space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
          <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            Net Organizer Payout
          </p>
          <p className="text-3xl font-black text-emerald-400 relative z-10">
            <span className="text-lg text-emerald-500/50 mr-1">KES</span>
            {netOrganizerPayout.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-500/80 font-mono relative z-10">
            Final earnings ready for disbursement
          </p>
        </div>
      </div>

      {/* PAYOUT DESTINATION OVERVIEW (Read-Only) */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="border-b border-slate-800 pb-4 mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" /> Payout
              Destination
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Your earnings for this event will automatically be routed to your
              master payout configuration when the event concludes.
            </p>
          </div>
          <Link
            href="/studio/payouts"
            className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors border border-slate-700"
          >
            Change Settings
          </Link>
        </div>

        {isPayoutConfigured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Network
              </p>
              <p className="font-bold text-white flex items-center gap-2">
                {organizer.payoutMethod === "BANK" ? (
                  <Building2 className="w-4 h-4 text-orange-400" />
                ) : (
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                )}
                {organizer.payoutMethod?.replace("_", " ")}
              </p>
            </div>

            {organizer.payoutBankName && (
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                  Institution
                </p>
                <p className="font-bold text-white">
                  {organizer.payoutBankName}
                </p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Account Name
              </p>
              <p className="font-bold text-white">
                {organizer.payoutAccountName}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Account Number
              </p>
              <p className="font-mono text-lg font-black text-white tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                {maskNumber(organizer.payoutAccountNumber)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl text-center space-y-4">
            <Wallet className="w-10 h-10 text-orange-500 mx-auto opacity-50" />
            <div>
              <p className="font-bold text-white">
                No Payout Method Configured
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You must configure a payout method to receive your earnings.
              </p>
            </div>
            <Link
              href="/studio/payouts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              Configure Payouts Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
