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

export default function TicketSelector({
  eventId,
  ticketTiers,
}: {
  eventId: string;
  ticketTiers: Tier[];
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<{ [tierId: string]: number }>(
    ticketTiers.reduce((acc, tier) => ({ ...acc, [tier.id]: 0 }), {}),
  );

  const updateQuantity = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [tierId]: updated };
    });
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = ticketTiers.reduce(
    (sum, tier) => sum + (quantities[tier.id] || 0) * tier.price,
    0,
  );

  const handleProceedToCheckout = () => {
    if (totalTickets === 0) return;

    // Filter out tiers with 0 quantity
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
        <Ticket className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-slate-400 text-xs font-bold">
          Tickets not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-28">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
        <Ticket className="w-5 h-5 text-cyan-400" /> Select Passes
      </h3>

      <div className="space-y-4">
        {ticketTiers.map((tier) => {
          const qty = quantities[tier.id] || 0;
          return (
            <div
              key={tier.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{tier.name}</h4>
                  <p className="text-xs font-mono text-cyan-400 font-bold mt-0.5">
                    KES {tier.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-[11px] font-mono text-slate-500">
                  Quantity
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(tier.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-xl flex items-center justify-center text-white transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-sm text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(tier.id, 1)}
                    className="w-8 h-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center text-white transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT SUMMARY FOOTER */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex justify-between items-center font-mono text-xs">
          <span className="text-slate-400">Total Selected:</span>
          <span className="text-white font-bold">{totalTickets} tickets</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-300">
            Total Amount:
          </span>
          <span className="text-xl font-black text-cyan-400">
            KES {totalPrice.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleProceedToCheckout}
          disabled={totalTickets === 0}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
