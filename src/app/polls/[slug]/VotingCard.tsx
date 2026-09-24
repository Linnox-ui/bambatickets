"use client";

import { useState, useEffect } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { Turnstile } from "@marsidev/react-turnstile";
import { CheckCircle2, Loader2, Trophy, AlertCircle, Share2 } from "lucide-react";

interface VotingCardProps {
  campaignId: string;
  candidateId: string;
  candidateName: string;
  imageUrl?: string | null;
  candidateVotes: number;
  totalCampaignVotes: number;
  isLeader: boolean;
}

export default function VotingCard({ 
  campaignId, 
  candidateId, 
  candidateName, 
  imageUrl,
  candidateVotes,
  totalCampaignVotes,
  isLeader
}: VotingCardProps) {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const [imageFailed, setImageFailed] = useState(false);
  
  // Safely grab the current URL for the share buttons (client-side only)
  const [currentUrl, setCurrentUrl] = useState("");
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setStatus("error");
      setMessage("Security check in progress. Please wait a second and try again.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const fp = await fpPromise.load();
      const result = await fp.get();
      const deviceHash = result.visitorId;

      const response = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          candidateId,
          userEmail: email,
          deviceHash,
          turnstileToken, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process vote.");
      }

      setStatus("success");
      setMessage("Success! Your vote has been securely recorded.");
      setEmail(""); 

    } catch (error: any) {
      setStatus("error");
      setMessage(error.message); 
    }
  };

  const displayVotes = status === "success" ? candidateVotes + 1 : candidateVotes;
  const displayTotal = status === "success" ? totalCampaignVotes + 1 : totalCampaignVotes;
  const percentage = displayTotal > 0 ? Math.round((displayVotes / displayTotal) * 100) : 0;

  const hasValidImage = imageUrl && imageUrl.trim() !== "" && !imageFailed;

  // --- SOCIAL SHARING LOGIC ---
  const shareText = `I just voted for ${candidateName}! 🏆 Help them win on Bamba Tickets!`;
  
  const handleXShare = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + currentUrl)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-4xl flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgb(249,115,22,0.1)] relative overflow-hidden group w-full max-w-90 min-w-0">
      
      {/* BLURRED BACKGROUND DROPSHADOW EFFECT */}
      <div className="absolute top-0 left-0 w-full h-48 bg-slate-950 overflow-hidden pointer-events-none">
        {hasValidImage ? (
          <img 
            src={imageUrl} 
            alt="" 
            className="w-full h-full object-cover blur-2xl opacity-40 scale-125 transition-transform duration-1000 group-hover:scale-150"
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>

      {/* CRISP CENTRAL AVATAR */}
      <div className="relative pt-10 px-6 flex flex-col items-center text-center z-10">
        {hasValidImage ? (
          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            <img 
              src={imageUrl} 
              alt={candidateName} 
              onError={() => setImageFailed(true)}
              className="w-full h-full rounded-full object-cover border-4 border-slate-900 shadow-2xl bg-slate-800 relative z-10"
            />
            <div className="absolute inset-0 rounded-full border border-orange-500/20 scale-110 pointer-events-none group-hover:scale-125 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-slate-900 shadow-2xl bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center relative z-10">
            <span className="text-5xl font-black text-slate-500 uppercase tracking-tighter">
              {candidateName.charAt(0)}
            </span>
          </div>
        )}

        <h3 className="text-2xl font-black text-white tracking-tight mt-5 mb-2 wrap-break-word w-full drop-shadow-md">
          {candidateName}
        </h3>
      </div>

      {/* INTERACTIVE CONTROLS SECTION */}
      <div className="flex-1 flex flex-col justify-end p-6 pt-2 relative z-10 min-w-0 w-full">
        {status === "success" ? (
          /* --- SUCCESS & RESULTS STATE --- */
          <div className="animate-fade-in-up space-y-4 min-w-0">
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-3 rounded-2xl border border-emerald-500/20 w-full shadow-inner">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-center truncate">Vote Counted</span>
            </div>

            <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800/50 w-full backdrop-blur-md">
              <div className="flex justify-between items-end text-sm mb-3 min-w-0">
                <span className="font-mono text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-1.5 shrink-0">
                  <Trophy className="w-3 h-3 text-orange-500" /> Standings
                </span>
                <div className="text-right shrink-0">
                  <span className="font-black text-white text-2xl mr-1.5">{percentage}%</span>
                  <span className="font-mono text-slate-500 text-xs">({displayVotes.toLocaleString()})</span>
                </div>
              </div>
              
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                    isLeader || status === "success" ? "bg-linear-to-r from-orange-600 to-orange-400" : "bg-slate-700"
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>

            {/* --- NEW VIRAL SHARE BUTTONS --- */}
            <div className="pt-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px bg-slate-800/60 flex-1" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Share2 className="w-3 h-3" /> Campaign for {candidateName.split(" ")[0]}
                </span>
                <div className="h-px bg-slate-800/60 flex-1" />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleXShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-950 hover:bg-black text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-800 hover:border-slate-700 transition-all group/xbtn"
                >
                  {/* Official X Logo SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover/xbtn:scale-110 transition-transform">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share
                </button>
                
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-[#25D366]/20 transition-all group/wabtn shadow-[0_0_15px_rgba(37,211,102,0)] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                >
                  {/* Official WhatsApp Logo SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover/wabtn:scale-110 transition-transform">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- VOTING FORM STATE --- */
          <form onSubmit={handleVote} className="space-y-4 min-w-0 w-full mt-4">
            {status === "error" && message && (
              <div className="flex items-start justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-fade-in-up w-full text-center">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="wrap-break-word">{message}</span>
              </div>
            )}
            
            <div className="w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                placeholder="Enter email to verify"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-center placeholder:text-slate-600 disabled:opacity-50 shadow-inner"
              />
            </div>

            <div className="flex justify-center bg-slate-950/50 rounded-xl overflow-hidden border border-slate-800/80 w-full min-h-16.25 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Loading Security...</span>
              </div>
              <div className="relative z-10 w-full flex justify-center py-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => {
                    setStatus("error");
                    setMessage("Security check failed. Please refresh the page.");
                  }}
                  options={{ theme: "dark" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !turnstileToken}
              className="w-full py-4 bg-slate-100 hover:bg-white text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group/btn"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Cast Vote</span>
                  <span className="group-hover/btn:-translate-y-0.5 transition-transform">&uarr;</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}