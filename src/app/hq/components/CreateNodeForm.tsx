"use client";

import { useState } from "react";
import { provisionHQNode } from "../actions";
import { UserPlus, Loader2 } from "lucide-react";

export default function CreateNodeForm({
  creatorRole,
}: {
  creatorRole: string;
}) {
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
    const res = await provisionHQNode(formData);

    if (res.success) {
      setSuccess(true);
      form.reset();
    } else {
      setError(res.error || "Failed to provision node.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6">
        <UserPlus className="w-4 h-4 text-emerald-500" /> Provision Node
      </h2>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            required
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            required
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="System Email"
          required
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
        />

        <input
          type="password"
          name="password"
          placeholder="Initial Passkey"
          required
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-600"
        />

        <div className="relative">
          <select
            name="role"
            required
            defaultValue=""
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-xl px-3 py-2.5 outline-none transition-all appearance-none"
          >
            <option value="" disabled>
              Select Clearance Level
            </option>
            {creatorRole === "SUPER_ADMIN" && (
              <option value="SUPERVISOR">SUPERVISOR</option>
            )}
            <option value="IT_TEAM">IT_TEAM</option>
          </select>
        </div>

        <div className="flex-1" />

        {error && (
          <p className="text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center uppercase tracking-widest">
            {error}
          </p>
        )}

        {success && (
          <p className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center uppercase tracking-widest">
            NODE AUTHORIZED
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-500 hover:text-slate-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Authorize Identity"
          )}
        </button>
      </form>
    </div>
  );
}
