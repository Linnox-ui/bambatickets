"use client";

import { ArrowRight } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] flex items-center gap-2"
    >
      Save / Print Passes <ArrowRight className="w-4 h-4" />
    </button>
  );
}
