import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma";
import {
  Users,
  ArrowLeft,
  ShieldPlus,
  Trash2,
  KeyRound,
  Mail,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import {
  addEventStaff,
  removeEventStaff,
} from "../../../../../../actions/staff";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventStaffPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  // 🚀 FIXED: Using 'eventStaffs' matching your schema relation name
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { eventStaffs: true },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href={`/studio/events/${event.id}`}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
            Gate Team Management
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* ADD STAFF FORM */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <ShieldPlus className="w-5 h-5 text-fuchsia-400" /> Deploy New
          Gatekeeper
        </h2>

        <form
          action={async (formData) => {
            "use server";
            await addEventStaff(formData);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input type="hidden" name="eventId" value={event.id} />

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Staff Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Officer John"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-fuchsia-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="john@gate.com"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-fuchsia-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Gate Access PIN (Min 4 Digits)
            </label>
            <input
              type="password"
              name="pinCode"
              required
              placeholder="••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono tracking-widest focus:border-fuchsia-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
            >
              Authorize Gatekeeper
            </button>
          </div>
        </form>
      </div>

      {/* STAFF LIST */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <Users className="w-5 h-5 text-cyan-400" /> Authorized Gate Team (
          {event.eventStaffs.length})
        </h2>

        {event.eventStaffs.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">
            No gate staff deployed yet. Add a team member above.
          </p>
        ) : (
          <div className="space-y-3">
            {event.eventStaffs.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl"
              >
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />{" "}
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" /> {member.email}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <KeyRound className="w-3 h-3" /> PIN: ••••
                    </span>
                  </div>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await removeEventStaff(member.id, event.id);
                  }}
                >
                  <button
                    type="submit"
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* SECURE GATE LINK SHARE BOX */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2 font-mono">
            🔗 Share this secure scanner portal URL with your team:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-400 select-all truncate">
            {typeof window === "undefined" ? "" : window.location.origin}/scan/
            {event.id}
          </div>
        </div>
      </div>
    </div>
  );
}
