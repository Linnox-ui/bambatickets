import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import CreatePollForm from "./CreatePollForm";

export default async function NewPollPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/polls/new");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 selection:bg-orange-500/30 selection:text-orange-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Launch a Campaign
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Configure your award categories, nominees, and visuals. Your campaign will go live immediately upon creation.
          </p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <CreatePollForm />
        </div>
      </div>
    </div>
  );
}