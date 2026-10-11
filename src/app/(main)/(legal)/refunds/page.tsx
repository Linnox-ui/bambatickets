"use client";

import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import {
  ArrowLeft,
  Terminal,
  RefreshCcw,
  CalendarX,
  Banknote,
  Clock,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

const refundData = [
  {
    id: "1",
    title: "General Refund Policy",
    icon: <RefreshCcw className="w-5 h-5 text-cyan-400" />,
    content: (
      <p>
        Bamba Tickets serves as a technology platform connecting event
        organizers with attendees. Because the funds from ticket sales are
        managed by the Event Organizer,{" "}
        <strong>
          all ticket sales are generally considered final and non-refundable
        </strong>
        , except in specific circumstances outlined below.
      </p>
    ),
  },
  {
    id: "2",
    title: "Canceled or Postponed Events",
    icon: <CalendarX className="w-5 h-5 text-orange-400" />,
    content: (
      <div className="space-y-3">
        <p>You are eligible for a refund of the ticket's face value if:</p>
        <ul className="space-y-2 ml-1">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 shrink-0" />
            <span>The organizer completely cancels the event.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 shrink-0" />
            <span>
              The event is postponed or rescheduled, and you cannot attend the
              new date.
            </span>
          </li>
        </ul>
        <p className="text-sm text-slate-400 mt-2">
          <em>
            Example: If you purchased a ticket for Ochieng's Tech Summit and the
            event is canceled, you will receive a refund for the ticket price.
          </em>
        </p>
      </div>
    ),
  },
  {
    id: "3",
    title: "Non-Refundable Platform Fees",
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    content: (
      <p>
        Please note that the Bamba Tickets{" "}
        <strong>
          Platform Fee and Payment Gateway Processing Fees are strictly
          non-refundable
        </strong>{" "}
        under all circumstances. These fees cover the cost of securely
        processing your M-PESA or card transaction and maintaining the platform
        architecture, which occurs at the moment of purchase.
      </p>
    ),
  },
  {
    id: "4",
    title: "How to Request a Refund",
    icon: <HelpCircle className="w-5 h-5 text-fuchsia-400" />,
    content: (
      <p>
        While we are currently upgrading our automated refund module, all refund
        requests must be processed manually. To request a refund for a canceled
        or eligible event, please contact the Event Organizer directly, or email
        our support team at <strong>support@bambatickets.com</strong> with your
        Ticket Reference ID and the email/phone number (e.g., +254 7XX XXX XXX)
        used for the purchase.
      </p>
    ),
  },
  {
    id: "5",
    title: "Processing Timelines",
    icon: <Clock className="w-5 h-5 text-emerald-400" />,
    content: (
      <div className="space-y-3">
        <p>
          Once a refund is approved by the Organizer, please allow time for the
          funds to reflect in your account:
        </p>
        <ul className="space-y-2 ml-1">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-2 shrink-0" />
            <span>
              <strong>M-PESA:</strong> Usually processed within 1 to 3 business
              days.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-2 shrink-0" />
            <span>
              <strong>Debit/Credit Cards:</strong> May take 3 to 7 business days
              depending on your bank's processing times.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
];

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden text-slate-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `,
        }}
      />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Navigation */}
        <div
          className="mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-slate-900/50 border border-slate-800 hover:border-slate-700 px-5 py-3 rounded-full hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
        </div>

        {/* Header Card */}
        <div
          className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-4xl p-8 sm:p-12 shadow-2xl mb-12 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-inner">
                <Banknote className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-cyan-400 rounded-lg uppercase tracking-widest shadow-inner">
                Customer Support
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Refund Guidelines
            </h1>
            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-500/70" />
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {refundData.map((section, index) => (
            <div
              key={section.id}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 sm:p-8 transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                    {section.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4 flex items-center gap-3">
                    <span className="text-slate-600 font-mono text-sm">
                      {section.id}.
                    </span>
                    {section.title}
                  </h2>
                  <div className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="relative z-10 border-t border-slate-900 bg-slate-950 mt-12">
        <GlobalFooter />
      </div>
    </div>
  );
}
