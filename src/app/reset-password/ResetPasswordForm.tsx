"use client";

import { useState } from "react";
import Link from "next/link";
import { executePasswordReset } from "../forgot-password/actions";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";

export default function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token || !email) {
    return (
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
          Invalid or Expired Link
        </p>
        <Link
          href="/forgot-password"
          className="text-slate-400 text-[10px] font-mono hover:text-white underline underline-offset-2 transition-colors"
        >
          Request a new password reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append("token", token);
    formData.append("email", email);

    const res = await executePasswordReset(formData);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "A system error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 shadow-inner">
          <KeyRound className="w-6 h-6 text-orange-500" />
        </div>
        <h1 className="text-xl font-black text-white tracking-widest uppercase">
          Reset Password
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-2 text-center">
          Updating security for:{" "}
          <span className="text-orange-400">{email}</span>
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4 shadow-inner">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Password Updated
          </p>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Sign In Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            required
            className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 text-xs text-white rounded-xl px-4 py-3.5 outline-none transition-all placeholder:text-slate-600 shadow-inner"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
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
            className="w-full py-3.5 mt-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save New Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
