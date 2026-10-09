"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" /> Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" /> Copy Link
        </>
      )}
    </button>
  );
}
