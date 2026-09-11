"use client";

import { useState } from "react";
import { executePaystackPayout } from "../payout-actions";
import {
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

type PendingPayout = {
  id: string;
  amount: number;
  destination: string;
  createdAt: Date;
  organizer: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function PayoutQueue({
  payouts,
  canExecute,
}: {
  payouts: PendingPayout[];
  canExecute: boolean;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async (
    e: React.FormEvent<HTMLFormElement>,
    payoutId: string,
  ) => {
    e.preventDefault();
    setLoadingId(payoutId);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("payoutId", payoutId);

    const res = await executePaystackPayout(formData);

    if (!res.success) {
      setError(res.error || "Failed to execute payout.");
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-128">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest">
          <Wallet className="w-4 h-4 text-emerald-500" /> Pending Payout Queue
        </h2>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-1 rounded-md font-bold">
          {payouts.length} REQUESTS
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
          <AlertCircle className="w-4 h-4 shrink-0" />{" "}
          <span className="line-clamp-2">{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto terminal-scroll pr-2 space-y-4">
        {payouts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <CheckCircle2 className="w-8 h-8 mb-2" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Queue is clear
            </p>
          </div>
        ) : (
          payouts.map((payout) => (
            <div
              key={payout.id}
              className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {payout.organizer.firstName} {payout.organizer.lastName}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    {payout.organizer.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">
                    KES {payout.amount.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-mono text-slate-500">
                    {/* FIXED: Enforced a strict locale format to prevent hydration mismatch */}
                    {new Date(payout.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{payout.destination}</span>
              </div>

              {canExecute ? (
                <form
                  onSubmit={(e) => handleExecute(e, payout.id)}
                  className="mt-1"
                >
                  <button
                    type="submit"
                    disabled={loadingId === payout.id}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 hover:text-slate-950 font-black rounded-xl py-3 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {loadingId === payout.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" /> Disburse via Paystack
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="mt-1 text-[10px] font-mono text-amber-500/70 border border-amber-500/20 bg-amber-500/5 px-2 py-2 rounded-xl text-center uppercase tracking-widest">
                  Requires God Mode to Execute
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
