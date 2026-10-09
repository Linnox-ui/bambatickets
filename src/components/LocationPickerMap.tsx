"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2, Crosshair, Map } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerMapProps {
  locationName: string;
  setLocationName: (val: string) => void;
  venueAddress: string;
  setVenueAddress: (val: string) => void;
  latitude: number | null;
  setLatitude: (val: number | null) => void;
  longitude: number | null;
  setLongitude: (val: number | null) => void;
}

export default function LocationPickerMap({
  locationName,
  setLocationName,
  venueAddress,
  setVenueAddress,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Default to Nairobi Center
  const defaultLat = -1.2921;
  const defaultLng = 36.8219;

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) return;

      const initialLat = latitude || defaultLat;
      const initialLng = longitude || defaultLng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: latitude ? 16 : 12,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
          className: "map-tiles-dark",
        }
      ).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: grab;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(249, 115, 22, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 2.5px solid #020617; box-shadow: 0 0 12px rgba(249, 115, 22, 0.8);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
        map.panTo(position);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        map.panTo(e.latlng);
      });

      markerRef.current = marker;
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
  }, []);

  // Sync marker when coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const newLatLng = [latitude, longitude];
      markerRef.current.setLatLng(newLatLng);
      mapInstanceRef.current.flyTo(newLatLng, 16);
    }
  }, [latitude, longitude]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Live Autocomplete Search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=ke&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "BambaTickets/1.0 (contact@bambatickets.com)",
            },
          }
        );
        
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error("Geocoding Error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200); // 200ms debounce prevents API rate limiting

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setLatitude(lat);
    setLongitude(lon);
    
    // Format a clean address from the detailed OSM response
    const addressParts = [];
    if (result.address.road) addressParts.push(result.address.road);
    if (result.address.suburb || result.address.neighbourhood) addressParts.push(result.address.suburb || result.address.neighbourhood);
    if (result.address.city || result.address.town) addressParts.push(result.address.city || result.address.town);
    
    const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : result.display_name.split(",").slice(0, 3).join(", ");
    
    setVenueAddress(formattedAddress);
    
    // Auto-fill venue name if empty
    if (!locationName && (result.address.amenity || result.address.building)) {
      setLocationName(result.address.amenity || result.address.building);
    }
    
    setSearchQuery(result.name || formattedAddress);
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Getting precise GPS location...", { id: "geo" });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        toast.success("Exact location found!", { id: "geo" });
      },
      () => {
        toast.error("Unable to get GPS. Make sure location permissions are allowed.", { id: "geo" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // 🚀 Forces hardware GPS over IP routing
    );
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        .map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
      `}} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Venue Name
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
              placeholder="e.g. The Alchemist Bar"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Full Address / Street
          </label>
          <input
            type="text"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
            placeholder="e.g. Parklands Road, Nairobi"
          />
        </div>
      </div>

      {/* 🚀 Professional Live Autocomplete Combobox */}
      <div className="space-y-2 relative" ref={dropdownRef}>
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Search Map</span>

<Map className="w-3 h-3"/>
{latitude && <span className="text-emerald-400 flex items-center gap-1"> Pin Dropped</span>}
        </label>
        
        <div className="relative flex items-center w-full">
          <Search className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
            placeholder="Search for street, neighborhood, or drag the pin..."
            className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner relative z-0"
          />
          
          <div className="absolute right-2 flex items-center gap-1 z-10">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin mr-2" />
            ) : (
              <button
                type="button"
                onClick={handleLocateMe}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-orange-400 rounded-lg transition-colors"
                title="Use precise GPS location"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Dropdown Results */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-500 overflow-hidden divide-y divide-slate-700/50 animate-in fade-in slide-in-from-top-2">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(res)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-start gap-3 group"
              >
                <MapPin className="w-4 h-4 text-slate-500 group-hover:text-orange-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">
                    {res.name || res.display_name.split(",")[0]}
                  </span>
                  <span className="text-xs text-slate-400 truncate mt-0.5">
                    {res.display_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative w-full h-87.5 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-4 left-4 z-400 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          {latitude ? `${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Drag the pin to set exact location"}
        </div>
      </div>
    </div>
  );
}