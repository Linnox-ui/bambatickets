"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Ticket,
  Calendar,
  CreditCard,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

// --- FAQ DATA ---
const faqs = [
  {
    category: "Buying Tickets",
    icon: <Ticket className="w-5 h-5 text-fuchsia-400" />,
    questions: [
      {
        q: "How do I receive my tickets after purchase?",
        a: "Once your payment is successful, your tickets will be sent instantly to the email address you provided. You can also download them directly from the checkout success page.",
      },
      {
        q: "Can I buy tickets for my friends?",
        a: "Yes! You can purchase multiple tickets in one order (up to 20). Just make sure to share the ticket QR codes with your friends so they can scan in at the venue.",
      },
    ],
  },
  {
    category: "Voting & Campaigns",
    icon: <Calendar className="w-5 h-5 text-orange-400" />,
    questions: [
      {
        q: "How many times can I vote?",
        a: "This depends on the specific campaign. Some organizers allow one vote per person, while others may allow multiple votes. Check the specific campaign page for details.",
      },
      {
        q: "Are the voting results real-time?",
        a: "Yes, our platform updates vote counts in real-time as they are verified.",
      },
    ],
  },
  {
    category: "Payments",
    icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit/debit cards and Mobile Money (M-PESA) via our secure Paystack integration.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We do not store your card or mobile money details. All transactions are securely encrypted and processed by Paystack.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<string | null>("0-0");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-fuchsia-500/30 selection:text-fuchsia-50 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center text-center border-b border-slate-800/60">
        <div className="absolute inset-0 bg-linear-to-b from-fuchsia-500/5 to-slate-950 pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6 relative z-10">
          How can we help you?
        </h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl z-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl text-base text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none shadow-xl"
            placeholder="Search for articles, questions, or topics..."
          />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* FAQs */}
        <div className="space-y-12">
          {faqs.map((category, catIndex) => (
            <div
              key={catIndex}
              className="animate-fade-in-up"
              style={{ animationDelay: `${catIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const id = `${catIndex}-${qIndex}`;
                  const isOpen = openFaq === id;

                  // Simple search filter logic
                  if (
                    searchQuery &&
                    !faq.q.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !faq.a.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={qIndex}
                      className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                        isOpen
                          ? "bg-slate-900/80 border-slate-700 shadow-lg"
                          : "bg-slate-950 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/30"
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(id)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                      >
                        <span className="font-semibold text-slate-200">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-fuchsia-400" : ""}`}
                        />
                      </button>

                      <div
                        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "max-h-96 pb-5 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="text-slate-400 leading-relaxed text-sm">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* --- CONTACT SUPPORT CARD --- */}
        <div className="mt-20 p-8 sm:p-10 bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-fuchsia-500/10" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-fuchsia-400" />
                Still need help?
              </h3>
              <p className="text-slate-400 max-w-md">
                Can't find the answer you're looking for? Our support team is
                here to help you sort things out.
              </p>
            </div>

            <a
              href="mailto:bambapayunion@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
