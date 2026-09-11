"use client";

import { useState } from "react";
import { changePassword } from "../actions";
import { KeyRound, Loader2 } from "lucide-react";

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(form);
    const res = await changePassword(formData);

    if (res.success) {
      setSuccess(true);
      form.reset();
    } else {
      setError(res.error || "Failed to update credential.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
        <KeyRound className="w-4 h-4 text-cyan-500" /> Security Credential
      </h2>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Passkey"
          required
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Passkey"
          required
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Passkey"
          required
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
        />

        <div className="flex-1" />

        {error && (
          <p className="text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center uppercase tracking-widest">
            {error}
          </p>
        )}

        {success && (
          <p className="text-cyan-400 text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl text-center uppercase tracking-widest">
            CREDENTIAL UPDATED
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 hover:border-cyan-500 text-cyan-500 hover:text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Update Credential"
          )}
        </button>
      </form>
    </div>
  );
}
