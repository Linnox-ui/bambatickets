"use client";

import { useState } from "react";
import { Scan, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import { checkInTicket } from "../../../actions/scanner";

type ScanResult = {
  success: boolean;
  message: string;
  ticketDetails?: {
    eventTitle: string;
    customerName: string;
    tierName: string;
  };
} | null;

export default function GateScannerPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketCode) return;

    setIsScanning(true);
    setResult(null); // Clear previous result

    // Call our server action
    const scanResponse = await checkInTicket(ticketCode);

    setResult(scanResponse);
    setIsScanning(false);
    setTicketCode(""); // Clear input for the next person in line
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <Scan className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Gate Scanner
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Enter ticket code to verify access
          </p>
        </div>

        {/* SCANNER INPUT FORM */}
        <form onSubmit={handleScan} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-500" />
          </div>
          <input
            type="text"
            required
            autoFocus
            disabled={isScanning}
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            className="w-full pl-14 pr-32 py-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-xl font-mono text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-500 transition-all outline-none uppercase shadow-xl"
            placeholder="BAMBA-XXXX"
          />
          <button
            type="submit"
            disabled={isScanning || !ticketCode}
            className="absolute right-2 top-2 bottom-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isScanning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify"
            )}
          </button>
        </form>

        {/* RESULTS AREA */}
        {result && (
          <div
            className={`p-6 rounded-3xl border-2 shadow-2xl animate-in zoom-in-95 duration-200 ${
              result.success
                ? "bg-emerald-950/50 border-emerald-500/50"
                : "bg-rose-950/50 border-rose-500/50"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              {result.success ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              ) : (
                <XCircle className="w-16 h-16 text-rose-500 mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
              )}

              <h2
                className={`text-2xl font-black mb-2 ${result.success ? "text-emerald-400" : "text-rose-400"}`}
              >
                {result.message}
              </h2>

              {/* If successful, show who is walking through the door */}
              {result.success && result.ticketDetails && (
                <div className="mt-4 pt-4 border-t border-emerald-500/20 w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-500/70">Event</span>
                    <span className="font-bold text-emerald-100">
                      {result.ticketDetails.eventTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-500/70">Guest</span>
                    <span className="font-bold text-emerald-100">
                      {result.ticketDetails.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-500/70">Access</span>
                    <span className="font-bold text-emerald-100">
                      {result.ticketDetails.tierName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
