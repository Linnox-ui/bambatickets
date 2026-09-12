"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await requestPasswordReset(formData);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "A system error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">
            Recover Access
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-2 text-center">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {success ? (
          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl text-center space-y-4 shadow-inner">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">
              Reset Link Sent
            </p>
            <p className="text-slate-300 text-xs font-mono">
              If an account exists for that email, a secure link has been sent
              to your inbox.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest shadow-inner"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-4 py-3.5 outline-none transition-all placeholder:text-slate-600 shadow-inner"
            />

            {error && (
              <p className="text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center uppercase tracking-widest shadow-inner">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-[10px] text-slate-500 hover:text-orange-400 uppercase tracking-widest font-bold transition-colors mt-6 pt-4 border-t border-slate-800/50"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
