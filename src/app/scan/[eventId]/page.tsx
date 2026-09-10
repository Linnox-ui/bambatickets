"use client";

import { useState, use, useEffect, useRef } from "react";
// @ts-ignore
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Loader2,
  Search,
  Camera,
  History,
  UserCheck,
  Zap,
  LogOut,
  ScanLine,
} from "lucide-react";
import {
  verifyGateStaffPin,
  checkGateSession,
  logoutGateStaff,
} from "../../../actions/staff";
import { checkInTicket } from "../../../actions/scanner";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

type RecentScan = {
  id: string;
  name: string;
  tier: string;
  time: string;
  success: boolean;
};

export default function GatekeeperPortalPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const [shiftCount, setShiftCount] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isScanningRef = useRef(true);

  useEffect(() => {
    checkGateSession(eventId).then((res) => {
      if (res.isAuthenticated && res.staffName) {
        setStaffName(res.staffName);
        setIsAuthenticated(true);
        initScanner();
      }
      setIsLoadingSession(false);
    });
  }, [eventId]);

  const initScanner = () => {
    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "gate-reader",
          {
            fps: 15,
            qrbox: { width: 260, height: 260 },
            videoConstraints: {
              facingMode: "environment",
            },
          },
          false,
        );

        isScanningRef.current = true;

        async function onScanSuccess(decodedText: string) {
          if (!isScanningRef.current || isProcessing) return;
          isScanningRef.current = false;
          setIsProcessing(true);
          setScanResult(null);

          try {
            await scanner.pause(true);
          } catch (e) {}

          const response = await checkInTicket(decodedText);
          handleScanOutcome(response, decodedText);
          setIsProcessing(false);
        }

        scanner.render(onScanSuccess, () => {});
        scannerRef.current = scanner;
      }
    }, 150);
  };

  const handleScanOutcome = (response: any, code: string) => {
    setScanResult(response);

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    if (response.success) {
      setShiftCount((prev) => prev + 1);
      setRecentScans((prev) => [
        {
          id: code,
          name: response.ticketDetails?.customerName || "Guest",
          tier: response.ticketDetails?.tierName || "Standard",
          time: timeStr,
          success: true,
        },
        ...prev.slice(0, 4),
      ]);
    } else {
      setRecentScans((prev) => [
        {
          id: code,
          name: response.message || "Failed Scan",
          tier: "Rejected",
          time: timeStr,
          success: false,
        },
        ...prev.slice(0, 4),
      ]);
    }
  };

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
      initScanner();
    }
  }

  const handleLogout = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }

    await logoutGateStaff(eventId);
    setIsAuthenticated(false);
    setStaffName("");
    setShiftCount(0);
    setRecentScans([]);
    window.location.reload();
  };

  const handleReset = async () => {
    setScanResult(null);
    isScanningRef.current = true;
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {}
    }
  };

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setIsProcessing(true);
    setScanResult(null);

    const response = await checkInTicket(manualCode.trim().toUpperCase());
    handleScanOutcome(response, manualCode);
    setIsProcessing(false);
    setManualCode("");
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // 1. PIN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 animate-fade-in-up">
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
          }}
        />

        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative z-10">
            <Lock className="w-6 h-6 text-orange-500" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest block mb-1 font-bold">
              Gatekeeper Terminal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Access Control
            </h1>
            <p className="text-slate-400 text-xs mt-2">
              Enter your assigned staff PIN to unlock the scanner.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <input
              type="password"
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-center text-3xl font-mono tracking-[0.5em] focus:border-orange-500 outline-none transition-all shadow-inner placeholder:tracking-[0.5em]"
            />

            {errorMsg && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 py-3 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || pin.length < 4}
              className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black tracking-widest uppercase rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Authenticate Gate"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. WORLD-CLASS SCANNER TERMINAL
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 pb-24 animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes laserScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser { animation: laserScan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Overriding HTML5 Qrcode Default UI */
        #gate-reader { border: none !important; border-radius: 1rem; overflow: hidden; width: 100%; }
        #gate-reader video { object-fit: cover !important; border-radius: 0.75rem; }
        #gate-reader__dashboard_section_csr span { color: #fff !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
        #gate-reader__dashboard_section_csr button { background-color: #f97316 !important; color: #fff !important; border: none !important; border-radius: 0.5rem !important; padding: 0.5rem 1rem !important; font-weight: bold !important; cursor: pointer; margin-top: 10px; }
      `,
        }}
      />

      <div className="max-w-xl mx-auto space-y-6">
        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Live Gate Active
                </span>
              </div>
              <h2 className="text-sm font-black text-white">{staffName}</h2>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-[10px] uppercase tracking-widest font-bold rounded-xl border border-slate-800 transition-all shadow-inner"
          >
            <LogOut className="w-3.5 h-3.5" /> Lock
          </button>
        </div>

        {/* SHIFT METRICS COUNTER BAR */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Processed By You
              </p>
              <p className="text-2xl font-black text-amber-500">{shiftCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Terminal Status
              </p>
              <p className="text-sm font-bold text-orange-400 mt-1">
                Optimized
              </p>
            </div>
          </div>
        </div>

        {/* SCANNER VIEWPORT CARD */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* 🚀 CAMERA VIEWPORT WITH OVERLAYS */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-1 min-h-75 sm:min-h-100 flex flex-col justify-center shadow-inner">
            {/* Base Camera Feed */}
            <div id="gate-reader" className="w-full relative z-10"></div>

            {/* Holographic Laser Animation (Active only when searching) */}
            {!scanResult && !isProcessing && (
              <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden">
                <div className="absolute left-0 right-0 h-1 bg-amber-500 shadow-[0_0_20px_rgba(249,115,22,1)] animate-laser" />
                <div
                  className="absolute inset-0 bg-linear-to-b from-transparent via-amber-500/5 to-transparent opacity-50 animate-laser"
                  style={{ height: "20%" }}
                />
              </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && !scanResult && (
              <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-amber-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                <p className="text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
                  Decrypting Ticket...
                </p>
              </div>
            )}

            {/* 🚀 BEAUTIFUL RESULT OVERLAY ON TOP OF CAMERA */}
            {scanResult && (
              <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                <div
                  className={`w-full max-w-sm p-6 sm:p-8 rounded-3xl border-2 animate-pop-in shadow-2xl flex flex-col items-center text-center space-y-4 ${
                    scanResult.success
                      ? "bg-emerald-950/95 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                      : "bg-red-950/95 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                  }`}
                >
                  {scanResult.success ? (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <XCircle className="w-10 h-10 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    </div>
                  )}

                  <h2
                    className={`text-2xl font-black tracking-tight ${scanResult.success ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {scanResult.message}
                  </h2>

                  {scanResult.success && scanResult.ticketDetails && (
                    <div className="w-full pt-4 mt-2 border-t border-emerald-500/30 text-xs sm:text-sm space-y-2 text-left font-mono bg-emerald-950/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center text-emerald-100 border-b border-emerald-500/20 pb-2">
                        <span className="text-emerald-500/80 uppercase tracking-widest text-[10px]">
                          Guest Name
                        </span>
                        <span className="font-bold text-white truncate max-w-37.5">
                          {scanResult.ticketDetails.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-100 pt-1">
                        <span className="text-emerald-500/80 uppercase tracking-widest text-[10px]">
                          Pass Type
                        </span>
                        <span className="font-black text-amber-400">
                          {scanResult.ticketDetails.tierName}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-bold tracking-widest uppercase rounded-xl text-[10px] transition-all shadow-xl active:scale-95"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 text-orange-500" /> Scan
                    Next Ticket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LIGHTNING-FAST MANUAL INPUT */}
          <div className="pt-2 relative z-10">
            <form onSubmit={handleManualSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                disabled={isProcessing}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Or type/paste ticket code..."
                className="w-full pl-11 pr-28 py-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:border-orange-500 outline-none uppercase transition-all shadow-inner disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualCode.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-500 font-bold tracking-widest uppercase rounded-lg text-[10px] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RECENT SCANS LOG DRAWER */}
        {recentScans.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
              <History className="w-3.5 h-3.5 text-orange-500" /> Recent
              Activity Log
            </h3>
            <div className="space-y-2">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs font-mono shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full shadow-lg ${scan.success ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"}`}
                    ></span>
                    <div>
                      <p className="font-bold text-white font-sans truncate max-w-37.5 sm:max-w-50">
                        {scan.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {scan.tier} • {scan.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">
                    {scan.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
