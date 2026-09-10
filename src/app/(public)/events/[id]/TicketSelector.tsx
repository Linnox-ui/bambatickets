"use client";

import { useState } from "react";
import { Ticket, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Tier {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

interface TicketSelectorProps {
  eventId: string;
  feeBearer: "ATTENDEE" | "ORGANIZER";
  ticketTiers: Tier[];
}

export default function TicketSelector({
  eventId,
  feeBearer,
  ticketTiers,
}: TicketSelectorProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantities, setQuantities] = useState<{ [tierId: string]: number }>(
    ticketTiers.reduce((acc, tier) => ({ ...acc, [tier.id]: 0 }), {}),
  );

  const updateQuantity = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const updated = Math.max(0, current + delta);
      // Optional: Add max limit here (e.g., Math.min(10, current + delta))
      return { ...prev, [tierId]: updated };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const subtotal = ticketTiers.reduce(
    (sum, tier) => sum + (quantities[tier.id] || 0) * tier.price,
    0,
  );

  // 🚀 Intelligent Fee Calculation
  const platformFee = feeBearer === "ATTENDEE" ? subtotal * 0.055 : 0;
  const totalPrice = subtotal + platformFee;

  const handleProceedToCheckout = () => {
    if (totalTickets === 0) return;
    setIsProcessing(true);

    // Format: tierId:qty,tierId:qty
    const selectedItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, qty]) => `${tierId}:${qty}`)
      .join(",");

    router.push(
      `/checkout/${eventId}?items=${encodeURIComponent(selectedItems)}`,
    );
  };

  if (ticketTiers.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Ticket className="w-8 h-8 text-slate-600" />
        </div>
        <div>
          <p className="text-white font-bold">No Passes Available</p>
          <p className="text-slate-500 text-xs mt-1 font-mono">
            Check back later for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-4xl p-6 sm:p-8 shadow-2xl sticky top-8">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 shadow-inner">
          <Ticket className="w-5 h-5 text-orange-500 transform -rotate-45" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">Select Passes</h3>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Secure Checkout
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ticketTiers.map((tier) => {
          const qty = quantities[tier.id] || 0;
          const isSelected = qty > 0;

          return (
            <div
              key={tier.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? "bg-orange-500/5 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                  : "bg-slate-950/50 border-slate-800/80"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">{tier.name}</h4>
                  <p className="text-sm font-black text-orange-400 mt-0.5">
                    KES {tier.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Quantity
                </span>
                <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button
                    onClick={() => updateQuantity(tier.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 hover:bg-slate-800 disabled:opacity-30 rounded-lg flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(tier.id, 1)}
                    className="w-8 h-8 hover:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT SUMMARY FOOTER (Appears smoothly when tickets are selected) */}
      {totalTickets > 0 && (
        <div className="pt-6 mt-6 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-2 text-sm font-mono border-b border-slate-800/60 pb-4 mb-4">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({totalTickets}x)</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            {platformFee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Booking Fee</span>
                <span>KES {platformFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-black text-base pt-2">
              <span>Total</span>
              <span className="text-orange-400">
                KES {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={isProcessing}
            className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black tracking-widest uppercase rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? "Routing..." : "Proceed to Checkout"}
            {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-mono uppercase tracking-widest pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL
            Encrypted Checkout
          </div>
        </div>
      )}
    </div>
  );
}
