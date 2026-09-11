import GlobalFooter from "../../components/GlobalFooter";
import { Shield, FileText, ArrowLeft, Terminal } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden animate-fade-in-up">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />

      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-cyan-400 rounded-lg uppercase tracking-widest">
              Legal Compliance
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Legal Body Container */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="prose prose-invert prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-white prose-h2:text-lg sm:prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-800/80 prose-h2:pb-3 prose-h2:mt-8 prose-p:text-slate-300 prose-p:text-xs sm:prose-p:text-sm prose-li:text-xs sm:prose-li:text-sm prose-li:text-slate-300">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Bamba Tickets. By accessing or using our platform, you
              agree to be bound by these Terms and Conditions. Bamba Tickets
              provides a platform that allows Event Organizers to list events
              and sell tickets, and Customers to discover events and purchase
              tickets.
            </p>

            <h2>2. The Role of Bamba Tickets</h2>
            <p>
              Bamba Tickets is strictly a ticketing intermediary and technology
              provider. We do not create, organize, host, or manage the events
              listed on our platform. The Event Organizer is solely responsible
              for ensuring the event is executed as advertised. Bamba Tickets is
              not liable for any injury, loss, damage, or dissatisfaction
              related to an event.
            </p>

            <h2>3. Event Organizers' Responsibilities</h2>
            <p>If you register as an Organizer, you agree to:</p>
            <ul>
              <li>
                Provide accurate and truthful information regarding your event
                (date, time, venue, price).
              </li>
              <li>
                Honor all tickets sold through the Bamba Tickets platform.
              </li>
              <li>
                Independently manage and communicate any event cancellations or
                postponements.
              </li>
              <li>
                Assume full liability for the safety and legality of the event.
              </li>
            </ul>

            <h2>4. Ticket Purchases and Fees</h2>
            <ul>
              <li>All ticket sales are final.</li>
              <li>
                Bamba Tickets charges a non-refundable Platform Fee on
                transactions. This fee covers the cost of software processing
                and platform maintenance.
              </li>
            </ul>

            <h2>5. Refunds and Cancellations</h2>
            <ul>
              <li>
                <strong>Canceled Events:</strong> If an event is canceled by the
                Organizer, the Organizer is solely responsible for issuing
                refunds to Customers.
              </li>
              <li>
                <strong>Platform Fees:</strong> Bamba Tickets platform fees and
                payment processing fees are strictly non-refundable under all
                circumstances, even if an event is canceled.
              </li>
              <li>
                <strong>Disputes:</strong> Any dispute regarding ticket
                validity, event quality, or refunds must be resolved directly
                between the Customer and the Event Organizer.
              </li>
            </ul>

            <h2>6. Account Security</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their
              cryptographic passkeys and account credentials. Bamba Tickets will
              not be liable for any loss or damage arising from unauthorized
              access to your account.
            </p>

            <h2>7. Platform Abuse & Termination</h2>
            <p>
              Bamba Tickets reserves the right to suspend or terminate any node,
              account, or event listing that violates these terms, engages in
              fraudulent financial activity, or poses a security risk to the
              platform architecture.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with
              the laws of the Republic of Kenya.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
