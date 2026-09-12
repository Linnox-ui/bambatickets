"use client";

import { useState } from "react";
import { requestOrganizerPayout } from "../payout-actions";
import {
  Wallet,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function WalletWidget({
  availableBalance,
  hasPaymentMethod,
}: {
  availableBalance: number;
  hasPaymentMethod: boolean;
}) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const reqAmount = parseFloat(amount);

    // Server-side validation mirror
    if (isNaN(reqAmount) || reqAmount > availableBalance || reqAmount < 100) {
      setError("Invalid withdrawal amount. Minimum is KES 100.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("amount", reqAmount.toString());

    try {
      const res = await requestOrganizerPayout(formData);

      if (res.success) {
        setSuccess(true);
        setAmount("");
      } else {
        setError(res.error || "Failed to process request.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 hover:border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl transition-colors group flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-slate-400 font-medium text-xs sm:text-sm uppercase tracking-wider truncate">
              Cleared Balance
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
          <span className="text-cyan-500 text-xs sm:text-sm font-bold font-mono">
            KES
          </span>
          <span className="text-lg sm:text-xl lg:text-3xl font-black text-white tracking-tight break-all">
            {availableBalance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-800/60">
        {!hasPaymentMethod ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" /> Action Required
            </div>
            <p className="text-[10px] text-amber-500/80 font-mono">
              Configure your payout destination in settings to withdraw funds.
            </p>
            <Link
              href="/studio/payouts"
              className="text-[10px] font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 py-2 px-4 rounded-lg text-center uppercase tracking-widest transition-colors"
            >
              Setup Payout Method
            </Link>
          </div>
        ) : success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Request Submitted
            </p>
            <p className="text-[10px] text-emerald-500/70 font-mono mt-1">
              Funds will be disbursed shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                KES
              </span>
              <input
                type="number"
                min="100"
                max={availableBalance}
                step="1"
                required
                disabled={loading || availableBalance <= 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-slate-600 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {error && (
              <p className="text-red-400 text-[10px] font-bold bg-red-500/10 px-2 py-1.5 rounded-lg text-center uppercase tracking-widest">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || availableBalance <= 0 || !amount}
              className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 hover:border-cyan-500 text-cyan-500 hover:text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] disabled:opacity-50 disabled:pointer-events-none text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  Withdraw <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
