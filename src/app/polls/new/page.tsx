import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import CreatePollForm from "./CreatePollForm";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

export default async function NewPollPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/polls/new");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 selection:bg-orange-500/30 selection:text-orange-50 relative overflow-hidden">
      
      {/* --- INJECTED ANIMATIONS (Guarantees they work perfectly) --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `,
        }}
      />

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* --- NAVIGATION --- */}
        <div className="animate-fade-in-up">
          <Link
            href="/polls/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-orange-500/50 transition-all text-xs font-bold text-slate-400 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* --- PAGE HEADER --- */}
        <div className="mb-10 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 text-orange-500 rounded-2xl mb-5 shadow-inner border border-orange-500/20">
            <Rocket className="w-8 h-8" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-400 drop-shadow-sm">
            Launch a Campaign
          </h1>
          
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed font-medium">
            Configure your award categories, nominees, and visuals. Your campaign will go live immediately upon creation.
          </p>
        </div>
        
        {/* --- FORM CONTAINER --- */}
        <div 
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-4xl p-6 sm:p-10 shadow-2xl animate-fade-in-up relative group" 
          style={{ animationDelay: '0.2s' }}
        >
          {/* Subtle top glow indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 group-hover:via-orange-500/50 transition-all duration-700 rounded-t-4xl" />
          
          {/* Client Form Component */}
          <CreatePollForm />
          
        </div>
      </div>
    </div>
  );
}