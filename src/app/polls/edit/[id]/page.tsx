import { redirect, notFound } from "next/navigation";
import { auth } from "@/src/auth";
import { votingPrisma } from "@/src/lib/voting-db";
import EditPollForm from "./EditPollForm";

export default async function EditPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/polls/dashboard");
  }

  const resolvedParams = await params;
  
  const campaign = await votingPrisma.campaign.findUnique({
    where: { id: resolvedParams.id },
    include: {
      candidates: {
        orderBy: { name: "asc" }, // ✨ FIXED: Sorting by 'name' instead of 'created_at'
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // SECURITY: Only the host can edit their campaign
  if (campaign.host_id !== session.user.id) {
    redirect("/polls/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 selection:bg-orange-500/30 selection:text-orange-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center animate-fade-in-up">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Edit Campaign
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Update your award categories, add new nominees, or adjust names. Changes apply immediately.
          </p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <EditPollForm initialCampaign={campaign} />
        </div>
      </div>
    </div>
  );
}