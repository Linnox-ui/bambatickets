"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Navigation, 
  MapPin, 
  Car, 
  Copy, 
  Check, 
  ExternalLink, 
  X,
  Compass,
  LocateFixed
} from "lucide-react";

interface VenueNavigatorProps {
  locationName: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  renderAsIconOnly?: boolean;
}

export default function VenueNavigator({
  locationName,
  venueAddress,
  latitude,
  longitude,
  renderAsIconOnly = false,
}: VenueNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isFetchingUserLoc, setIsFetchingUserLoc] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userAgent = navigator.userAgent || navigator.vendor;
    setIsAppleDevice(/iPad|iPhone|iPod|Macintosh/.test(userAgent));
  }, []);

  const handleOpenNavigator = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    
    if (!navigator.geolocation) return;

    setIsFetchingUserLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsFetchingUserLoc(false);
      },
      () => {
        setIsFetchingUserLoc(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const destLat = latitude || -1.2921;
  const destLng = longitude || 36.8219;
  const encodedLocationText = encodeURIComponent(locationName);

  const navigationLinks = {
    googleMaps: userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${destLat},${destLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
    
    appleMaps: userCoords
      ? `https://maps.apple.com/?saddr=${userCoords.lat},${userCoords.lng}&daddr=${destLat},${destLng}&dirflg=d`
      : `https://maps.apple.com/?daddr=${destLat},${destLng}&dirflg=d`,

    waze: `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`,

    uber: userCoords
      ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${userCoords.lat}&pickup[longitude]=${userCoords.lng}&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[formatted_address]=${encodedLocationText}`
      : `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[formatted_address]=${encodedLocationText}`,
  };

  const handleCopyLocation = () => {
    const textToCopy = `${locationName}${venueAddress ? ` - ${venueAddress}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Modal content structure
  const modalContent = isOpen && (
    <div 
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Navigate to Venue
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-55">
                {locationName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <LocateFixed className={`w-3.5 h-3.5 ${userCoords ? "text-emerald-400" : "text-amber-400 animate-pulse"}`} />
          <span>{userCoords ? "Using your precise live location as starting point" : "Acquiring your GPS location for accurate routing..."}</span>
        </div>

        <div className="space-y-2.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
            Turn-by-Turn Navigation
          </div>

          <a
            href={navigationLinks.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-white transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                  Google Maps
                </h4>
                <p className="text-[10px] text-slate-400">Opens route from your current location</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
          </a>

          <a
            href={navigationLinks.appleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-white transition-all group cursor-pointer ${
              isAppleDevice ? "ring-1 ring-orange-500/40" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    Apple Maps
                  </h4>
                  {isAppleDevice && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-[9px] font-mono text-orange-400">
                      iOS Default
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Native navigation on iPhone & Mac</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
          </a>

          <a
            href={navigationLinks.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-white transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs">
                W
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                  Waze
                </h4>
                <p className="text-[10px] text-slate-400">Live traffic & speed trap alerts</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
          </a>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-orange-400" /> Ride to Venue
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={navigationLinks.uber}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-white/40 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Open Uber</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            <button
              type="button"
              onClick={handleCopyLocation}
              className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {renderAsIconOnly ? (
        <button
          type="button"
          onClick={handleOpenNavigator}
          title="Get Directions"
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-orange-500/50 text-slate-400 hover:text-orange-400 transition-all cursor-pointer shadow-sm group"
        >
          <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform text-orange-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenNavigator}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 text-white text-xs font-bold transition-all shadow-md hover:shadow-orange-500/10 active:scale-95 cursor-pointer group"
        >
          <Navigation className="w-4 h-4 text-orange-500 group-hover:rotate-12 transition-transform" />
          <span>Get Directions</span>
        </button>
      )}

      {/* Render the modal at the document body level using React Portals to prevent any card overflow clipping or glitching */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}