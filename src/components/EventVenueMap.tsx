"use client";

import { useEffect, useRef } from "react";
import VenueNavigator from "./VenueNavigator";
import { MapPin } from "lucide-react";

interface EventVenueMapProps {
  locationName: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export default function EventVenueMap({
  locationName,
  venueAddress,
  latitude,
  longitude,
}: EventVenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Default to Nairobi centroid if no coordinates provided
  const lat = latitude || -1.2921;
  const lng = longitude || 36.8219;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      // Safely import leaflet client-side only
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Cleanup existing instance if re-rendering
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: latitude ? 15 : 12, // Zoom out a bit if it's just the default Nairobi location
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Tiles with CSS Dark Mode Inversion
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
          className: "map-tiles-dark",
        }
      ).addTo(map);

      // Custom BambaTickets Orange Pulse Icon
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(249, 115, 22, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 2.5px solid #020617; box-shadow: 0 0 12px rgba(249, 115, 22, 0.8);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="background: #020617; color: #fff; padding: 6px; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #f97316;">${locationName}</strong>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${venueAddress || "Nairobi, Kenya"}</div>
          </div>
        `);

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, locationName, venueAddress, latitude]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
      
      {/* 🚀 CSS inversion for public dark map */}
      <style dangerouslySetInnerHTML={{ __html: `
        .map-tiles-dark {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">{locationName}</h3>
            <p className="text-xs text-slate-400">{venueAddress || "Nairobi, Kenya"}</p>
          </div>
        </div>

        {/* Use the Navigator we created */}
        <div className="shrink-0">
          <VenueNavigator
            locationName={locationName}
            venueAddress={venueAddress}
            latitude={lat}
            longitude={lng}
          />
        </div>
      </div>

      {/* Embedded Map Canvas */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>
    </div>
  );
}