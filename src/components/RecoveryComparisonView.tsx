"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Train,
  Briefcase,
  Layers,
  Scale,
  Gauge,
  Check,
  Zap,
} from "lucide-react";
import { RecoveryPlan } from "@/types";

interface RecoveryComparisonViewProps {
  plans: RecoveryPlan[];
  onSelectPlan: (plan: RecoveryPlan) => void;
  isLoading: boolean;
  onFocusPlan?: (plan: RecoveryPlan | null) => void;
  focusedPlanId?: string;
}

export const RecoveryComparisonView: React.FC<RecoveryComparisonViewProps> = ({
  plans,
  onSelectPlan,
  isLoading,
  onFocusPlan,
  focusedPlanId,
}) => {
  // Track expanded state for step-by-step actions and 13 factors per plan
  const [expandedActionsPlanId, setExpandedActionsPlanId] = useState<string | null>(null);
  const [expandedFactorsPlanId, setExpandedFactorsPlanId] = useState<string | null>(null);

  const toggleActions = (id: string) => {
    setExpandedActionsPlanId((curr) => (curr === id ? null : id));
  };

  const toggleFactors = (id: string) => {
    setExpandedFactorsPlanId((curr) => (curr === id ? null : id));
  };

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case "REPLACE":
        return "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40";
      case "REBOOK":
        return "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]";
      case "RESCHEDULE":
        return "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]";
      case "REORDER":
        return "bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]";
      case "CANCEL":
        return "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30";
      case "KEEP_AS_IS":
      default:
        return "bg-[#F0F6FC] text-[#4A5B70] border-gray-200";
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden space-y-6 text-[#0F1B2B]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="font-sans text-2xl sm:text-3xl font-black text-[#0F1B2B] tracking-tight">
                Recovery Plan Comparison
              </span>
              <span className="text-[11px] font-black text-[#1C6FD9] bg-[#EAF5FF] px-3.5 py-1 rounded-full border border-[#74BCFB]/40 flex items-center gap-1.5 shadow-2xs">
                <Gauge className="w-3.5 h-3.5 text-[#1C6FD9]" />
                13-Factor Scoring Model
              </span>
            </div>
            <p className="text-xs text-[#4A5B70] font-medium leading-relaxed max-w-2xl">
              Deterministic, policy-checked candidates evaluated across net expense, schedule preservation, and connection safety.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5B70] bg-[#F8FBFF] px-3.5 py-1.5 rounded-full border border-[#74BCFB]/30 shadow-2xs self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 text-[#047857] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Protected
            </span>
            <span className="inline-flex items-center gap-1 text-[#B45309] font-bold ml-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Risky Buffer
            </span>
            <span className="inline-flex items-center gap-1 text-[#C13A1F] font-bold ml-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Unprotected
            </span>
          </div>
        </div>

        {/* Organized 3-Column Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isRecommended = plan.rank === 1;
            const isFocused = focusedPlanId === plan.id;
            const areActionsExpanded = expandedActionsPlanId === plan.id;
            const areFactorsExpanded = expandedFactorsPlanId === plan.id;
            const hasActions = plan.actions && plan.actions.length > 0;
            const hasLive =
              plan.liveRecommendation?.availableAlternatives &&
              plan.liveRecommendation.availableAlternatives.length > 0;

            return (
              <div
                key={plan.id}
                onMouseEnter={() => onFocusPlan?.(plan)}
                className={`bg-white/95 backdrop-blur-xl rounded-3xl border transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group ${
                  isRecommended
                    ? "border-2 border-[#1C6FD9] ring-4 ring-[#1C6FD9]/12 shadow-[0_16px_40px_rgba(28,111,217,0.18)]"
                    : isFocused
                    ? "border-2 border-[#74BCFB] ring-4 ring-[#74BCFB]/20 shadow-[0_12px_32px_rgba(28,111,217,0.12)]"
                    : "border-gray-200/80 hover:border-[#74BCFB]/60 shadow-[0_4px_24px_rgba(10,61,115,0.06)] hover:shadow-[0_12px_36px_rgba(10,61,115,0.1)] hover:-translate-y-0.5"
                }`}
              >
                {/* Recommended Badge on Top Edge */}
                {isRecommended && (
                  <div className="absolute -top-3 left-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border-2 border-white z-10">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Rank 1 Recommended</span>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isRecommended
                            ? "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40"
                            : "bg-[#F0F6FC] text-[#4A5B70] border-gray-200/80"
                        }`}
                      >
                        {plan.planType.replace(/_/g, " ")}
                      </span>

                      <span
                        className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          plan.criticalEventProtected === "YES"
                            ? "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]"
                            : plan.criticalEventProtected === "RISKY"
                            ? "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]"
                            : "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30"
                        }`}
                      >
                        {plan.criticalEventProtected === "YES" ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        <span>Protected: {plan.criticalEventProtected}</span>
                      </span>
                    </div>

                    <div className="min-h-[50px] flex items-center">
                      <h3 className="font-sans font-black text-lg text-[#0F1B2B] leading-snug line-clamp-2">
                        {plan.label}
                      </h3>
                    </div>
                  </div>

                  {/* 2x2 Key Metrics Tiles */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Stat 1: Net Financial Impact */}
                    <div className="bg-gradient-to-br from-[#F8FBFF] to-[#F1F7FD] p-3 rounded-2xl border border-[#74BCFB]/30 shadow-2xs space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A5B70] flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-[#1C6FD9]" /> Net Cost
                      </span>
                      <div
                        className={`text-base font-black tracking-tight ${
                          plan.netAdditionalCost <= 0 ? "text-emerald-600" : "text-[#0F1B2B]"
                        }`}
                      >
                        {plan.netAdditionalCost <= 0
                          ? `-₹${Math.abs(plan.netAdditionalCost).toLocaleString()} (Refund)`
                          : `+₹${plan.netAdditionalCost.toLocaleString()}`}
                      </div>
                      <span className="text-[10px] text-[#4A5B70] block truncate font-medium">
                        New: ₹{plan.additionalCost.toLocaleString()} • Ref: ₹{plan.refundAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Stat 2: Arrival & Cushion */}
                    <div className="bg-gradient-to-br from-[#F8FBFF] to-[#F1F7FD] p-3 rounded-2xl border border-[#74BCFB]/30 shadow-2xs space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A5B70] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#1C6FD9]" /> Arrival
                      </span>
                      <div className="text-base font-black text-[#0F1B2B] tracking-tight">
                        {plan.arrivalTime}
                      </div>
                      <span
                        className={`text-[10px] font-bold block ${
                          plan.bufferRisk === "HIGH"
                            ? "text-red-600"
                            : plan.bufferRisk === "MEDIUM"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        +{plan.bufferMinutes}m buffer ({plan.bufferRisk})
                      </span>
                    </div>
                  </div>

                  {/* Feasibility, Luggage & Trade-off */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#F8FBFF] to-white border border-gray-100 shadow-2xs">
                      <span className="text-[#4A5B70] font-bold">Feasibility:</span>
                      <span
                        className={`font-black text-[11px] px-2.5 py-0.5 rounded-full border ${
                          plan.feasibility === "RECOVERABLE"
                            ? "text-[#047857] bg-[#E6FBF7] border-[#A7F3D0]"
                            : plan.feasibility === "AT_RISK"
                            ? "text-[#B45309] bg-[#FFF9E6] border-[#FDE68A]"
                            : "text-[#C13A1F] bg-[#FFECEC] border-[#FF5A5A]/30"
                        }`}
                      >
                        {plan.feasibility === "RECOVERABLE"
                          ? "✓ 100% Feasible"
                          : plan.feasibility === "AT_RISK"
                          ? "⚠ Tight Connection"
                          : "✕ Infeasible Window"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#EAF5FF]/70 border border-[#74BCFB]/30 text-[11.5px] text-[#0A3D73] leading-relaxed flex items-start gap-2 min-h-[44px] shadow-2xs">
                      <Briefcase className="w-3.5 h-3.5 text-[#1C6FD9] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong className="text-[#0F1B2B] font-bold">Luggage: </strong>
                        {plan.luggageNotes ||
                          (plan.luggageHandled
                            ? "Proceed with cabin baggage; checked bags forwarded."
                            : "Carry bags directly on rapid transit.")}
                      </span>
                    </div>

                    {/* Trade-off summary */}
                    <div className="p-3 rounded-2xl bg-[#FFFBEB]/80 border border-[#FDE68A] text-[11.5px] text-[#92400E] leading-snug min-h-[46px] flex items-start gap-2 shadow-2xs">
                      <Scale className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#78350F] font-bold">Trade-off: </strong>
                        {plan.tradeOffSummary}
                      </span>
                    </div>
                  </div>

                  {/* Primary Highlight Action Step (Compact Preview) */}
                  {hasActions && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F8FBFF] to-white border border-[#74BCFB]/30 shadow-2xs space-y-1.5 min-h-[72px] flex flex-col justify-center">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#4A5B70]">
                        <span className="uppercase tracking-wider font-black text-[#1C6FD9]">Primary Action</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-[#74BCFB]/40 text-[#1C6FD9] shadow-2xs">
                          Step 1 of {plan.actions.length}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#0F1B2B] leading-snug line-clamp-2">
                        {plan.actions[0].description}
                      </p>
                    </div>
                  )}

                  {/* Expandable Step-by-Step Blueprint & Live Options */}
                  {hasActions && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleActions(plan.id)}
                        className="w-full flex items-center justify-between py-2 text-xs font-black text-[#1C6FD9] hover:text-[#1558B0] border-t border-gray-100 transition-colors cursor-pointer group/btn"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                          <span>
                            {areActionsExpanded
                              ? "Hide Blueprint Details"
                              : `Show All Steps (${plan.actions.length})${hasLive ? " & Live API Data" : ""}`}
                          </span>
                        </span>
                        {areActionsExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {areActionsExpanded && (
                        <div className="space-y-3 pt-2 text-xs animate-in fade-in duration-200">
                          {/* Live api alternatives if present */}
                          {hasLive && plan.liveRecommendation && (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#E6FBF7] to-[#F0FDF4] border border-[#A7F3D0] shadow-xs space-y-2.5">
                              <div className="flex items-center justify-between text-[11px] font-black text-[#047857]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                  <span>{plan.liveRecommendation.headline}</span>
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {plan.liveRecommendation.availableAlternatives.map((alt) => (
                                  <div
                                    key={alt.id}
                                    className="p-2.5 rounded-xl bg-white/95 border border-[#A7F3D0]/60 text-[11px] flex items-center justify-between shadow-2xs hover:border-[#10B981] transition-colors"
                                  >
                                    <div>
                                      <span className="font-bold text-[#0F1B2B] block">
                                        {alt.number} — {alt.name}
                                      </span>
                                      <span className="text-[10px] text-[#4A5B70] font-medium">
                                        🕒 {alt.departureTime} ➔ {alt.arrivalTime} • {alt.status}
                                      </span>
                                    </div>
                                    <span className="font-black text-[#0F1B2B]">
                                      ₹{alt.cost.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Steps */}
                          <div className="space-y-2">
                            {plan.actions.map((act, stepIdx) => (
                              <div
                                key={stepIdx}
                                className="p-3 rounded-2xl bg-[#F8FBFF] border border-[#74BCFB]/25 shadow-2xs text-xs space-y-1.5 hover:border-[#1C6FD9]/50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1C6FD9] to-[#2563EB] text-white flex items-center justify-center font-black text-[9px] shadow-2xs">
                                      {stepIdx + 1}
                                    </span>
                                    <span
                                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getActionBadgeColor(
                                        act.actionType
                                      )}`}
                                    >
                                      {act.actionType}
                                    </span>
                                  </div>
                                  {act.newSchedule && (
                                    <span className="text-[10px] font-mono font-bold text-[#1C6FD9] bg-[#EAF5FF] px-2 py-0.5 rounded-md border border-[#74BCFB]/30">
                                      {act.newSchedule.start} – {act.newSchedule.end}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11.5px] font-bold text-[#0F1B2B] leading-snug">
                                  {act.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expandable 13-Factor Scoring */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleFactors(plan.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-bold text-[#4A5B70] hover:text-[#0F1B2B] border-t border-gray-100 transition-colors cursor-pointer group/fac"
                    >
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-[#1C6FD9]" />
                        <span>13-Factor Algorithmic Breakdown</span>
                      </span>
                      {areFactorsExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {areFactorsExpanded && (
                      <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100 text-[11px] animate-in fade-in duration-200">
                        {plan.scores.map((sc, i) => {
                          const gradeColor =
                            sc.grade === "EXCELLENT"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : sc.grade === "GOOD"
                              ? "text-[#1C6FD9] bg-[#EAF5FF] border-[#74BCFB]/40"
                              : sc.grade === "WARNING"
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-red-700 bg-red-50 border-red-200";

                          const barWidth =
                            sc.grade === "EXCELLENT"
                              ? "w-full bg-emerald-500"
                              : sc.grade === "GOOD"
                              ? "w-3/4 bg-[#1C6FD9]"
                              : sc.grade === "WARNING"
                              ? "w-1/2 bg-amber-500"
                              : "w-1/4 bg-red-500";

                          return (
                            <div
                              key={i}
                              className="p-2 rounded-xl bg-[#F8FBFF] border border-gray-100 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-[#0F1B2B]">
                                <span className="font-semibold">{sc.factor}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#4A5B70]">{String(sc.value)}</span>
                                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${gradeColor}`}>
                                    {sc.grade}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barWidth}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="p-5 pt-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onFocusPlan?.(plan);
                      onSelectPlan(plan);
                    }}
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      isRecommended
                        ? "bg-gradient-to-r from-[#1C6FD9] via-[#2176E5] to-[#2563EB] hover:from-[#1558B0] hover:to-[#1D4ED8] text-white shadow-[0_6px_20px_rgba(28,111,217,0.35)] hover:shadow-[0_8px_25px_rgba(28,111,217,0.45)] hover:scale-[1.01] active:scale-[0.98]"
                        : "bg-gradient-to-r from-[#0F1B2B] to-[#1E293B] hover:from-[#1C6FD9] hover:to-[#2563EB] text-white shadow-sm hover:shadow-[0_4px_16px_rgba(28,111,217,0.25)] hover:scale-[1.01] active:scale-[0.98]"
                    }`}
                  >
                    <span>Apply This Recovery Solution</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
