"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmailToken } from "../../actions/auth";
import {
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Fingerprint,
  Loader2,
} from "lucide-react";

function CodeVerificationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (code.length === 6 && !loading && !success) {
      handleVerification(code);
    }
  }, [code]);

  const handleVerification = async (verificationCode: string) => {
    setLoading(true);
    setError("");

    const res = await verifyEmailToken(verificationCode, email);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      setCode("");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && !loading) {
      handleVerification(code);
    }
  };

  if (!email) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">
          Access Denied
        </h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">
          Security violation: Missing email payload in transmission.
        </p>
        <Link
          href="/register"
          className="w-full max-w-70 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">
          Identity Confirmed
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
          Your account is now fully operational across the Bamba network.
        </p>
        <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-mono font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" /> Rerouting to gateway...
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center text-center w-full animate-fade-in-up"
    >
      <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mb-6 relative">
        {loading && (
          <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/60 opacity-0 animate-shockwave" />
        )}
        <Fingerprint
          className={`w-8 h-8 text-orange-500 relative z-10 ${loading ? "animate-pulse" : ""}`}
        />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-widest">
        Enter Code
      </h2>
      <p className="text-slate-400 text-xs sm:text-sm mb-8 leading-relaxed max-w-70">
        We dispatched a 6-digit authorization code to{" "}
        <strong className="text-orange-400 break-all">{email}</strong>.
      </p>

      <div className="relative w-full max-w-70 mb-6">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={loading}
          autoFocus
          className="w-full text-center bg-slate-950/80 border border-slate-700 focus:border-orange-500 text-white text-3xl sm:text-4xl font-mono tracking-[0.3em] sm:tracking-[0.5em] rounded-2xl py-4 sm:py-5 shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-slate-800 disabled:opacity-50"
          placeholder="000000"
        />

        {loading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center border border-orange-500/50 transition-all">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="w-full max-w-70 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-400 text-xs font-bold animate-pulse mb-6">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="text-left leading-tight">{error}</span>
        </div>
      )}

      <button
        disabled={loading || code.length !== 6}
        type="submit"
        className="group relative w-full max-w-70 py-4 bg-linear-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-slate-950 font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase overflow-hidden flex items-center justify-center gap-2"
      >
        <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <span className="relative flex items-center gap-2">
          {loading ? "Verifying..." : "Authorize Session"}{" "}
          <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes shockwave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; border-width: 1px; }
        }
        .animate-shockwave {
          animation: shockwave 2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          background: linear-gradient(120deg, #f97316 20%, #ffedd5 40%, #ffedd5 60%, #f97316 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3s linear infinite;
        }
      `,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] sm:w-[50%] h-[70%] sm:h-[50%] rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/" className="relative group">
              <div className="relative w-16 h-16 flex items-center justify-center transition-all duration-700 ease-out group-hover:scale-110">
                <div
                  className="absolute inset-0 rounded-full border-2 border-orange-500/60 opacity-0 group-hover:animate-shockwave"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-orange-500/40 opacity-0 group-hover:animate-shockwave"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="relative w-full h-full animate-float drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  <img
                    src="/logo.svg"
                    alt="Bamba Tickets"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </Link>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center">
                BAMBA<span className="animate-shine ml-1.5">TICKETS</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                Security Node
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                  Booting Terminal...
                </p>
              </div>
            }
          >
            <CodeVerificationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
