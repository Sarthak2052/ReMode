"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Building2,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  Receipt,
  Lock,
} from "lucide-react";
import { RecoveryPlan } from "@/types";

interface ConfirmApplyModalProps {
  plan: RecoveryPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: RecoveryPlan) => Promise<any> | void;
  isLoading: boolean;
  tripId?: string;
}

type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "CORPORATE";

export const ConfirmApplyModal: React.FC<ConfirmApplyModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  tripId,
}) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [upiId, setUpiId] = useState("traveler.aarav@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8910");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("•••");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [paymentStep, setPaymentStep] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");
  const [processingStatusText, setProcessingStatusText] = useState("Contacting Bank Gateway...");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen || !plan) return null;

  const netAmount = plan.netAdditionalCost;
  const isRefund = netAmount < 0;
  const isZero = netAmount === 0;

  const handleClose = () => {
    if (paymentStep === "PROCESSING") return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPaymentStep("IDLE");
    setProgress(0);
    onClose();
  };

  const handlePayAndApply = async () => {
    setPaymentStep("PROCESSING");
    setProgress(12);
    setProcessingStatusText(
      isRefund
        ? "Initiating Instant Refund Credit to Source..."
        : "Contacting Secure Payment Gateway (256-bit SSL)..."
    );

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          const step = Math.max(1, Math.floor((92 - prev) / 5));
          return prev + step;
        }
        return prev;
      });
    }, 110);

    // Stage 1: Handshake
    await new Promise((r) => setTimeout(r, 850));

    // Stage 2: Reservation Allocation
    setProcessingStatusText("Securing Provider Seat & Allocating Confirmed PNR...");
    await new Promise((r) => setTimeout(r, 900));

    try {
      setProcessingStatusText("Payment Verified! Applying Replacement Itinerary...");
      await onConfirm(plan);

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 450));

      setPaymentStep("SUCCESS");
      await new Promise((r) => setTimeout(r, 1200));

      // Direct user to dashboard page where the updated itinerary is displayed
      const targetUrl = tripId
        ? `/dashboard?tripId=${encodeURIComponent(tripId)}&paymentSuccess=true&plan=${encodeURIComponent(
            plan.label
          )}&amount=${encodeURIComponent(Math.abs(netAmount).toString())}`
        : `/dashboard?paymentSuccess=true&plan=${encodeURIComponent(plan.label)}`;

      handleClose();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
      router.push(targetUrl);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      console.warn("Notice during payment rebooking:", err);
      setPaymentStep("IDLE");
      setProgress(0);
      alert("Payment processing encountered an issue. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-2 sm:p-4 flex items-start sm:items-center justify-center">
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_24px_70px_rgba(10,61,115,0.22)] max-w-xl w-full my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Pinned at top, never clipped */}
        <div className="shrink-0 bg-gradient-to-r from-[#F0F6FC] via-white to-[#F0F6FC] p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF5FF] border border-[#74BCFB]/40 flex items-center justify-center font-extrabold text-sm text-[#1C6FD9] shadow-xs">
              ₹
            </div>
            <div>
              <h3 className="font-sans text-base sm:text-lg font-extrabold text-[#0F1B2B] tracking-tight">
                ReMode Payment Gateway
              </h3>
              <p className="text-[11px] text-[#4A5B70] font-medium">
                Instant Rebooking & Disruption Policy Settlement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={paymentStep === "PROCESSING"}
            className="p-2 rounded-xl text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-gray-100 transition-all disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Processing State - With Working Dynamic Animated Progress Bar */}
        {paymentStep === "PROCESSING" && (
          <div className="p-8 sm:p-10 text-center space-y-6 bg-gradient-to-b from-white to-[#F8FBFF] flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#1C6FD9] animate-spin" />
              <div className="w-16 h-16 rounded-full bg-white border border-[#74BCFB]/40 flex items-center justify-center shadow-md">
                <Lock className="w-7 h-7 text-[#1C6FD9]" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-sans font-extrabold text-lg text-[#0F1B2B]">
                {processingStatusText}
              </h4>
              <p className="text-xs text-[#4A5B70] font-medium">
                PCI-DSS Level 1 Encrypted • Instant IRCTC / Airline API Sync
              </p>
            </div>

            {/* Working Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#4A5B70]">Verification & Settlement</span>
                <span className="tabular-nums font-mono text-[#1C6FD9]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                <div
                  className="bg-gradient-to-r from-[#1C6FD9] via-[#2F8BF5] to-[#2CD9B8] h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(44,217,184,0.45)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4A5B70] font-medium pt-1">
                <Sparkles className="w-3 h-3 text-[#1C6FD9] animate-pulse" />
                <span>Simulating instant inter-modal reservation handshake</span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStep === "SUCCESS" && (
          <div className="p-8 sm:p-10 text-center space-y-4 bg-emerald-50/60 flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/25 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="font-sans font-extrabold text-2xl text-emerald-950">
                Payment Verified & Confirmed!
              </h4>
              <p className="text-xs text-emerald-700 mt-1 font-semibold">
                Your new itinerary has been secured. Updating your dashboard now...
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white px-4 py-2 rounded-full border border-emerald-200 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Applying Confirmed PNR to Corridors...</span>
            </div>
          </div>
        )}

        {/* Normal Form View - Scrollable body */}
        {paymentStep === "IDLE" && (
          <div className="p-4 sm:p-5 space-y-4 text-xs text-[#0F1B2B] flex-1 overflow-y-auto">
            {/* Selected Solution Summary Card */}
            <div className="bg-[#F8FBFF] p-4 rounded-2xl border border-[#74BCFB]/35 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C6FD9] bg-[#EAF5FF] px-2.5 py-0.5 rounded-full border border-[#74BCFB]/40">
                  Selected Solution
                </span>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{plan.criticalEventProtected}</span>
                </span>
              </div>
              <h4 className="font-sans font-extrabold text-base text-[#0F1B2B]">
                {plan.label}
              </h4>
              <div className="flex items-center justify-between text-xs text-[#4A5B70] pt-1.5 border-t border-gray-100">
                <span>Arrival: <strong className="text-[#0F1B2B]">{plan.arrivalTime}</strong></span>
                <span>Buffer Cushion: <strong className="text-emerald-700">+{plan.bufferMinutes} mins</strong></span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-[#4A5B70]">
                <span>Disrupted Ticket Refund (Auto-Claimed):</span>
                <span className="font-bold text-emerald-600 font-mono">
                  -₹{Math.max(0, plan.additionalCost - plan.netAdditionalCost).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4A5B70]">
                <span>New Verified Alternative Booking:</span>
                <span className="font-bold text-[#0F1B2B] font-mono">
                  +₹{plan.additionalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#4A5B70]">
                <span>Disruption Guarantee & Concierge Fee:</span>
                <span className="font-bold text-[#1C6FD9] uppercase text-[10px] bg-[#EAF5FF] px-2 py-0.5 rounded-full border border-[#74BCFB]/30">
                  ₹0 (Included)
                </span>
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-sans font-extrabold text-sm text-[#0F1B2B] block">
                    {isRefund ? "Net Refund To You:" : "Total Net Payable:"}
                  </span>
                  <span className="text-[10px] text-[#4A5B70]">
                    {isRefund
                      ? "Credited back instantly to your original payment method"
                      : "Includes all GST, platform fees & confirmation guarantee"}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-sans font-extrabold text-2xl tracking-tight ${
                      isRefund ? "text-emerald-600" : "text-[#1C6FD9]"
                    }`}
                  >
                    {isRefund
                      ? `-₹${Math.abs(netAmount).toLocaleString()}`
                      : `₹${netAmount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods Selector */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F1B2B] block">
                Choose Payment Method:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs ${
                    paymentMethod === "UPI"
                      ? "bg-[#EAF5FF] border-2 border-[#1C6FD9] font-extrabold text-[#1C6FD9]"
                      : "bg-gray-50 border-gray-200 hover:bg-white text-[#4A5B70]"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#1C6FD9]" />
                  <span className="text-[11px]">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs ${
                    paymentMethod === "CARD"
                      ? "bg-[#EAF5FF] border-2 border-[#1C6FD9] font-extrabold text-[#1C6FD9]"
                      : "bg-gray-50 border-gray-200 hover:bg-white text-[#4A5B70]"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#1C6FD9]" />
                  <span className="text-[11px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("NETBANKING")}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs ${
                    paymentMethod === "NETBANKING"
                      ? "bg-[#EAF5FF] border-2 border-[#1C6FD9] font-extrabold text-[#1C6FD9]"
                      : "bg-gray-50 border-gray-200 hover:bg-white text-[#4A5B70]"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#1C6FD9]" />
                  <span className="text-[11px]">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CORPORATE")}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs ${
                    paymentMethod === "CORPORATE"
                      ? "bg-[#EAF5FF] border-2 border-[#1C6FD9] font-extrabold text-[#1C6FD9]"
                      : "bg-gray-50 border-gray-200 hover:bg-white text-[#4A5B70]"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#1C6FD9]" />
                  <span className="text-[11px]">Corporate</span>
                </button>
              </div>

              {/* Tab details */}
              <div className="p-4 rounded-2xl bg-[#F8FBFF] border border-[#74BCFB]/30">
                {paymentMethod === "UPI" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0F1B2B]">
                        Scan QR Code or Enter UPI ID
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-emerald-600 shadow-2xs">
                          GPay
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-purple-600 shadow-2xs">
                          PhonePe
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-blue-600 shadow-2xs">
                          Paytm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stylized QR representation */}
                      <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-xs">
                        <div className="w-full h-full border border-dashed border-[#1C6FD9]/40 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-[#0F1B2B] bg-[#EAF5FF]/60">
                          <QrCode className="w-7 h-7 text-[#1C6FD9]" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-[#4A5B70] font-bold block">
                          Verified VPA / UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#1C6FD9] focus:ring-2 focus:ring-[#1C6FD9]/15 shadow-2xs"
                          placeholder="yourname@upi"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "CARD" && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-[#4A5B70] font-bold block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#1C6FD9] focus:ring-2 focus:ring-[#1C6FD9]/15 shadow-2xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#4A5B70] font-bold block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#1C6FD9] shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#4A5B70] font-bold block mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#1C6FD9] shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "NETBANKING" && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#4A5B70] font-bold block">
                      Select Your Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#1C6FD9] shadow-2xs"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "CORPORATE" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F1B2B]">Corporate Account ID:</span>
                      <span className="font-mono font-bold text-[#1C6FD9] bg-white px-2 py-0.5 rounded border border-gray-200">
                        CORP-IND-9921-TRAVEL
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5B70] font-medium leading-relaxed">
                      Pre-approved disruption emergency budget is active. Direct settlement with employer travel desk.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reassurance text */}
            <div className="flex items-center gap-2 text-[11px] text-[#4A5B70] pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Encrypted via 256-bit bank grade SSL. Upon authorization, your itinerary automatically updates with verified carrier PNRs.
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions - Pinned at bottom */}
        {paymentStep === "IDLE" && (
          <div className="shrink-0 bg-gray-50/80 p-3.5 sm:p-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-[#4A5B70] bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-all shadow-2xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePayAndApply}
              disabled={isLoading}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#1C6FD9] hover:bg-[#1558B0] rounded-xl shadow-[0_4px_16px_rgba(28,111,217,0.3)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isRefund
                  ? `Claim ₹${Math.abs(netAmount).toLocaleString()} Refund & Update`
                  : `Pay ₹${netAmount.toLocaleString()} & Rebook Now`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
