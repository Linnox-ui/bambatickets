"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { updateEvent, deleteEvent } from "../../../../../actions/events";

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    dateString: string;
    timeString: string;
    imageUrl: string | null;
    tiers: { id?: string; name: string; price: number; capacity: number }[];
    hasSales: boolean;
  };
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(event.dateString);
  const [time, setTime] = useState(event.timeString);

  // Load initial tiers from database
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

    if (!title || !location || !date || !time) {
      toast.error("Please fill in all basic details.");
      setIsSubmitting(false);
      return;
    }

    const invalidTiers = tiers.some(
      (t) => !t.name || t.price < 0 || t.capacity <= 0,
    );
    if (invalidTiers) {
      toast.error("Please ensure all ticket tiers are valid.");
      setIsSubmitting(false);
      return;
    }

    const toastId = toast.loading("Updating event...");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("tiers", JSON.stringify(tiers)); // Send tiers to backend

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

    if (
      !confirm(
        "Are you ABSOLUTELY sure? This will delete the event permanently!",
      )
    )
      return;

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
      {/* UPDATE FORM */}
      <form
        onSubmit={handleUpdate}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8"
      >
        {/* BASIC DETAILS */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <CalendarDays className="w-5 h-5 text-cyan-400" /> Basic Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting || isDeleting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 outline-none transition-all"
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
                  disabled={isSubmitting || isDeleting}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 scheme-dark outline-none"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  required
                  disabled={isSubmitting || isDeleting}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 scheme-dark outline-none"
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
                    disabled={isSubmitting || isDeleting}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 outline-none"
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
                disabled={isSubmitting || isDeleting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:border-cyan-500 resize-none outline-none"
              />
            </div>
          </div>
        </div>

        {/* TICKET TIERS SECTION */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-fuchsia-400" /> Ticket Tiers
            </h2>
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={addTier}
              className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 px-3 py-1.5 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all"
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
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all"
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
                    className="w-full px-3 py-2 bg-transparent border-b border-slate-700 text-white focus:border-fuchsia-500 outline-none transition-all"
                  />
                </div>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => removeTier(index)}
                    className="absolute -top-2 -right-2 sm:static sm:mt-5 p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* DANGER ZONE */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 ${event.hasSales ? "bg-slate-900/40 border-slate-800" : "bg-rose-950/20 border-rose-900/50"}`}
      >
        <h2
          className={`text-xl font-bold flex items-center gap-2 mb-2 ${event.hasSales ? "text-slate-400" : "text-rose-500"}`}
        >
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h2>

        {event.hasSales ? (
          <p className="text-amber-500/80 text-sm mb-6">
            <strong>Action Locked:</strong> You cannot delete this event because
            tickets have already been sold. Please contact support or cancel the
            event and issue refunds first.
          </p>
        ) : (
          <p className="text-slate-400 text-sm mb-6">
            Deleting this event will permanently remove it and all associated
            ticket tiers. This action cannot be undone.
          </p>
        )}

        <button
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting || event.hasSales}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all ${
            event.hasSales
              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
              : "bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/50 hover:border-rose-600"
          }`}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" /> Delete Event
            </>
          )}
        </button>
      </div>
    </div>
  );
}
