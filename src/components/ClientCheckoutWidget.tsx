"use client";

import { useState } from "react";
import { Ticket, User, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { initializeCheckout } from "../actions/checkout";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

interface CheckoutWidgetProps {
  eventId: string;
  tiers: TicketTier[];
}

// Helper to dynamically load Paystack's official inline script
const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutWidget({
  eventId,
  tiers,
}: CheckoutWidgetProps) {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(
    tiers[0] || null,
  );
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTier || !name || !email) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsInitializing(true);

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("tierId", selectedTier.id);
    formData.append("email", email);
    formData.append("name", name);
    formData.append("quantity", quantity.toString());

    // 1. Initialize checkout on our server action
    const result = await initializeCheckout(formData);

    if (!result) {
      toast.error("No response from server.");
      setIsInitializing(false);
      return;
    }

    if (result.error) {
      toast.error(String(result.error));
      setIsInitializing(false);
      return;
    }

    if (result.success && result.accessCode) {
      // 2. Load Paystack script on demand
      const scriptLoaded = await loadPaystackScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Paystack payment gateway.");
        setIsInitializing(false);
        return;
      }

      // 3. Open Paystack Native Modal using access code
      const publicKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        "pk_test_804c19ffa59ebf7e16cea24fa8a4ef577e28fcf4";

      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: selectedTier.price * quantity * 100, // Cents
        currency: "KES",
        ref: result.reference,
        access_code: result.accessCode,
        callback: (response: { reference: string }) => {
          toast.success("Payment successful! Reference: " + response.reference);
          console.log("Paystack Success Response:", response);
          setIsInitializing(false);
          // TODO: Redirect to success page or issue ticket
        },
        onClose: () => {
          toast.error("Payment cancelled.");
          setIsInitializing(false);
        },
      });

      handler.openIframe();
    }
  }

  const totalAmount = selectedTier ? selectedTier.price * quantity : 0;

  if (tiers.length === 0) {
    return <div className="text-slate-500 italic">No tickets available.</div>;
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl sticky top-28">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-fuchsia-400" />
        Select Tickets
      </h3>

      <form onSubmit={handleCheckout} className="space-y-6">
        {/* TIER SELECTION */}
        <div className="space-y-3">
          {tiers.map((tier) => (
            <label
              key={tier.id}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTier?.id === tier.id
                  ? "bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ticketTier"
                  className="w-4 h-4 accent-fuchsia-500"
                  checked={selectedTier?.id === tier.id}
                  onChange={() => setSelectedTier(tier)}
                />
                <div>
                  <div className="text-sm font-bold text-white">
                    {tier.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    KES {tier.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        {/* SUMMARY & SUBMIT */}
        <div className="pt-6 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-2xl font-black text-white">
              KES {totalAmount.toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={isInitializing}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-linear-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-fuchsia-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Checkout Securely <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
