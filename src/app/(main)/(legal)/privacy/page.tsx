"use client";

import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import {
  ShieldCheck,
  ArrowLeft,
  Terminal,
  Database,
  Eye,
  Share2,
  Lock,
  UserCog,
  Cookie,
} from "lucide-react";

const privacyData = [
  {
    id: "1",
    title: "Information We Collect",
    icon: <Database className="w-5 h-5 text-fuchsia-400" />,
    content: (
      <div className="space-y-3">
        <p>
          When you use Bamba Tickets to buy a ticket or vote in a campaign, we
          collect necessary personal information to process your request. This
          includes:
        </p>
        <ul className="space-y-2 ml-1">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 mt-2 shrink-0" />
            <span>
              <strong>Identity Data:</strong> Your full name (e.g., Amina Njeri)
              and email address (e.g., amina@example.co.ke).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500/50 mt-2 shrink-0" />
            <span>
              <strong>Transaction Data:</strong> Phone numbers used for M-PESA
              payments or masking details from card transactions.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "2",
    title: "How We Use Your Data",
    icon: <Eye className="w-5 h-5 text-cyan-400" />,
    content: (
      <p>
        We strictly use your data to provide our services. This includes
        processing your payments, generating and emailing your secure ticket QR
        codes, preventing fraudulent transactions, and providing customer
        support if you need assistance with an event.
      </p>
    ),
  },
  {
    id: "3",
    title: "Data Sharing & Third Parties",
    icon: <Share2 className="w-5 h-5 text-orange-400" />,
    content: (
      <div className="space-y-3">
        <p>
          We do not sell your personal data to advertisers. We only share your
          data with trusted partners required to make the platform work:
        </p>
        <ul className="space-y-2 ml-1">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 shrink-0" />
            <span>
              <strong>Payment Processors:</strong> We share transaction data
              with Paystack to securely process M-PESA and card payments.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-2 shrink-0" />
            <span>
              <strong>Event Organizers:</strong> Organizers receive your name
              and email to manage their guest lists and scan your ticket at the
              venue.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "4",
    title: "Data Security",
    icon: <Lock className="w-5 h-5 text-emerald-400" />,
    content: (
      <p>
        We implement strict, industry-standard security measures to protect your
        data. All data transferred between your browser and our servers is
        encrypted. We do not store your raw credit card details or M-PESA PINs
        on our servers.
      </p>
    ),
  },
  {
    id: "5",
    title: "Your Privacy Rights",
    icon: <UserCog className="w-5 h-5 text-amber-400" />,
    content: (
      <p>
        In compliance with the <strong>Kenya Data Protection Act (2019)</strong>
        , you have the right to access, correct, update, or request the deletion
        of your personal data on our platform. If you wish to exercise these
        rights, please contact our support team.
      </p>
    ),
  },
  {
    id: "6",
    title: "Cookies & Tracking",
    icon: <Cookie className="w-5 h-5 text-rose-400" />,
    content: (
      <p>
        Bamba Tickets uses strictly necessary cookies to keep you logged into
        your account securely and to manage active checkout sessions. We also
        use basic analytics to understand how our platform is used so we can
        improve the experience.
      </p>
    ),
  },
];

export default function PrivacyPage() {
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-500 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-fuchsia-400 rounded-lg uppercase tracking-widest shadow-inner">
                Data Protection
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-fuchsia-500/70" />
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
          {privacyData.map((section, index) => (
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
