"use client";

import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import {
  Shield,
  FileText,
  ArrowLeft,
  Terminal,
  Building2,
  CalendarCheck,
  Ticket,
  CreditCard,
  Lock,
  AlertOctagon,
  Scale,
} from "lucide-react";

const termsData = [
  {
    id: "1",
    title: "Introduction",
    icon: <FileText className="w-5 h-5 text-orange-400" />,
    content: (
      <p>
        Welcome to Bamba Tickets. By accessing or using our platform, you agree
        to be bound by these Terms and Conditions. Bamba Tickets provides a
        platform that allows Event Organizers to list events and sell tickets,
        and Customers to discover events and purchase tickets.
      </p>
    ),
  },
  {
    id: "2",
    title: "The Role of Bamba Tickets",
    icon: <Building2 className="w-5 h-5 text-amber-400" />,
    content: (
      <p>
        Bamba Tickets is strictly a ticketing intermediary and technology
        provider. We do not create, organize, host, or manage the events listed
        on our platform. The Event Organizer is solely responsible for ensuring
        the event is executed as advertised. Bamba Tickets is not liable for any
        injury, loss, damage, or dissatisfaction related to an event.
      </p>
    ),
  },
  {
    id: "3",
    title: "Event Organizers' Responsibilities",
    icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
    content: (
      <div className="space-y-3">
        <p>If you register as an Organizer, you agree to:</p>
        <ul className="space-y-2 ml-1">
          {[
            "Provide accurate and truthful information regarding your event (date, time, venue, price).",
            "Honor all tickets sold through the Bamba Tickets platform.",
            "Independently manage and communicate any event cancellations or postponements.",
            "Assume full liability for the safety and legality of the event.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "4",
    title: "Ticket Purchases and Fees",
    icon: <Ticket className="w-5 h-5 text-fuchsia-400" />,
    content: (
      <ul className="space-y-2 ml-1">
        <li className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 mt-2 shrink-0" />
          <span>All ticket sales are final.</span>
        </li>
        <li className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 mt-2 shrink-0" />
          <span>
            <strong className="text-slate-200 font-semibold">
              Bamba Tickets
            </strong>{" "}
            charges a non-refundable Platform Fee on transactions. This fee
            covers the cost of software processing and platform maintenance.
          </span>
        </li>
      </ul>
    ),
  },
  {
    id: "5",
    title: "Refunds and Cancellations",
    icon: <CreditCard className="w-5 h-5 text-rose-400" />,
    content: (
      <ul className="space-y-4 ml-1">
        <li className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
          <div>
            <strong className="text-slate-200 font-semibold block mb-1">
              Canceled Events
            </strong>
            If an event is canceled by the Organizer, the Organizer is solely
            responsible for issuing refunds to Customers.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
          <div>
            <strong className="text-slate-200 font-semibold block mb-1">
              Platform Fees
            </strong>
            Bamba Tickets platform fees and payment processing fees are strictly
            non-refundable under all circumstances, even if an event is
            canceled.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
          <div>
            <strong className="text-slate-200 font-semibold block mb-1">
              Disputes
            </strong>
            Any dispute regarding ticket validity, event quality, or refunds
            must be resolved directly between the Customer and the Event
            Organizer.
          </div>
        </li>
      </ul>
    ),
  },
  {
    id: "6",
    title: "Account Security",
    icon: <Lock className="w-5 h-5 text-blue-400" />,
    content: (
      <p>
        Users are responsible for maintaining the confidentiality of their
        passwords and account credentials. Bamba Tickets will not be liable for
        any loss or damage arising from unauthorized access to your account.
      </p>
    ),
  },
  {
    id: "7",
    title: "Platform Abuse & Termination",
    icon: <AlertOctagon className="w-5 h-5 text-red-500" />,
    content: (
      <p>
        Bamba Tickets reserves the right to suspend or terminate any account or
        event listing that violates these terms, engages in fraudulent financial
        activity, or poses a security risk to the platform architecture.
      </p>
    ),
  },
  {
    id: "8",
    title: "Governing Law",
    icon: <Scale className="w-5 h-5 text-slate-400" />,
    content: (
      <p>
        These terms shall be governed by and construed in accordance with the
        laws of the Republic of Kenya.
      </p>
    ),
  },
];

export default function TermsPage() {
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

      {/* Background Grid Pattern - Fixed Tailwind warnings here */}
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

        {/* Header Card - Fixed rounded-4xl Tailwind warning here */}
        <div
          className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-4xl p-8 sm:p-12 shadow-2xl mb-12 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-orange-400 rounded-lg uppercase tracking-widest shadow-inner">
                Legal Compliance
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-500/70" />
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
          {termsData.map((section, index) => (
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
