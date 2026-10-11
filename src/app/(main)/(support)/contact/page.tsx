"use client";

import { useState } from "react";
import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-hidden text-slate-300 selection:bg-fuchsia-500/30 selection:text-fuchsia-50">
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 relative z-10">
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

        {/* Page Header */}
        <div
          className="mb-16 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-500 to-orange-500">
              touch.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Have a question about an event, need help with your tickets, or want
            to host your own campaign? Our team is ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-500 mb-6 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <p className="text-slate-400 text-sm mb-4">
                For general inquiries, ticket support, and partnerships. We aim
                to reply within 24 hours.
              </p>
              <a
                href="mailto:support@bambatickets.com"
                className="text-fuchsia-400 font-bold hover:text-fuchsia-300 transition-colors"
              >
                support@bambatickets.com
              </a>
            </div>

            <div
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 shadow-inner">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Call or WhatsApp
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Available Mon-Fri, 9am to 6pm EAT for urgent matters.
              </p>
              <a
                href="tel:+254700000000"
                className="text-orange-400 font-bold hover:text-orange-300 transition-colors"
              >
                +254 700 000 000
              </a>
            </div>

            <div
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 hover:border-slate-700 transition-colors animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-6 shadow-inner">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Headquarters
              </h3>
              <p className="text-slate-400 text-sm">
                Nairobi, Kenya
                <br />
                (Remote-first company, by appointment only)
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div
            className="lg:col-span-7 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <MessageSquare className="w-6 h-6 text-fuchsia-400" />
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Send a Message
                  </h2>
                </div>

                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-950/50 rounded-3xl border border-slate-800/80">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-slate-400 max-w-xs">
                      Thanks for reaching out. Our support team will get back to
                      you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none resize-none"
                        placeholder="Tell us what you need..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10 border-t border-slate-900 bg-slate-950 mt-12">
        <GlobalFooter />
      </div>
    </div>
  );
}
