import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";
import Airlock from "./Airlock";
import TwoFactorGate from "./TwoFactorGate";
import HQHeader from "./components/HQHeader";
import SuperAdminView from "./views/SuperAdminView";
import SupervisorView from "./views/SupervisorView";
import IctView from "./views/IctView";
import { verifyClearanceToken } from "../../lib/hq-security";
import { Role } from "@prisma/client";
import { ShieldAlert, LogOut } from "lucide-react";

export default async function HQDashboard() {
  const cookieStore = await cookies();

  const hqClearance = cookieStore.get("bamba_hq_clearance");
  if (!hqClearance || !verifyClearanceToken(hqClearance.value, 15)) {
    return <Airlock />;
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/hq");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const hqRoles: Role[] = ["SUPER_ADMIN", "SUPERVISOR", "IT_TEAM"];

  if (!user || !hqRoles.includes(user.role as Role)) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center font-mono text-center p-4 selection:bg-red-900 selection:text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="max-w-xl w-full border border-red-900/60 bg-black p-8 sm:p-12 shadow-[0_0_80px_rgba(220,38,38,0.2)] text-left space-y-6 relative z-10">
          <div className="flex items-center gap-4 text-red-500 border-b border-red-900/50 pb-4">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
            <div>
              <h1 className="text-xl font-black tracking-widest uppercase">
                Security Lockdown
              </h1>
              <p className="text-xs text-red-400 font-mono">
                Unauthorized Clearance Attempt
              </p>
            </div>
          </div>
          <div className="bg-red-950/20 border border-red-900/50 p-4 text-xs space-y-2 text-red-300">
            <div className="flex justify-between">
              <span>TARGET IDENTITY:</span>
              <span className="text-white font-bold">
                {user?.email || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ASSIGNED ROLE:</span>
              <span className="text-red-400 font-bold">
                {user?.role || "CUSTOMER"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>REQUIRED LEVEL:</span>
              <span className="text-white font-bold bg-red-950 px-1 border border-red-800">
                COMMAND_NODE_AUTHORIZED
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
            This incident has been logged. Terminate this connection
            immediately.
          </p>
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" /> Disconnect Node
          </Link>
        </div>
      </div>
    );
  }

  const twoFactorClearance = cookieStore.get("bamba_hq_2fa");
  if (
    !twoFactorClearance ||
    !verifyClearanceToken(twoFactorClearance.value, 15)
  ) {
    return <TwoFactorGate email={user.email} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        @keyframes shockwave-slow {
          0% { transform: scale(0.8); opacity: 0.5; border-width: 2px; }
          100% { transform: scale(2); opacity: 0; border-width: 1px; }
        }
        .animate-shockwave-slow {
          animation: shockwave-slow 3s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
        .terminal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: #020617;
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />

      <HQHeader role={user.role as Role} />

      <main className="max-w-360 mx-auto py-8 relative z-10">
        {user.role === "SUPER_ADMIN" && (
          <SuperAdminView role={user.role as Role} />
        )}
        {user.role === "SUPERVISOR" && (
          <SupervisorView role={user.role as Role} />
        )}
        {user.role === "IT_TEAM" && <IctView />}
      </main>
    </div>
  );
}
