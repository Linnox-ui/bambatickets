"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CreditCard,
  Loader2,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  initializeCheckout,
  checkAvailability,
} from "../../../../actions/checkout";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const eventId = params.eventId as string;
  const itemsParam = searchParams.get("items");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [capacityError, setCapacityError] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);

  useEffect(() => {
    if (!eventId || !itemsParam) {
      setIsCheckingAvailability(false);
      return;
    }

    checkAvailability(eventId, itemsParam).then((res) => {
      if (res.error) {
        setCapacityError(res.error);
      }
      setIsCheckingAvailability(false);
    });
  }, [eventId, itemsParam]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !itemsParam || capacityError) return;

    if (!isPaystackLoaded && typeof window.PaystackPop === "undefined") {
      setErrorMsg(
        "Payment gateway is still loading. Please try again in a few seconds.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("customerName", name);
      formData.append("customerEmail", email);

      const result = await initializeCheckout(eventId, itemsParam, formData);

      if (result.error || !result.access_code) {
        setErrorMsg(result.error || "Failed to initialize payment session.");
        setIsLoading(false);
        return;
      }

      const popup = new window.PaystackPop();
      popup.checkout({
        accessCode: result.access_code,
        onSuccess: (transaction: { reference: string }) => {
          router.push(`/checkout/verify?reference=${transaction.reference}`);
        },
        onCancel: () => {
          setIsLoading(false);
        },
        onError: (error: { message: string }) => {
          setErrorMsg(
            error?.message || "Payment processing encountered an error.",
          );
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error("Checkout execution error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || isCheckingAvailability || !!capacityError;

  return (
    <>
      <Script
        src="https://js.paystack.co/v2/inline.js"
        strategy="afterInteractive"
        onLoad={() => setIsPaystackLoaded(true)}
        onError={() => {
          setErrorMsg(
            "Failed to connect to the payment gateway. Please check your internet connection.",
          );
        }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-50 pb-24 relative overflow-x-hidden animate-fade-in-up">
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.12),rgba(255,255,255,0))] pointer-events-none" />

        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link
              href={`/events/${eventId}`}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" /> Back to Event
            </Link>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono font-bold shadow-inner">
              <Lock className="w-3.5 h-3.5" /> Secure Checkout
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 pt-8 sm:pt-12 relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 animate-in fade-in zoom-in-95 duration-300 space-y-6">
              <div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold font-mono rounded-lg text-[10px] uppercase tracking-wider shadow-inner">
                  Payment Gateway
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-3">
                  Complete Purchase
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Enter your details to initiate M-Pesa or Card payment.
                </p>
              </div>

              {isCheckingAvailability ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                    Verifying Availability...
                  </p>
                </div>
              ) : capacityError ? (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl shadow-inner">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-red-400">
                      Order Cannot Be Completed
                    </p>
                    <p className="text-red-300/80">{capacityError}</p>
                    <Link
                      href={`/events/${eventId}`}
                      className="inline-block mt-2 text-xs font-bold text-red-400 hover:text-red-300 underline underline-offset-2"
                    >
                      Return to Event and adjust quantity
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="customerName"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono"
                    >
                      Full Legal Name
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      disabled={isFormDisabled}
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-orange-500 outline-none transition-all shadow-inner placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="customerEmail"
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono"
                    >
                      Email Address
                    </label>
                    <input
                      id="customerEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      disabled={isFormDisabled}
                      className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-orange-500 outline-none transition-all shadow-inner placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-4 rounded-2xl shadow-inner">
                      {errorMsg}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isFormDisabled}
                      className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> Pay with M-Pesa /
                          Card
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-orange-500" />{" "}
                      M-Pesa Supported
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{" "}
                      SSL Encrypted
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
