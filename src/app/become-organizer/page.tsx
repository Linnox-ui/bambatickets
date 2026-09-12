"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upgradeToOrganizer } from "./actions";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function BecomeOrganizerPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await upgradeToOrganizer();

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-2 tracking-tight">
          Activate Organizer Studio
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Confirm your identity to unlock event creation and sales telemetry.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Verified Identity
            </span>
            <span className="font-bold text-white text-sm">
              {session?.user?.name || "Loading..."}
            </span>
            <span className="text-slate-400 text-xs">
              {session?.user?.email || ""}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading || !session}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Upgrading...
            </>
          ) : (
            <>
              Confirm & Enter Studio <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-500 text-center mt-6 font-mono">
          You can configure your payout destinations later in the Studio
          settings.
        </p>
      </div>
    </div>
  );
}
