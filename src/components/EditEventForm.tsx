"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Loader2,
  Trash2,
  AlertTriangle,
  Plus,
  AlignLeft,
  Ticket,
  Wallet,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { updateEvent, deleteEvent } from "../actions/events";

interface EditEventFormProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
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

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(event.dateString);
  const [time, setTime] = useState(event.timeString);
  const [feeBearer, setFeeBearer] = useState<"ATTENDEE" | "ORGANIZER">(
    event.feeBearer,
  );

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
    formData.append("feeBearer", feeBearer);
    formData.append("tiers", JSON.stringify(tiers));

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
      <form onSubmit={handleUpdate} className="space-y-8">
        {/* BASIC DETAILS */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1 space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    required
                    disabled={isSubmitting || isDeleting}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="sm:col-span-1 space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Time
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="time"
                    required
                    disabled={isSubmitting || isDeleting}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner scheme-dark disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="sm:col-span-1 space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
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
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner disabled:opacity-50"
                  />
                </div>
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
                  disabled={isSubmitting || isDeleting}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TICKET TIERS SECTION */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> Ticket Tiers
            </h2>
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
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

          {/* EDIT FEE BEARER */}
          <div className="pt-4 mt-6 border-t border-slate-800/80">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Wallet className="w-3.5 h-3.5" /> Ticketing Fee Structure
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isSubmitting || isDeleting}
                onClick={() => setFeeBearer("ATTENDEE")}
                className={`p-4 rounded-xl border text-left transition-all disabled:opacity-50 ${
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
                disabled={isSubmitting || isDeleting}
                onClick={() => setFeeBearer("ORGANIZER")}
                className={`p-4 rounded-xl border text-left transition-all disabled:opacity-50 ${
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase flex items-center justify-center gap-2"
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

      {/* DANGER ZONE */}
      <div
        className={`border rounded-3xl p-6 sm:p-10 shadow-2xl ${event.hasSales ? "bg-slate-900/60 border-slate-800/80" : "bg-red-950/20 border-red-900/50"}`}
      >
        <h2
          className={`text-xl font-black flex items-center gap-2 mb-2 ${event.hasSales ? "text-slate-400" : "text-red-500"}`}
        >
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h2>

        {event.hasSales ? (
          <p className="text-amber-500/80 text-sm mb-6 max-w-2xl">
            <strong>Action Locked:</strong> You cannot delete this event because
            tickets have already been sold. Please cancel the event and issue
            refunds first to unlock deletion.
          </p>
        ) : (
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Deleting this event will permanently remove it and all associated
            ticket tiers from the database. This action cannot be undone.
          </p>
        )}

        <button
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting || event.hasSales}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all ${
            event.hasSales
              ? "bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed"
              : "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 shadow-inner"
          }`}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" /> Delete Event
            </>
          )}
        </button>
      </div>
    </div>
  );
}
