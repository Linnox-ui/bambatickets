import { auth, signOut } from "../auth";
import { redirect } from "next/navigation";
import { Ticket, LogOut, PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  // 1. Fetch the session securely on the server
  const session = await auth();

  // 2. Protect the route: If no user is logged in, kick them back to login
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-fuchsia-500" />
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              BambaTickets
            </span>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-slate-300 font-medium">
              Welcome, <span className="text-white">{session.user.name}</span>
            </p>

            {/* Server-Side Sign Out Form */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Overview</h1>
            <p className="text-slate-400 mt-1">
              Manage your upcoming events and ticket sales.
            </p>
          </div>

          <button className="bg-white hover:bg-slate-200 text-black font-semibold py-2.5 px-5 rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {/* Empty State Card */}
        <div className="w-full bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No events yet
          </h3>
          <p className="text-slate-400 max-w-sm mb-6">
            You haven't created any events yet. Get started by creating your
            first event to sell tickets.
          </p>
        </div>
      </main>
    </div>
  );
}
