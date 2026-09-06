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
} from "lucide-react";
import { toast } from "sonner";
import { createEvent } from "../../../../../actions/events"; // Using your exact file!

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event Details State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Ticket Tiers State (Start with one default tier)
  const [tiers, setTiers] = useState([
    { name: "Standard Pass", price: 1000, capacity: 100 },
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

    // Quick validation
    if (!title || !location || !date || !time) {
      toast.error("Please fill in all basic details.");
      setIsSubmitting(false);
      return;
    }

    const invalidTiers = tiers.some(
      (t) => !t.name || t.price < 0 || t.capacity <= 0,
    );
    if (invalidTiers) {
      toast.error(
        "Please ensure all ticket tiers have valid names, prices, and capacities.",
      );
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading(
      imageFile
        ? "Uploading image and creating event..."
        : "Creating your event...",
    );

    // 🚀 BUILD THE FORM DATA OBJECT YOUR BACKEND EXPECTS
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("time", time);

    // Serialize the tiers to JSON as expected by your backend
    formData.append("tiers", JSON.stringify(tiers));

    // Append the file if they uploaded one
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    // Pass FormData directly to your existing action
    const result = await createEvent(formData);

    toast.dismiss(loadingToast);

    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success(result.success || "Event created successfully!");
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Create New Event
        </h1>
        <p className="text-slate-400 mt-1">
          Set up your event details and configure ticket pricing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BASIC DETAILS */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <CalendarDays className="w-5 h-5 text-cyan-400" /> Event Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50"
                placeholder="e.g. Bamba Summer Festival"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  disabled={isSubmitting}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all scheme-dark disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  required
                  disabled={isSubmitting}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all scheme-dark disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50"
                    placeholder="e.g. KICC, Nairobi"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Description
              </label>
              <textarea
                required
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none disabled:opacity-50"
                placeholder="Tell attendees what to expect..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Event Banner (Max 10MB)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isSubmitting}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TICKET TIERS */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-fuchsia-400" /> Ticket Tiers
            </h2>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={addTier}
              className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              + Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group"
              >
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={tier.name}
                    onChange={(e) => updateTier(index, "name", e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all disabled:opacity-50"
                    placeholder="e.g. VIP"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
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
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                {tiers.length > 1 && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => removeTier(index)}
                    className="absolute -top-2 -right-2 sm:static sm:mt-5 p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 bg-linear-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
