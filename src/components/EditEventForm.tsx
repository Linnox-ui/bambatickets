"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Loader2,
  Trash2,
  AlertTriangle,
  Plus,
  AlignLeft,
  Ticket,
  Wallet,
  Save,
  Tag,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { updateEvent, deleteEvent } from "@/actions/events";
import LocationPickerMap from "./LocationPickerMap";

const EVENT_CATEGORIES = [
  "Concerts",
  "Festivals",
  "Nightlife",
  "Campus",
  "Sports",
  "Voting & Polls",
];

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    category?: string;
    description: string;
    location: string;
    venueAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    dateString: string;
    timeString: string;
    imageUrl: string | null;
    feeBearer: "ATTENDEE" | "ORGANIZER";
    tiers: { id?: string; name: string; price: number; capacity: number }[];
    hasSales: boolean;
  };
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Basic Details
  const [title, setTitle] = useState(event.title);
  const [category, setCategory] = useState(event.category || "Concerts");
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.dateString);
  const [time, setTime] = useState(event.timeString);
  const [feeBearer, setFeeBearer] = useState<"ATTENDEE" | "ORGANIZER">(
    event.feeBearer,
  );
  const [imageFile, setImageFile] = useState<File | null>(null); // 👈 Image state

  // Map Location Details
  const [locationName, setLocationName] = useState(event.location);
  const [venueAddress, setVenueAddress] = useState(event.venueAddress || "");
  const [latitude, setLatitude] = useState<number | null>(event.latitude);
  const [longitude, setLongitude] = useState<number | null>(event.longitude);

  const [tiers, setTiers] = useState(event.tiers);

  const addTier = () =>
    setTiers([...tiers, { name: "", price: 0, capacity: 50 }]);

  const removeTier = (index: number) => {
    if (tiers.length === 1)
      return toast.error("You must have at least one ticket tier.");
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: string | number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !category || !locationName || !date || !time) {
      toast.error("Please fill in all basic details.");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Updating event...");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("feeBearer", feeBearer);
    formData.append("tiers", JSON.stringify(tiers));

    // Append map fields
    formData.append("location", locationName);
    if (venueAddress) formData.append("venueAddress", venueAddress);
    if (latitude !== null) formData.append("latitude", latitude.toString());
    if (longitude !== null) formData.append("longitude", longitude.toString());

    // Append image file if a new one was selected
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const result = await updateEvent(event.id, formData);

    toast.dismiss(toastId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || "Event updated!");
      router.refresh();
    }
    setIsSubmitting(false);
  }

  async function handleDelete() {
    if (event.hasSales) {
      toast.error("Cannot delete. Tickets have already been sold.");
      return;
    }

    if (!confirm("Are you ABSOLUTELY sure you want to delete this event?")) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting event...");

    const result = await deleteEvent(event.id);
    toast.dismiss(toastId);

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success("Event deleted.");
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <CalendarDays className="w-5 h-5 text-orange-500" /> Basic Details
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Event Title
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting || isDeleting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-lg font-bold rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-all shadow-inner disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Event Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    disabled={isSubmitting || isDeleting}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-semibold rounded-xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Date
                </label>
                <input
                  type="date"
                  required
                  disabled={isSubmitting || isDeleting}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Time
                </label>
                <input
                  type="time"
                  required
                  disabled={isSubmitting || isDeleting}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                required
                disabled={isSubmitting || isDeleting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner resize-none disabled:opacity-50"
              />
            </div>

            {/* 🚀 BANNER IMAGE UPLOAD & PREVIEW */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Event Banner Image
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {event.imageUrl && (
                  <div className="w-24 h-16 rounded-xl overflow-hidden border border-slate-800 shrink-0 relative bg-slate-950">
                    <img
                      src={event.imageUrl}
                      alt="Current banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    disabled={isSubmitting || isDeleting}
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 focus:outline-none disabled:opacity-50 transition-all cursor-pointer shadow-inner text-xs"
                  />
                </div>
              </div>
            </div>

            {/* LOCATION PICKER MAP */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Event Location</h3>
              <LocationPickerMap 
                locationName={locationName}
                setLocationName={setLocationName}
                venueAddress={venueAddress}
                setVenueAddress={setVenueAddress}
                latitude={latitude}
                setLatitude={setLatitude}
                longitude={longitude}
                setLongitude={setLongitude}
              />
            </div>
          </div>
        </div>

        {/* TICKET TIERS & SUBMIT BUTTON */}
        <div className="bg-slate-900/65 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> Ticket Tiers
            </h2>
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={addTier}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-950 border border-slate-800 rounded-2xl relative"
              >
                <div className="flex-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tier.name}
                    onChange={(e) => updateTier(index, "name", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={tier.price}
                    onChange={(e) => updateTier(index, "price", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tier.capacity}
                    onChange={(e) => updateTier(index, "capacity", parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-orange-500"
                  />
                </div>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="absolute -top-3 -right-3 sm:static sm:mt-6 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-orange-500 to-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}