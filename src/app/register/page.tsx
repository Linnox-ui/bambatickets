"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../actions/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result.success) {
      toast.success(result.success);
      setTimeout(() => {
        router.push("/api/auth/signin");
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Colorful Atmospheric Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Frosted Glass Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/60 p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            BambaTickets
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Create your account to start managing events.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all disabled:opacity-50 text-slate-100 placeholder-slate-600 outline-none"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all disabled:opacity-50 text-slate-100 placeholder-slate-600 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all disabled:opacity-50 text-slate-100 placeholder-slate-600 outline-none"
              placeholder="hello@bambatickets.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all disabled:opacity-50 text-slate-100 placeholder-slate-600 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-fuchsia-500/25 transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-white/70" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/api/auth/signin"
            className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
