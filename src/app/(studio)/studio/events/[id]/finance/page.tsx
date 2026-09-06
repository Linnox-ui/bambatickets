import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";
import {
  DollarSign,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Wallet,
  CreditCard,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { updatePayoutSettings } from "../../../../../../actions/finance";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventFinancePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  // Fetch event, bookings, and organizer payout profile
  const [event, organizer] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bookings: {
          where: { status: "SUCCESS" },
          include: { tickets: { include: { tier: true } } },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
  ]);

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  // Financial calculations
  const grossRevenue = event.bookings.reduce((acc, b) => acc + b.amount, 0);
  const platformFeeRate = 0.05; // 5% Bamba Tickets platform commission
  const platformCommission = grossRevenue * platformFeeRate;
  const netOrganizerPayout = grossRevenue - platformCommission;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href={`/studio/events/${event.id}`}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
            Financial Ledger & Payouts
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyan-400" /> Gross Ticket Sales
          </p>
          <p className="text-3xl font-black text-white">
            KES {grossRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Total revenue collected from ticket buyers
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Platform Fee (5%)
          </p>
          <p className="text-3xl font-black text-amber-400">
            KES {platformCommission.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Bamba Tickets system maintenance cut
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-2 shadow-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" /> Net Organizer Payout
          </p>
          <p className="text-3xl font-black text-emerald-400">
            KES {netOrganizerPayout.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Your earnings sent directly to your payout account
          </p>
        </div>
      </div>

      {/* PAYOUT ACCOUNT CONFIGURATION */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-fuchsia-400" /> Payout
            Destination Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure where your net ticket earnings are disbursed after your
            event concludes.
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await updatePayoutSettings(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                M-Pesa Payout Number
              </label>
              <input
                type="text"
                name="payoutPhone"
                defaultValue={organizer?.payoutPhone || ""}
                placeholder="0712345678"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:border-fuchsia-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Bank Name (Optional)
              </label>
              <input
                type="text"
                name="bankName"
                defaultValue={organizer?.bankName || ""}
                placeholder="e.g. Equity Bank / KCB"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-fuchsia-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Bank Account Number / Paybill Account
              </label>
              <input
                type="text"
                name="accountNumber"
                defaultValue={organizer?.accountNumber || ""}
                placeholder="Account number or name"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:border-fuchsia-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
            >
              Save Payout Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
