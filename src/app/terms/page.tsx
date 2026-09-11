import GlobalFooter from "../../components/GlobalFooter";
import { Shield, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-20 relative z-10">
        <div className="mb-12 border-b border-slate-800 pb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-white prose-p:text-slate-300 prose-p:text-sm prose-li:text-sm prose-li:text-slate-300">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Bamba Tickets. By accessing or using our platform, you
            agree to be bound by these Terms and Conditions. Bamba Tickets
            provides a platform that allows Event Organizers to list events and
            sell tickets, and Customers to discover events and purchase tickets.
          </p>

          <h2>2. The Role of Bamba Tickets</h2>
          <p>
            Bamba Tickets is strictly a ticketing intermediary and technology
            provider. We do not create, organize, host, or manage the events
            listed on our platform. The Event Organizer is solely responsible
            for ensuring the event is executed as advertised. Bamba Tickets is
            not liable for any injury, loss, damage, or dissatisfaction related
            to an event.
          </p>

          <h2>3. Event Organizers' Responsibilities</h2>
          <p>If you register as an Organizer, you agree to:</p>
          <ul>
            <li>
              Provide accurate and truthful information regarding your event
              (date, time, venue, price).
            </li>
            <li>Honor all tickets sold through the Bamba Tickets platform.</li>
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
              transactions. This fee covers the cost of software processing and
              platform maintenance.
            </li>
          </ul>

          <h2>5. Refunds and Cancellations</h2>
          <ul>
            <li>
              <strong>Canceled Events:</strong> If an event is canceled by the
              Organizer, the Organizer is solely responsible for issuing refunds
              to Customers.
            </li>
            <li>
              <strong>Platform Fees:</strong> Bamba Tickets platform fees and
              payment processing fees are strictly non-refundable under all
              circumstances, even if an event is canceled.
            </li>
            <li>
              <strong>Disputes:</strong> Any dispute regarding ticket validity,
              event quality, or refunds must be resolved directly between the
              Customer and the Event Organizer.
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
      </main>
    </div>
  );
}
