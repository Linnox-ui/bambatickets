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

  // 🚀 World-Class Additions: Shift metrics & Recent scans log
  const [shiftCount, setShiftCount] = useState(0);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

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
          { fps: 15, qrbox: { width: 260, height: 260 } },
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
        ...prev.slice(0, 4), // Keep last 5 scans
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
    // 1. Clear camera scanner hardware if active
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        // Suppress cleanup errors
      }
      scannerRef.current = null;
    }

    // 2. Destroy server session cookie
    await logoutGateStaff(eventId);

    // 3. Reset local states and reload
    setIsAuthenticated(false);
    setStaffName("");
    setShiftCount(0);
    setRecentScans([]);
    window.location.reload();
  };

  const handleReset = async () => {
    setScanResult(null);
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
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // 1. PIN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              Gatekeeper Terminal
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enter Security PIN
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Authorized gate officers only. Enter your assigned access PIN.
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
              className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-center text-3xl font-mono tracking-[0.5em] focus:border-cyan-500 outline-none transition-all shadow-inner"
            />

            {errorMsg && (
              <p className="text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 py-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_25px_rgba(8,145,178,0.4)] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Authenticate & Open Gate"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. WORLD-CLASS SCANNER TERMINAL
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 pb-24">
      <div className="max-w-xl mx-auto space-y-6">
        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  Live Gate Active
                </span>
              </div>
              <h2 className="text-sm font-black text-white">{staffName}</h2>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Lock Gate
          </button>
        </div>

        {/* SHIFT METRICS COUNTER BAR */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Processed By You
              </p>
              <p className="text-2xl font-black text-cyan-400">{shiftCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl text-fuchsia-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Terminal Status
              </p>
              <p className="text-sm font-bold text-fuchsia-400 mt-1">
                High Speed
              </p>
            </div>
          </div>
        </div>

        {/* SCANNER VIEWPORT CARD */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-inner">
            <div id="gate-reader" className="w-full"></div>
          </div>

          {/* LIGHTNING-FAST MANUAL INPUT */}
          <div className="pt-2 border-t border-slate-800/80">
            <form onSubmit={handleManualSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                disabled={isProcessing}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Or type/paste ticket code..."
                className="w-full pl-10 pr-28 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 outline-none uppercase transition-all disabled:opacity-50 shadow-inner"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualCode.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center shadow-md"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>
          </div>

          {/* SCAN RESULT OVERLAY (HIGH CONTRAST) */}
          {scanResult && (
            <div
              className={`p-6 rounded-2xl border-2 animate-in zoom-in-95 duration-200 ${
                scanResult.success
                  ? "bg-emerald-950/80 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  : "bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-bounce" />
                ) : (
                  <XCircle className="w-16 h-16 text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse" />
                )}

                <h2
                  className={`text-2xl font-black tracking-tight ${scanResult.success ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {scanResult.message}
                </h2>

                {scanResult.success && scanResult.ticketDetails && (
                  <div className="w-full pt-3 border-t border-emerald-500/30 text-xs space-y-2 text-left font-mono">
                    <div className="flex justify-between text-emerald-100 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-400/80 font-bold">
                        GUEST:
                      </span>
                      <span className="font-black text-white text-sm">
                        {scanResult.ticketDetails.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-100 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-400/80 font-bold">
                        PASS TYPE:
                      </span>
                      <span className="font-bold text-cyan-300">
                        {scanResult.ticketDetails.tierName}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs transition-all shadow-xl"
                >
                  <RefreshCcw className="w-4 h-4 text-cyan-400" /> Scan Next
                  Ticket
                </button>
              </div>
            </div>
          )}

          {!scanResult && (
            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-slate-950/60 py-3 rounded-xl border border-slate-800/60 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Ready to scan
              tickets...
            </div>
          )}
        </div>

        {/* RECENT SCANS LOG DRAWER */}
        {recentScans.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <History className="w-4 h-4 text-cyan-400" /> Recent Scans
              Activity Log
            </h3>
            <div className="space-y-2">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${scan.success ? "bg-emerald-500" : "bg-rose-500"}`}
                    ></span>
                    <div>
                      <p className="font-bold text-white font-sans">
                        {scan.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {scan.tier} • {scan.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[10px]">
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
