"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upgradeToOrganizer } from "./actions";

export default function BecomeOrganizerPage() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await upgradeToOrganizer(formData);

    if (result.success) {
      await update({ role: "ORGANIZER" });
      router.push("/studio");
      router.refresh();
      return;
    }

    setError(result.error || "Something went wrong.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-slate-900 p-8 rounded-3xl border border-slate-800"
      >
        <h1 className="text-2xl font-black text-white mb-6">
          Become an Organizer
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <input
          name="payoutMethod"
          placeholder="Payout Method (e.g., M-PESA, BANK)"
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition-colors"
        />

        <input
          name="payoutAccountName"
          placeholder="Account Name (e.g., John Doe)"
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition-colors"
        />

        <input
          name="payoutAccountNumber"
          placeholder="Phone or Account Number"
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition-colors"
        />

        <input
          name="payoutBankName"
          placeholder="Bank Name (Optional, for Bank Transfers)"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition-colors"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest mt-4 transition-colors disabled:opacity-50"
        >
          {loading ? "Activating Studio..." : "Activate Studio Access"}
        </button>
      </form>
    </div>
  );
}
