"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyHQ2FA, requestHQ2FACode } from "./actions";
import { ShieldCheck, RefreshCw } from "lucide-react";

export default function TwoFactorGate({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const router = useRouter();

  useEffect(() => {
    requestHQ2FACode();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(45);
    await requestHQ2FACode();
  };

  const processVerification = async (codeToVerify: string) => {
    setLoading(true);
    setErrorMsg(null);

    const res = await verifyHQ2FA(codeToVerify);

    if (res.success) {
      router.refresh();
    } else {
      setErrorMsg(res.error || "Invalid code.");
      setCode("");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.replace(/\D/g, "");
    setCode(newCode);

    if (newCode.length === 6 && !loading) {
      processVerification(newCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && !loading) {
      processVerification(code);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-orange-500/30">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <ShieldCheck className="w-8 h-8 text-orange-500" />
          </div>

          <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-widest border border-orange-500/20 px-2.5 py-1 rounded-full mb-3">
            Ring 4: Dual-Factor Gate
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Authorization Challenge
          </h2>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            One-time cryptographic passkey sent to: <br />
            <span className="text-orange-400 font-mono font-bold">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={handleInputChange}
              placeholder="••••••"
              disabled={loading}
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-center text-3xl font-mono text-white rounded-2xl py-4 tracking-[0.4em] outline-none transition-all shadow-inner placeholder:text-slate-700"
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] text-xs uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Authorize Root Clearance"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="hover:text-slate-300 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`}
              />
              {cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Passcode"}
            </button>
            <span className="font-mono text-[10px]">Session: 15m</span>
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-bold mt-4 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
