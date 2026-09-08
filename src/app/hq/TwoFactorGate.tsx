"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyHQ2FA } from "./actions";
import { ShieldCheck } from "lucide-react";

export default function TwoFactorGate({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    const res = await verifyHQ2FA(code);

    if (res.success) {
      router.refresh(); // Reloads to show the dashboard!
    } else {
      setError(true);
      setCode("");
      setLoading(false);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Radar background effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_70%,rgba(249,115,22,0.1)_100%)] animate-[spin_4s_linear_infinite]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Two-Step Verification
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter the 6-digit security code for <br />
            <span className="text-emerald-400 font-mono">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} // Only allows numbers
              placeholder="000000"
              disabled={loading}
              autoFocus
              className={`w-full bg-slate-950 border ${error ? "border-red-500" : "border-slate-800 focus:border-orange-500"} text-center text-3xl font-mono text-white rounded-xl py-4 tracking-widest outline-none transition-colors shadow-inner`}
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              {loading ? "Verifying..." : "Verify Identity"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm font-bold mt-4 animate-pulse">
              Invalid Code. Access Denied.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
