"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteEvent } from "../actions/events";
import { toast } from "sonner";
import { Trash2, Loader2, Settings } from "lucide-react";

interface EventActionsProps {
  eventId: string;
}

export default function EventActions({ eventId }: EventActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEvent(eventId);

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success("Event deleted successfully.");
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* 1. EDIT BUTTON */}
      <Link
        href={`/studio/events/${eventId}/edit`}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Edit Event
      </Link>

      {/* 2. DELETE BUTTON */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        Delete Event
      </button>
    </div>
  );
}
