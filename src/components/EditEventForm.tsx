"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateEvent } from "../actions/events";

interface EditEventFormProps {
  eventId: string;
  initialData: {
    title: string;
    description: string;
    location: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
  };
}

export default function EditEventForm({
  eventId,
  initialData,
}: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateEvent(eventId, formData);

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      router.push(`/studio/events/${eventId}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TITLE */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-xs font-bold text-slate-300 uppercase tracking-wider"
        >
          Event Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          defaultValue={initialData.title}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-sm font-medium"
          placeholder="e.g., Nairobi Tech Summit 2026"
        />
      </div>

      {/* TWO COLUMN: DATE & TIME */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="date"
            className="text-xs font-bold text-slate-300 uppercase tracking-wider"
          >
            Event Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={initialData.date}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="time"
            className="text-xs font-bold text-slate-300 uppercase tracking-wider"
          >
            Start Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            required
            defaultValue={initialData.time}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* LOCATION */}
      <div className="space-y-2">
        <label
          htmlFor="location"
          className="text-xs font-bold text-slate-300 uppercase tracking-wider"
        >
          Venue / Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          defaultValue={initialData.location}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-sm"
          placeholder="e.g., KICC, Nairobi"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-xs font-bold text-slate-300 uppercase tracking-wider"
        >
          Event Details
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={initialData.description}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm resize-none"
          placeholder="Tell your attendees what to expect..."
        />
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-slate-800/60">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Event
            </>
          )}
        </button>
      </div>
    </form>
  );
}
