"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";

interface EventBannerProps {
  imageUrl: string | null;
  title: string;
  isPublished?: boolean;
  heightClass?: string;
}

export default function EventBanner({
  imageUrl,
  title,
  isPublished,
  heightClass = "h-64 sm:h-80",
}: EventBannerProps) {
  const [imageError, setImageError] = useState(false);

  // Strict validation: ensures image exists, is a valid non-empty string, and hasn't errored out
  const hasValidImage = Boolean(
    imageUrl &&
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    !imageError,
  );

  return (
    <div
      className={`${heightClass} w-full bg-slate-950 relative overflow-hidden flex items-center justify-center`}
    >
      {hasValidImage ? (
        <img
          src={imageUrl as string}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950/40 relative">
          {/* Atmospheric Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-fuchsia-600/20 via-cyan-600/10 to-transparent" />

          {/* Large Glassmorphic Icon Badge */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md flex items-center justify-center shadow-2xl z-10">
            <Ticket className="w-10 h-10 text-fuchsia-400" />
          </div>
        </div>
      )}

      {isPublished !== undefined && (
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 text-xs font-semibold text-fuchsia-400 z-10">
          {isPublished ? "Published" : "Active Event"}
        </div>
      )}
    </div>
  );
}
