import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "../../../auth"; 
import prisma from "../../../lib/prisma";
import {
  Users,
  ArrowLeft,
  ShieldPlus,
  Trash2,
  KeyRound,
  Mail,
  UserCheck,
  Smartphone,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import {
  addEventStaff,
  removeEventStaff,
} from "../../../actions/staff";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventStaffPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER")
    redirect("/login");

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { eventStaffs: true },
  });

  if (!event) notFound();
  if (event.organizerId !== session.user.id) redirect("/studio");

  // Dynamically get the exact host URL (Works for both Localhost & Production)
  const headersList = await headers();
  const host = headersList.get("host") || "bambatickets.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const fullAppUrl = `${protocol}://${host}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pb-24 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pb-4 sm:pb-6 border-b border-slate-800/80">
        <Link
          href={`/studio/events/${event.id}`}
          className="p-2.5 sm:p-3 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-800 hover:border-orange-500/50 transition-all group shrink-0 mt-1 sm:mt-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
        </Link>
        <div className="flex-1">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest block mb-1">
            Access Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight line-clamp-1">
            Gate Team
          </h1>
        </div>
      </div>

      {/* ADD STAFF FORM */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

        <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-5 sm:mb-6 relative z-10">
          <ShieldPlus className="w-5 h-5 text-orange-500" /> Deploy New
          Gatekeeper
        </h2>

        <form
          action={async (formData) => {
            "use server";
            // TODO: Trigger Resend email API inside this action
            await addEventStaff(formData);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 relative z-10"
        >
          <input type="hidden" name="eventId" value={event.id} />

          <div>
            <label className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Staff Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Officer John"
              className="w-full px-4 py-3 sm:py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none transition-colors shadow-inner"
            />
          </div>

          <div>
            <label className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="john@gate.com"
              className="w-full px-4 py-3 sm:py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-orange-500 outline-none transition-colors shadow-inner"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              Gate Access PIN (4-6 Digits)
            </label>
            {/* 🚀 FIXED: Added inputMode="numeric" & pattern to pop open the Mobile Number Pad! */}
            <input
              type="password"
              name="pinCode"
              required
              minLength={4}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••"
              className="w-full px-4 py-3 sm:py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-lg font-mono tracking-widest focus:border-orange-500 outline-none transition-colors shadow-inner placeholder:tracking-widest"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black tracking-widest uppercase rounded-xl text-[10px] transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95"
            >
              Authorize Credentials
            </button>
          </div>
        </form>
      </div>

      {/* STAFF LIST & MANUAL SHARE */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
        <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-5 sm:mb-6">
          <Users className="w-5 h-5 text-amber-500" /> Active Roster (
          {event.eventStaffs.length})
        </h2>

        {event.eventStaffs.length === 0 ? (
          /* 🚀 FIXED: Beautiful Premium Empty State */
          <div className="text-center py-12 px-4 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
            <ShieldPlus className="w-10 h-10 text-slate-600 mx-auto opacity-50 mb-3" />
            <p className="text-white font-bold text-sm">
              No Gate Staff Deployed
            </p>
            <p className="text-slate-500 text-[10px] mt-1 max-w-50 mx-auto">
              Authorize team members above to grant them scanner access.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {event.eventStaffs.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0">
                  {" "}
                  {/* min-w-0 prevents flex children from overflowing on tiny screens */}
                  <div className="font-bold text-white text-sm flex items-center gap-2 truncate">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />{" "}
                    {member.name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-3 mt-1.5 font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />{" "}
                      <span className="truncate">{member.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 shrink-0">
                      <KeyRound className="w-3 h-3" /> Encrypted
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-800 sm:border-none">
                  <form
                    action={async () => {
                      "use server";
                      await removeEventStaff(member.id, event.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 sm:p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center border border-red-500/20 text-xs sm:text-base font-bold gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden">Revoke Access</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECURE GATE LINK SHARE BOX */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Smartphone className="w-3.5 h-3.5 text-orange-500" /> Manual Portal
            Distribution
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 flex items-center gap-2 overflow-hidden shadow-inner">
              <LinkIcon className="w-4 h-4 text-slate-600 shrink-0" />
              {/* 🚀 FIXED: Ensure long URLs don't break the layout by strictly truncating */}
              <span className="truncate select-all cursor-text text-amber-500/80">
                {fullAppUrl}/scan/{event.id}
              </span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-3 leading-relaxed">
            Send this URL to your staff. They will need the PIN you created for
            them to unlock the scanner interface.
          </p>
        </div>
      </div>
    </div>
  );
}
