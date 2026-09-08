import prisma from "../lib/prisma";
import EventBrowser from "../components/EventBrowser";

export default async function PublicHomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      ticketTiers: true,
      organizer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 font-sans relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes shockwave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
        }
        .animate-shockwave {
          animation: shockwave 2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          background: linear-gradient(120deg, #f97316 20%, #ffedd5 40%, #ffedd5 60%, #f97316 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3s linear infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #f97316; }
        }
        .animate-typing {
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.15em solid #f97316;
          animation: typing 1.5s steps(30, end), blink-caret 0.75s step-end infinite;
        }
      `,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <EventBrowser initialEvents={events} />
    </div>
  );
}
