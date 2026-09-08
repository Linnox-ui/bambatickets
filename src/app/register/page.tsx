"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "../../actions/auth";
import {
  Ticket,
  Mic2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Mail,
  KeyRound,
  User,
  Phone,
} from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"CUSTOMER" | "ORGANIZER">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("roleType", role);

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success) {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-center shadow-2xl animate-fade-in-up">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            We've sent a secure verification link to your inbox. Please click it
            to activate your {role.toLowerCase()} account.
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-slate-950 font-bold rounded-xl transition-colors inline-flex items-center gap-2 text-xs"
          >
            Proceed to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 font-sans relative flex flex-col justify-center items-center px-4 py-12">
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
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-in-up">
        {/* MONOLITHIC CARD CONTAINER */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-orange-500/50 to-transparent" />

          {/* EMBEDDED HEADER ANIMATION */}
          <div className="flex flex-col items-center gap-3 mb-6">
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
                New Account Registration
              </p>
            </div>
          </div>

          {/* ROLE TOGGLE */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === "CUSTOMER" ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Ticket className="w-3.5 h-3.5" /> Attendee
            </button>
            <button
              type="button"
              onClick={() => setRole("ORGANIZER")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${role === "ORGANIZER" ? "bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Mic2 className="w-3.5 h-3.5" /> Organizer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner placeholder-slate-600"
                    placeholder=""
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner placeholder-slate-600"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner placeholder-slate-600"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Phone Number
              </label>
              <div className="flex">
                <span className="bg-slate-950 border border-r-0 border-slate-800 text-slate-400 rounded-l-xl px-3 py-3 font-mono text-xs flex items-center">
                  +254
                </span>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-r-xl pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner placeholder-slate-600"
                    placeholder="712 345 678"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-orange-500/50 transition-colors shadow-inner placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {role === "ORGANIZER" && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3.5 flex gap-3">
                <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-200/70 leading-relaxed">
                  Organizer accounts require profile verification prior to
                  publishing ticketed events.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-pulse">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="group relative w-full py-3.5 bg-linear-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-slate-950 font-black rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase overflow-hidden flex items-center justify-center gap-2 mt-2"
            >
              <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center gap-2">
                {loading ? "Initializing..." : "Create Account"}{" "}
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 font-mono">
              Already authorized?{" "}
              <Link
                href="/login"
                className="text-orange-500 font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
