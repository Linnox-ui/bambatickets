"use client";

import { useState, use } from "react";
// @ts-ignore
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { verifyGateStaffPin } from "../../../actions/staff";
import { checkInTicket } from "../../../actions/scanner";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function GatekeeperPortalPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<any>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg("");

    const res = await verifyGateStaffPin(eventId, pin);
    if (res.error) {
      setErrorMsg(res.error);
      setIsLoggingIn(false);
    } else {
      setStaffName(res.staffName || "Gate Officer");
      setIsAuthenticated(true);
      setIsLoggingIn(false);

      // Initialize scanner after successful authentication
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "gate-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false,
        );

        let isScanning = true;

        async function onScanSuccess(decodedText: string) {
          if (!isScanning || isProcessing) return;
          isScanning = false;
          setIsProcessing(true);
          setScanResult(null);

          try {
            await scanner.pause(true);
          } catch (e) {}

          const response = await checkInTicket(decodedText);
          setScanResult(response);
          setIsProcessing(false);
        }

        scanner.render(onScanSuccess, () => {});
        setScannerInstance(scanner);
      }, 100);
    }
  }

  const handleReset = async () => {
    setScanResult(null);
    if (scannerInstance) {
      try {
        scannerInstance.resume();
      } catch (e) {}
    }
  };

  // 1. PIN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              Gatekeeper Access
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enter Your Gate PIN
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Authorized personnel only. Enter the PIN provided by your event
              organizer.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-center text-2xl font-mono tracking-widest focus:border-cyan-500 outline-none"
            />

            {errorMsg && (
              <p className="text-rose-400 text-xs font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Unlock Gate Scanner"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. SECURE SCANNER SCREEN
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
              Logged in as
            </span>
            <h2 className="text-lg font-black text-white">{staffName}</h2>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            Lock Gate
          </button>
        </div>

        {/* SCANNER CONTAINER */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2">
            <div id="gate-reader" className="w-full"></div>
          </div>

          {/* RESULTS OVERLAY */}
          {scanResult && (
            <div
              className={`p-6 rounded-2xl border-2 animate-in zoom-in-95 duration-200 ${
                scanResult.success
                  ? "bg-emerald-950/60 border-emerald-500/50"
                  : "bg-rose-950/60 border-rose-500/50"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                ) : (
                  <XCircle className="w-14 h-14 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                )}

                <h2
                  className={`text-xl font-black ${scanResult.success ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {scanResult.message}
                </h2>

                {scanResult.success && scanResult.ticketDetails && (
                  <div className="w-full pt-3 border-t border-emerald-500/20 text-xs space-y-1.5 text-left font-mono">
                    <div className="flex justify-between text-emerald-200">
                      <span className="text-emerald-400/70">Guest:</span>
                      <span className="font-bold">
                        {scanResult.ticketDetails.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-200">
                      <span className="text-emerald-400/70">Pass Type:</span>
                      <span className="font-bold">
                        {scanResult.ticketDetails.tierName}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <RefreshCcw className="w-4 h-4 text-cyan-400" /> Scan Next
                  Ticket
                </button>
              </div>
            </div>
          )}

          {!scanResult && (
            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Point camera at
              attendee's ticket QR code
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
