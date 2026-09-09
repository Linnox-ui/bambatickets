"use client";

import { use, useEffect, useRef, useState } from "react";
// @ts-ignore - html5-qrcode lacks built-in types in some environments
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCcw,
  Search,
  Loader2,
  ScanLine,
  Power,
} from "lucide-react";
import Link from "next/link";
import { checkInTicket } from "../../../../../../actions/scanner";

interface PageProps {
  params: Promise<{ id: string }>;
}

type ScanStatus = {
  success: boolean;
  message: string;
  ticketDetails?: {
    eventTitle: string;
    customerName: string;
    tierName: string;
  };
} | null;

export default function EventScannerPage({ params }: PageProps) {
  const { id } = use(params);

  const [scanResult, setScanResult] = useState<ScanStatus>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannerInstance, setScannerInstance] = useState<any | null>(null);

  // 🚀 New state to handle gracefully turning the camera on/off without locking the page
  const [isCameraOn, setIsCameraOn] = useState(true);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const pendingTeardownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const isScanningRef = useRef(true);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    // If the user turned the camera off via the Stop button, do not initialize it.
    if (!isCameraOn) return;

    if (pendingTeardownRef.current) {
      clearTimeout(pendingTeardownRef.current);
      pendingTeardownRef.current = null;
    }

    async function onScanSuccess(decodedText: string) {
      if (!isScanningRef.current || isProcessingRef.current) return;
      isScanningRef.current = false;
      setIsProcessing(true);
      setScanResult(null);

      try {
        scannerRef.current?.pause();
      } catch (e) {}

      try {
        const response = await checkInTicket(decodedText);
        setScanResult(response);
      } finally {
        setIsProcessing(false);
      }
    }

    function onScanError(_error: any) {}

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );
      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      setScannerInstance(scanner);
    }

    // Cleanup: gracefully clears the camera when navigating away OR when isCameraOn becomes false
    return () => {
      pendingTeardownRef.current = setTimeout(() => {
        isScanningRef.current = false;
        const s = scannerRef.current;
        scannerRef.current = null;
        setScannerInstance(null);
        if (s) {
          try {
            s.clear().catch(() => {});
          } catch (e) {}
        }
      }, 200);
    };
  }, [id, isCameraOn]);

  const handleReset = async () => {
    setScanResult(null);
    isScanningRef.current = true;

    // If camera was off, turn it back on. If it's already on, just resume it.
    if (!isCameraOn) {
      setIsCameraOn(true);
    } else if (scannerInstance) {
      try {
        scannerInstance.resume();
      } catch (e) {}
    }
  };

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      const response = await checkInTicket(manualCode.trim());
      setScanResult(response);
    } finally {
      setIsProcessing(false);
      setManualCode("");
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-fade-in-up">
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
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Overriding HTML5 Qrcode Default UI */
        #reader { border: none !important; border-radius: 1rem; overflow: hidden; width: 100%; }
        #reader video { object-fit: cover !important; border-radius: 0.75rem; }
        #reader__dashboard_section_csr span { color: #fff !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
        #reader__dashboard_section_csr button { background-color: #f97316 !important; color: #fff !important; border: none !important; border-radius: 0.5rem !important; padding: 0.5rem 1rem !important; font-weight: bold !important; cursor: pointer; margin-top: 10px; }
      `,
        }}
      />

      {/* HEADER */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-800/80">
        <Link
          href={`/studio/events/${id}`}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-amber-500/50 transition-all group w-fit shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </Link>
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">
            Gate Security Protocol
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Live Scanner{" "}
            <ScanLine className="w-6 h-6 text-amber-500 opacity-50" />
          </h1>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* 🚀 CAMERA VIEWPORT WITH OVERLAYS */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-1 min-h-75 sm:min-h-100 flex flex-col justify-center shadow-inner">
          {/* Base Camera Feed */}
          <div
            id="reader"
            className={`w-full relative z-10 ${!isCameraOn ? "hidden" : ""}`}
          ></div>

          {/* Camera Off Overlay */}
          {!isCameraOn && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950">
              <Power className="w-12 h-12 text-slate-800 mb-4" />
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-6">
                Camera Offline
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 font-black tracking-widest uppercase rounded-xl text-xs transition-colors border border-amber-500/30 shadow-lg"
              >
                Turn Camera On
              </button>
            </div>
          )}

          {/* Holographic Laser Animation (Active only when searching) */}
          {isCameraOn && !scanResult && !isProcessing && (
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
                      <span className="font-bold text-white">
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
              </div>
            </div>
          )}
        </div>

        {/* 🚀 ACTION BUTTONS BELOW THE CAMERA */}
        <div className="pt-2 relative z-10 space-y-4">
          {/* If Result is showing, show the Next / Stop buttons */}
          {scanResult ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black tracking-widest uppercase rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" /> Scan Next Ticket
              </button>

              {isCameraOn && (
                <button
                  onClick={() => setIsCameraOn(false)}
                  className="sm:w-1/3 flex items-center justify-center gap-2 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white font-bold tracking-widest uppercase rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  <Power className="w-4 h-4 text-slate-500" /> Stop Camera
                </button>
              )}
            </div>
          ) : (
            /* If NO result is showing, show the Manual input and Stop button */
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  disabled={isProcessing}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Or type ticket hash manually..."
                  className="w-full pl-11 pr-28 py-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:border-amber-500 outline-none uppercase transition-all shadow-inner disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !manualCode.trim()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-500 font-bold tracking-widest uppercase rounded-lg text-[10px] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />{" "}
                  {isCameraOn
                    ? "Auto-scanning active"
                    : "Auto-scanning offline"}
                </div>
                {isCameraOn && (
                  <button
                    onClick={() => setIsCameraOn(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold tracking-widest uppercase rounded-lg text-[10px] transition-colors"
                  >
                    <Power className="w-3 h-3" /> Stop Camera
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
