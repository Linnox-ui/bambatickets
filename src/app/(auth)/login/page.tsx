"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ArrowRight, ShieldAlert, Mail, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Access denied.");
        setLoading(false);
      } else {
        const session = await getSession();

        if (session?.user?.role === "ORGANIZER") {
          router.push("/studio");
        } else {
          router.push(callbackUrl !== "/" ? callbackUrl : "/");
        }

        router.refresh();
      }
    } catch (err) {
      setError("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner placeholder-slate-600"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-orange-500 hover:text-orange-400 font-medium"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner placeholder-slate-600"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-pulse">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="group relative w-full py-4 bg-linear-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-slate-950 font-black rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase overflow-hidden flex items-center justify-center gap-2 mt-2"
      >
        <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <span className="relative flex items-center gap-2">
          {loading ? "Authorizing..." : "Authenticate Session"}{" "}
          <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </form>
  );
}

export default function LoginPage() {
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

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-orange-500/50 to-transparent" />

          {/* EMBEDDED HEADER ANIMATION */}
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
                Secure Gateway
              </p>
            </div>
          </div>

          {/* 🚀 Wrapped in Suspense to satisfy Next.js static prerendering */}
          <Suspense
            fallback={
              <div className="text-center text-slate-500 py-10 font-mono text-xs animate-pulse">
                Initializing Gateway...
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 font-mono">
              New to the system?{" "}
              <Link
                href="/register"
                className="text-orange-500 font-bold hover:underline"
              >
                Register Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
