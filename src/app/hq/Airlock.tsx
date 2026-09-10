"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { unlockHQ } from "./actions";
import { Terminal, ShieldAlert } from "lucide-react";

export default function Airlock() {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTimestamp(new Date().toUTCString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || loading) return;

    setLoading(true);
    setErrorMsg(null);

    const res = await unlockHQ(pin);

    if (res.success) {
      router.refresh();
    } else {
      setErrorMsg(res.error || "Access Denied.");
      setPin("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-4 sm:p-8 selection:bg-emerald-500 selection:text-black flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-black border border-slate-800 p-6 sm:p-8 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-500" />
            <span className="text-sm tracking-widest uppercase font-bold text-slate-400">
              Bamba-OS / Root Access Shell
            </span>
          </div>
          <span className="text-[10px] text-orange-500 font-bold tracking-widest border border-orange-500/30 px-2 py-0.5 rounded">
            RING 1 / AIRLOCK
          </span>
        </div>

        <div className="space-y-2 text-sm sm:text-base leading-relaxed opacity-90">
          <p>
            System initialized:{" "}
            <span className="text-emerald-400">{timestamp}</span>
          </p>
          <p>Kernel 6.1.0-amd64 #1 SMP PREEMPT_DYNAMIC</p>
          <p className="text-red-500 font-bold flex items-center gap-2 pt-2">
            <ShieldAlert className="w-4 h-4" /> RESTRICTED ACCESS NODE.
          </p>
          <p className="text-slate-500 text-xs">
            Attempts monitored. Three consecutive failures will enforce an IP
            quarantine.
          </p>
          <br />
          <p>
            HQ_NODE login: <span className="text-white">root_supervisor</span>
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-2 flex items-center gap-2"
          >
            <span>Password:</span>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={loading}
              autoFocus
              placeholder="••••••"
              className="bg-transparent outline-none border-none text-white tracking-[0.5em] font-black caret-emerald-500 w-48 placeholder-slate-700"
            />
          </form>

          {errorMsg && (
            <p className="text-red-400 mt-3 text-xs bg-red-950/40 border border-red-900/60 p-2.5 rounded font-bold uppercase tracking-wider">
              {errorMsg}
            </p>
          )}

          {loading && (
            <p className="text-emerald-400 mt-3 text-xs animate-pulse">
              [+] Verifying cryptographic node signature...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
