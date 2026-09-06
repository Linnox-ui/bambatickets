"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { registerAction } from "../../actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden selection:bg-fuchsia-500 selection:text-white py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-linear-to-tr from-cyan-600/20 to-fuchsia-600/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/25 group-hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            Become an Organizer
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Create your account to start selling tickets instantly.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800/60">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                    placeholder="Jane"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  disabled={isLoading}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                  placeholder="creator@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-linear-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Launch Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-white hover:text-cyan-400 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
