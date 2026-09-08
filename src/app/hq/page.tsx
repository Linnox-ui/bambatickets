import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";
import Airlock from "./Airlock";
import TwoFactorGate from "./TwoFactorGate";
import {
  ShieldAlert,
  Terminal,
  Activity,
  Users,
  Banknote,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default async function HQDashboard() {
  const cookieStore = await cookies();

  // ==========================================
  // RING 1: THE AIRLOCK (PIN CHECK)
  // ==========================================
  const hqClearance = cookieStore.get("bamba_hq_clearance");
  if (hqClearance?.value !== "GRANTED") {
    return <Airlock />;
  }

  // ==========================================
  // RING 2: IDENTITY (LOGIN CHECK)
  // ==========================================
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hq`);
  }

  // ==========================================
  // RING 3: CLEARANCE (ROLE CHECK)
  // ==========================================
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // 🚀 THE LOCKDOWN PROTOCOL (Intimidating Access Denied Screen)
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SUPERVISOR")) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center font-mono text-center p-4 relative overflow-hidden selection:bg-red-900 selection:text-white">
        {/* Ambient Siren & Grid Effects */}
        <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full border border-red-900/50 bg-black p-8 sm:p-12 shadow-[0_0_100px_rgba(220,38,38,0.15)]">
          <div className="w-24 h-24 border border-red-600 flex items-center justify-center mb-8 relative bg-red-950/20">
            <div className="absolute inset-0 border border-red-500 animate-[ping_3s_ease-in-out_infinite] opacity-50" />
            <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-red-600 tracking-[0.3em] uppercase mb-2">
            Access Denied
          </h1>
          <h2 className="text-red-500/80 tracking-[0.5em] text-xs sm:text-sm font-bold uppercase mb-8">
            Security Incident Logged
          </h2>

          <div className="w-full bg-red-950/20 border border-red-900/50 p-6 text-left space-y-3 font-mono text-xs sm:text-sm text-red-400 mb-8 relative overflow-hidden shadow-inner">
            {/* Fake Laser Scanline */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(200px); }
              }
            `,
              }}
            />
            <div className="absolute top-0 left-0 w-full h-px shadow-[0_0_10px_rgba(239,68,68,1)] bg-red-500 animate-[scan_2s_linear_infinite]" />

            <p className="text-red-300 flex justify-between border-b border-red-900/50 pb-2">
              <span className="tracking-widest opacity-70">
                TARGET IDENTITY:
              </span>
              <span className="text-white font-bold tracking-wider">
                {user?.email || "UNKNOWN"}
              </span>
            </p>
            <p className="text-red-300 flex justify-between border-b border-red-900/50 pb-2">
              <span className="tracking-widest opacity-70">
                CURRENT CLEARANCE:
              </span>
              <span className="text-red-500 font-bold tracking-wider">
                {user?.role || "GUEST"}
              </span>
            </p>
            <p className="text-red-300 flex justify-between pb-1">
              <span className="tracking-widest opacity-70">
                REQUIRED CLEARANCE:
              </span>
              <span className="text-red-500 font-bold bg-red-950 px-2 tracking-widest border border-red-900/50">
                [REDACTED]
              </span>
            </p>
          </div>

          <p className="text-red-500/60 mt-2 text-[10px] sm:text-xs max-w-md leading-relaxed uppercase tracking-widest text-justify">
            Warning: You have entered a restricted command node without
            sufficient clearance. This unauthorized access attempt has been
            recorded. Terminate this connection immediately.
          </p>

          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="mt-12 group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-950 hover:bg-red-600 text-red-500 hover:text-black border border-red-800 hover:border-red-500 font-black tracking-[0.2em] uppercase transition-all duration-300"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
            <LogOut className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Sever Connection</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // RING 4: TWO-STEP VERIFICATION (2FA CHECK)
  // ==========================================
  const twoFactorClearance = cookieStore.get("bamba_hq_2fa");
  if (twoFactorClearance?.value !== "VERIFIED") {
    return <TwoFactorGate email={user.email} />;
  }

  // ==========================================
  // GOD MODE REACHED: Render Dashboard
  // ==========================================
  const isCEO = user.role === "SUPER_ADMIN";
  const totalUsers = await prisma.user.count();
  const totalEvents = await prisma.event.count();
  const platformRevenue = 450000;

  const recentErrors = [
    {
      id: 1,
      level: "CRITICAL",
      message: "M-Pesa API Timeout during checkout",
      path: "/api/checkout",
      time: "2 mins ago",
    },
    {
      id: 2,
      level: "WARNING",
      message: "Image upload failed for Organizer ID 492",
      path: "/studio/events/new",
      time: "1 hr ago",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <header className="max-w-7xl mx-auto flex items-center justify-between pb-8 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <ShieldAlert className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              BAMBA <span className="text-orange-500">HQ</span>
            </h1>
            <p className="text-sm font-mono text-slate-400">
              Access Level:{" "}
              {isCEO ? (
                <span className="text-emerald-400">CEO / SUPER ADMIN</span>
              ) : (
                <span className="text-cyan-400">SUPERVISOR</span>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Banknote className="w-16 h-16" />
            </div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">
              Platform Revenue
            </h3>
            <div className="text-3xl font-black text-emerald-400">
              KES {platformRevenue.toLocaleString()}
            </div>
            {isCEO && (
              <p className="text-xs text-slate-500 mt-2">
                Available for withdrawal
              </p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Ticket className="w-16 h-16" />
            </div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">
              Total Events
            </h3>
            <div className="text-3xl font-black text-white">{totalEvents}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="w-16 h-16" />
            </div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">
              Active Users
            </h3>
            <div className="text-3xl font-black text-white">{totalUsers}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-16 h-16" />
            </div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">
              System Status
            </h3>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />{" "}
              OPERATIONAL
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Terminal className="w-5 h-5 text-orange-500" />
                ICT Error Telemetry
              </h2>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-sm">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="p-4 space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div
                      className={`px-2 py-1 rounded text-[10px] font-black shrink-0 ${error.level === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}
                    >
                      {error.level}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-300">{error.message}</p>
                      <p className="text-slate-500 text-xs">
                        Location:{" "}
                        <span className="text-cyan-400">{error.path}</span>
                      </p>
                    </div>
                    <div className="text-slate-600 text-xs shrink-0">
                      {error.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-500" />
              HQ Staff
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              {isCEO ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <p className="font-bold text-white">Innocent Lusigi</p>
                      <p className="text-xs text-slate-500">CEO / Root Admin</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <p className="font-bold text-slate-300">Jane Doe</p>
                      <p className="text-xs text-cyan-400">Junior Supervisor</p>
                    </div>
                    <button className="text-xs px-3 py-1 bg-slate-800 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors">
                      Revoke
                    </button>
                  </div>
                  <button className="w-full py-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-950 font-bold rounded-lg text-sm transition-all border border-orange-500/20 hover:border-orange-500">
                    + Invite Supervisor
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 opacity-50">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-sm font-bold">
                    Clearance Level Insufficient
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Only the CEO can manage staff.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
