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
  // Unwrap the params promise directly during render instead of via a
  // useEffect + state pair. The effect-based approach re-creates a new
  // resolvedParams object on every params reference change (even when
  // the underlying id hasn't changed), which retriggers the scanner
  // effect below and can loop the camera init/teardown cycle instead
  // of ever letting a scan reach the check-in action.
  const { id } = use(params);

  const [scanResult, setScanResult] = useState<ScanStatus>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannerInstance, setScannerInstance] = useState<any | null>(null);

  // React Strict Mode runs effect -> cleanup -> effect synchronously on
  // first mount (dev only). html5-qrcode is not designed to survive that:
  // creating a second Html5QrcodeScanner before the first one's async
  // getUserMedia/render() flow has settled leaves stale DOM references
  // in the first instance, which later throw when it tries to update
  // text nodes that no longer exist ("Cannot set properties of null
  // (setting 'innerText')") or collide mid video.play() (AbortError).
  //
  // Fix: keep at most ONE scanner instance alive for the component's
  // real lifetime (via scannerRef, not state), and delay actual
  // teardown so a Strict Mode phantom cleanup can be cancelled by the
  // very next effect run before .clear() ever executes.
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const pendingTeardownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const isScanningRef = useRef(true);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    // A previous effect pass scheduled teardown but this run arrived
    // before it fired — cancel it, we're reusing the existing scanner.
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
        // Pause scanning logic only — do NOT pass `true` here. That
        // variant also tears down the camera preview/video track, which
        // triggers an internal html5-qrcode DOM cleanup (via an
        // out-of-band requestAnimationFrame callback, outside this
        // try/catch's reach) that can fire against text nodes it has
        // already removed, throwing "Cannot set properties of null
        // (setting 'innerText')". Pausing without hiding the camera
        // avoids that code path entirely.
        scannerRef.current?.pause();
      } catch (e) {
        // Ignore pause state errors
      }

      try {
        const response = await checkInTicket(decodedText);
        setScanResult(response);
      } finally {
        setIsProcessing(false);
      }
    }

    function onScanError(_error: any) {
      // Suppress routine scanning frame errors
    }

    // Only create the scanner once. On a Strict Mode remount, the
    // instance from the first pass is still here (teardown was
    // cancelled above), so we just reuse it.
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

    return () => {
      // Don't tear down immediately — give a genuine-unmount vs.
      // Strict-Mode-phantom-cleanup a moment to disambiguate. If the
      // effect fires again quickly, the cancellation above wins and
      // this callback's timeout is cleared before it ever runs.
      pendingTeardownRef.current = setTimeout(() => {
        isScanningRef.current = false;
        const s = scannerRef.current;
        scannerRef.current = null;
        if (s) {
          try {
            s.clear().catch(() => {
              // Swallow — clear() can reject if getUserMedia never finished
            });
          } catch (e) {
            // Suppress unmount teardown errors
          }
        }
      }, 200);
    };
  }, [id]);

  const handleReset = async () => {
    setScanResult(null);
    isScanningRef.current = true;
    if (scannerInstance) {
      try {
        scannerInstance.resume();
      } catch (e) {
        // Fallback if resume fails
      }
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
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/studio/events/${id}`}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
            Gate Security
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Live Camera Scanner
          </h1>
        </div>
      </div>

      <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* VIEWPORT CONTAINER */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2">
          <div id="reader" className="w-full"></div>
        </div>

        {/* MANUAL FALLBACK */}
        <div className="pt-4 border-t border-slate-800/80">
          <form onSubmit={handleManualSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              disabled={isProcessing}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Or type ticket code manually..."
              className="w-full pl-10 pr-28 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-500 outline-none uppercase transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isProcessing || !manualCode.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center justify-center shadow-md"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </button>
          </form>
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
  );
}
