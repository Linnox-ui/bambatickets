"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  Sparkles,
  AlignLeft,
  Wallet,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "../../../../../actions/events";

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fee Logic
  const [feeBearer, setFeeBearer] = useState<"ATTENDEE" | "ORGANIZER">(
    "ATTENDEE",
  );

  // Dynamic Tiers
  const [tiers, setTiers] = useState([
    { name: "Regular", price: 1000, capacity: 100 },
  ]);

  const addTier = () => {
    setTiers([...tiers, { name: "", price: 0, capacity: 50 }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length === 1) {
      toast.error("You must have at least one ticket tier.");
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: string | number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !location || !date || !time) {
      toast.error("Please fill in all basic event details.");
      setIsSubmitting(false);
      return;
    }

    const invalidTiers = tiers.some(
      (t) => !t.name || t.price < 0 || t.capacity <= 0,
    );
    if (invalidTiers) {
      toast.error(
        "Ensure all ticket tiers have valid names, prices, and capacities.",
      );
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading(
      imageFile
        ? "Uploading banner and publishing..."
        : "Publishing your event...",
    );

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("feeBearer", feeBearer);
    formData.append("tiers", JSON.stringify(tiers));

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const result = await createEvent(formData);

    toast.dismiss(loadingToast);

    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success(result.success || "Event published!");
      router.push("/studio"); // Redirects back to overview to see the new event
      router.refresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `,
        }}
      />

      <div className="pb-6 border-b border-slate-800/80">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-orange-500" />
          Create New Event
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
          Set up your event details and configure ticket pricing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* EVENT DETAILS MODULE */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

          <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <CalendarDays className="w-5 h-5 text-orange-500" /> Essential
            Details
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Event Title
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-lg font-bold rounded-xl px-5 py-4 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600 disabled:opacity-50"
                placeholder="e.g. Blankets & Wine Nairobi"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Time
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="time"
                    required
                    disabled={isSubmitting}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600 disabled:opacity-50"
                  placeholder="e.g. Carnivore Grounds, Langata"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Description
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea
                  required
                  disabled={isSubmitting}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600 resize-none disabled:opacity-50"
                  placeholder="Tell attendees what to expect..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Event Banner Image (Max 10MB)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isSubmitting}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 focus:outline-none disabled:opacity-50 transition-all cursor-pointer shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TICKET TIERS MODULE */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> Ticket Tiers
            </h2>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={addTier}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-950 border border-slate-800 rounded-2xl relative group focus-within:border-orange-500/50 transition-all"
              >
                <div className="flex-1">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={tier.name}
                    onChange={(e) => updateTier(index, "name", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-orange-500 outline-none transition-all disabled:opacity-50 text-sm"
                    placeholder="e.g. VIP"
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
                    disabled={isSubmitting}
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-orange-500 outline-none transition-all disabled:opacity-50 text-sm"
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
                    disabled={isSubmitting}
                    value={tier.capacity}
                    onChange={(e) =>
                      updateTier(
                        index,
                        "capacity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-orange-500 outline-none transition-all disabled:opacity-50 text-sm"
                  />
                </div>

                {tiers.length > 1 && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => removeTier(index)}
                    className="absolute -top-3 -right-3 sm:static sm:mt-6 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800/80">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Wallet className="w-3.5 h-3.5" /> Ticketing Fee Structure
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFeeBearer("ATTENDEE")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  feeBearer === "ATTENDEE"
                    ? "bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <p
                  className={`font-bold text-sm ${feeBearer === "ATTENDEE" ? "text-orange-400" : "text-white"}`}
                >
                  Pass fee to buyer
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Attendees pay the platform fee on top of ticket price.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFeeBearer("ORGANIZER")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  feeBearer === "ORGANIZER"
                    ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <p
                  className={`font-bold text-sm ${feeBearer === "ORGANIZER" ? "text-emerald-400" : "text-white"}`}
                >
                  Absorb the fee
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  The platform fee is deducted from your final payout.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                Publish Event <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
