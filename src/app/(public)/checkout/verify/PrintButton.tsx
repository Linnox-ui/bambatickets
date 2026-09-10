"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
    >
      <Printer className="w-4 h-4 text-orange-500" /> Save / Print Passes
    </button>
  );
}
