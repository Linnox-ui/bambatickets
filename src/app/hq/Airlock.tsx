"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { unlockHQ } from "./actions";
import { Terminal } from "lucide-react";

export default function Airlock() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTimestamp(new Date().toUTCString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setLoading(true);
    const res = await unlockHQ(pin);

    if (res.success) {
      // 🚀 Refreshing tells the server to re-read the new secure cookie
      router.refresh();
    } else {
      setError(true);
      setPin("");
      setLoading(false);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-4 sm:p-8 selection:bg-emerald-500 selection:text-black flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-black border border-slate-800 p-6 sm:p-8 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.05)]">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <Terminal className="w-6 h-6 text-emerald-500" />
          <span className="text-sm tracking-widest uppercase font-bold text-slate-400">
            Bamba-OS / Root Access Shell
          </span>
        </div>

        <div className="space-y-2 text-sm sm:text-base leading-relaxed opacity-90">
          <p>
            System initialized at:{" "}
            <span className="text-emerald-400">{timestamp}</span>
          </p>
          <p>Kernel 6.1.0-amd64 #1 SMP PREEMPT_DYNAMIC</p>
          <br />
          <p className="text-red-500 font-bold animate-pulse">
            WARNING: RESTRICTED COMMAND NODE.
          </p>
          <p className="text-slate-400">
            Unauthorized access will be logged and reported.
          </p>
          <br />
          <p>
            HQ_NODE login: <span className="text-white">root_admin</span>
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
              className={`bg-transparent outline-none border-none text-white tracking-[0.5em] font-black caret-emerald-500 ${error ? "text-red-500" : ""}`}
            />
          </form>

          {error && (
            <p className="text-red-500 mt-2 font-bold uppercase">
              Access Denied. Incorrect Auth Hash.
            </p>
          )}
          {loading && !error && (
            <p className="text-emerald-400 mt-2 animate-pulse">
              Decrypting payload...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
