"use client";

import { useState, useRef, useEffect } from "react";
import { savePayoutSettings } from "../../../../actions/payouts";
import {
  Wallet,
  Building2,
  Smartphone,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Search,
  Check,
  MapPin,
  Store,
  Receipt,
  Lock,
  Edit3,
  X,
} from "lucide-react";

const KENYAN_BANKS = [
  "Absa Bank Kenya PLC",
  "Access Bank Kenya",
  "Bank of Africa Kenya",
  "Bank of Baroda",
  "Bank of India",
  "Citibank N.A Kenya",
  "Co-operative Bank of Kenya",
  "Consolidated Bank of Kenya",
  "Credit Bank",
  "Development Bank of Kenya",
  "Diamond Trust Bank (DTB)",
  "DIB Bank Kenya",
  "Ecobank Kenya",
  "Equity Bank Kenya",
  "Family Bank",
  "First Community Bank",
  "Guaranty Trust Bank (GTBank)",
  "Guardian Bank",
  "Gulf African Bank",
  "Housing Finance Company (HFC)",
  "I&M Bank",
  "Kenya Commercial Bank (KCB)",
  "Kingdom Bank Kenya",
  "Mayfair CIB Bank",
  "Middle East Bank Kenya",
  "M Oriental Bank",
  "National Bank of Kenya",
  "NCBA Bank Kenya",
  "Paramount Bank",
  "Prime Bank",
  "SBM Bank Kenya",
  "Sidian Bank",
  "Stanbic Bank Kenya",
  "Standard Chartered Bank Kenya",
  "UBA Kenya Bank",
  "Victoria Commercial Bank",
];

type MainMethod = "MOBILE" | "BANK";
type MobileType =
  "MPESA_PHONE" | "AIRTEL_MONEY" | "MPESA_TILL" | "MPESA_PAYBILL";

type InitialData = {
  payoutMethod: string | null;
  payoutAccountName: string | null;
  payoutAccountNumber: string | null;
  payoutBankName: string | null;
} | null;

export default function PayoutManager({
  initialData,
}: {
  initialData: InitialData;
}) {
  const [data, setData] = useState<InitialData>(initialData);
  const [isEditing, setIsEditing] = useState(!initialData?.payoutMethod);

  const [mainMethod, setMainMethod] = useState<MainMethod>(
    initialData?.payoutMethod === "BANK" ? "BANK" : "MOBILE",
  );
  const [mobileType, setMobileType] = useState<MobileType>(
    initialData?.payoutMethod !== "BANK" && initialData?.payoutMethod
      ? (initialData.payoutMethod as MobileType)
      : "MPESA_PHONE",
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [bankQuery, setBankQuery] = useState("");
  const [branchName, setBranchName] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredBanks = KENYAN_BANKS.filter((bank) =>
    bank.toLowerCase().includes(bankQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowBankDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const maskNumber = (num: string) => {
    if (num.length <= 4) return num;
    return `•••• ${num.slice(-4)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const finalMethod = mainMethod === "BANK" ? "BANK" : mobileType;
    formData.append("method", finalMethod);

    if (mainMethod === "BANK") {
      formData.set("bankName", `${bankQuery} - ${branchName} Branch`);
    }

    if (mainMethod === "MOBILE" && mobileType === "MPESA_PAYBILL") {
      const pb = formData.get("paybillNumber");
      const acc = formData.get("paybillAccount");
      formData.set("accountNumber", `${pb} (Acc: ${acc})`);
    }

    const res = await savePayoutSettings(formData);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else if (res.success && res.data) {
      setData(res.data);
      setIsEditing(false);
      setMessage(null);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-16">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <div className="pb-6 border-b border-slate-800/80">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" />
          Revenue Routing
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
          Configure where your ticket sales revenue will be disbursed.
        </p>
      </div>

      {!isEditing && data?.payoutMethod ? (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Payout Configured
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Your revenue routing is locked and active.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Network
              </p>
              <p className="font-bold text-white flex items-center gap-2">
                {data.payoutMethod === "BANK" ? (
                  <Building2 className="w-4 h-4 text-orange-400" />
                ) : (
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                )}
                {data.payoutMethod.replace("_", " ")}
              </p>
            </div>

            {data.payoutBankName && (
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                  Institution & Branch
                </p>
                <p className="font-bold text-white">{data.payoutBankName}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Account Name
              </p>
              <p className="font-bold text-white">{data.payoutAccountName}</p>
            </div>

            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Account / Phone Number
              </p>
              <p className="font-mono text-lg font-black text-white tracking-wider">
                {maskNumber(data.payoutAccountNumber || "")}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-700"
            >
              <Edit3 className="w-4 h-4" /> Change Payout Details
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {data?.payoutMethod && (
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Cancel Editing"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 p-4 mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>
              Your payment details are encrypted and securely stored on the
              Bamba network.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setMainMethod("MOBILE")}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${
                mainMethod === "MOBILE"
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Smartphone className="w-8 h-8" />
              <span className="font-bold text-sm tracking-wide">
                Mobile Money
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainMethod("BANK")}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${
                mainMethod === "BANK"
                  ? "bg-orange-500/10 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <Building2 className="w-8 h-8" />
              <span className="font-bold text-sm tracking-wide">
                Bank Transfer
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mainMethod === "MOBILE" && (
              <div className="animate-fade-in-up space-y-6">
                <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {[
                    {
                      id: "MPESA_PHONE",
                      label: "M-PESA Phone",
                      icon: Smartphone,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/20",
                    },
                    {
                      id: "MPESA_TILL",
                      label: "M-PESA Till",
                      icon: Store,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/20",
                    },
                    {
                      id: "MPESA_PAYBILL",
                      label: "Paybill",
                      icon: Receipt,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/20",
                    },
                    {
                      id: "AIRTEL_MONEY",
                      label: "Airtel Money",
                      icon: Smartphone,
                      color: "text-red-400",
                      bg: "bg-red-500/20",
                    },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isActive = mobileType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMobileType(type.id as MobileType)}
                        className={`flex-1 min-w-30 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? `${type.bg} ${type.color} shadow-sm`
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {mobileType === "MPESA_PHONE" ||
                    mobileType === "AIRTEL_MONEY"
                      ? "Registered Name"
                      : "Business / Store Name"}
                  </label>
                  <input
                    name="accountName"
                    type="text"
                    required
                    placeholder="e.g. John Doe / Bamba Events Ltd"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-slate-600"
                  />
                </div>

                {mobileType !== "MPESA_PAYBILL" ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {mobileType === "MPESA_PHONE" ||
                      mobileType === "AIRTEL_MONEY"
                        ? "Phone Number"
                        : "Till Number (Buy Goods)"}
                    </label>
                    <input
                      name="accountNumber"
                      type="text"
                      required
                      placeholder={
                        mobileType === "MPESA_TILL"
                          ? "e.g. 123456"
                          : "e.g. 254700000000"
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-slate-600"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Paybill Business Number
                      </label>
                      <input
                        name="paybillNumber"
                        type="text"
                        required
                        placeholder="e.g. 247247"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Account Number
                      </label>
                      <input
                        name="paybillAccount"
                        type="text"
                        required
                        placeholder="e.g. BAMBA-001"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder-slate-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mainMethod === "BANK" && (
              <div className="animate-fade-in-up space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Bank Account Name
                  </label>
                  <input
                    name="accountName"
                    type="text"
                    required
                    placeholder="e.g. Bamba Events Ltd"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Bank Account Number
                  </label>
                  <input
                    name="accountNumber"
                    type="text"
                    required
                    placeholder="Account Number"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Select Bank
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={bankQuery}
                        onChange={(e) => {
                          setBankQuery(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        placeholder="Search your bank..."
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600"
                      />
                    </div>

                    {showBankDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-60 overflow-y-auto hide-scrollbar">
                        {filteredBanks.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            No banks found.
                          </div>
                        ) : (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => {
                                setBankQuery(bank);
                                setShowBankDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between group"
                            >
                              {bank}
                              {bankQuery === bank && (
                                <Check className="w-4 h-4 text-orange-500" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Branch Name
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Westlands / CBD"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`p-4 rounded-xl text-sm font-bold border ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-8 py-4 bg-linear-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50 text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    {data?.payoutMethod
                      ? "Update Configuration"
                      : "Save Payout Configuration"}{" "}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
