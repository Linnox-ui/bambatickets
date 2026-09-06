"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Ticket,
  CreditCard,
  Loader2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { initializeCheckout } from "../../../../actions/checkout";

interface PageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ items?: string | string[] }>;
}

export default function CheckoutPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearch = use(searchParams);
  const eventId = resolvedParams.eventId;

  const rawItems = resolvedSearch.items;
  const itemsParam = Array.isArray(rawItems) ? rawItems[0] : rawItems;

  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dynamically load Paystack inline script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !itemsParam) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("customerName", name);
      formData.append("customerEmail", email);

      // 1. Call server action to create DB booking
      const result = await initializeCheckout(eventId, itemsParam, formData);

      if (result.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
        return;
      }

      // @ts-ignore
      if (typeof PaystackPop === "undefined") {
        setErrorMsg(
          "Payment gateway failed to load. Please refresh and try again.",
        );
        setIsLoading(false);
        return;
      }

      // 🚀 FIX: Fetch your key from environment variables right here
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (!paystackPublicKey) {
        setErrorMsg("Paystack Public Key is missing in environment variables.");
        setIsLoading(false);
        return;
      }

      // 2. Open Paystack Dark-Compatible Popup
      //@ts-ignore
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: result.customerEmail,
        amount: result.amountInCents,
        currency: "KES",
        ref: result.reference,
        channels: ["mobile_money", "card", "bank"], // Forces payment selection screen
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: result.customerName,
            },
          ],
        },
        callback: function (response: any) {
          router.push(`/checkout/verify?reference=${response.reference}`);
        },
        onClose: function () {
          setIsLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred during checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))] pointer-events-none"></div>

      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href={`/events/${eventId}`}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Event
          </Link>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" /> Secure On-Site Checkout
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-12 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <span className="px-2.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold font-mono rounded-lg text-[10px] uppercase tracking-wider">
              Secure Gateway
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">
              Complete Your Purchase
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Enter your details to launch the secure payment modal.
            </p>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Innocent Lijodi"
                className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-cyan-500 outline-none transition-all shadow-inner placeholder-slate-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="innocent@example.com"
                className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-cyan-500 outline-none transition-all shadow-inner placeholder-slate-600"
              />
            </div>

            {errorMsg && (
              <p className="text-rose-400 text-xs font-medium bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                {errorMsg}
              </p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4.5 bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(8,145,178,0.4)] text-sm flex items-center justify-center gap-2.5 tracking-wide disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Open Paystack Secure
                    Modal
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> M-Pesa
                & Card Popup
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
