"use client";

import React from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  Clock,
  ArrowRight,
  Luggage,
  X,
} from "lucide-react";
import { ImpactAnalysis, DisruptionEvent } from "@/types";

interface ImpactAnalysisViewProps {
  impact: ImpactAnalysis;
  disruption: DisruptionEvent;
  onClearDisruption?: () => void;
}

export const ImpactAnalysisView: React.FC<ImpactAnalysisViewProps> = ({
  impact,
  disruption,
  onClearDisruption,
}) => {
  if (!impact || !impact.feasibility || !disruption) return null;

  const disruptionType = (disruption.type || "").toUpperCase();
  const critical = impact.criticalEventsAtRisk?.[0];

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6">
      <div className="space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <span className="font-sans text-2xl font-extrabold text-[#0F1B2B] tracking-tight">
                Impact & Ripple Analysis
              </span>
              <span
                className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                  impact.feasibility === "RECOVERABLE"
                    ? "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]"
                    : impact.feasibility === "AT_RISK"
                    ? "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]"
                    : "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30"
                }`}
              >
                Feasibility: {impact.feasibility}
              </span>
            </div>
            <p className="text-xs text-[#4A5B70] font-medium mt-0.5">
              Deterministic graph traversal maps directly affected bookings and cascading downstream buffers.
            </p>
          </div>

          {onClearDisruption && (
            <button
              type="button"
              onClick={onClearDisruption}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-[#4A5B70] hover:text-red-700 border border-gray-200 hover:border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
              title="Clear disruption and reset trip to normal"
            >
              <X className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Disruption</span>
            </button>
          )}
        </div>

        {/* Real-time live data mitigation advisory (animated pulse dot only, no static green dot) */}
        {(disruptionType.includes("TRAIN") || disruptionType.includes("FLIGHT")) && (
          <div className="bg-[#E6FBF7]/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#065F46]">
                  Live {disruptionType.includes("TRAIN") ? "IRCTC Railway" : "Aviation"} Data Sync Active
                </span>
              </div>
              <p className="text-xs text-[#065F46] font-medium">
                {disruptionType.includes("TRAIN")
                  ? "Our live timetable engine has queried real-time available alternative trains on this corridor. Verified parallel trains with confirmed berths are prepared below."
                  : "Our live flight engine has retrieved real-time alternative flights and high-speed rail bypass options. Verified alternatives are prepared below."}
              </p>
            </div>
            <a
              href="#recovery"
              className="py-2 px-3.5 text-xs font-extrabold bg-[#10B981] hover:bg-[#059669] text-white rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>View Real-Time Alternatives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Critical Event in Jeopardy Card */}
        {critical && (
          <div
            className={`p-6 rounded-3xl border transition-all ${
              impact.feasibility === "IMPOSSIBLE"
                ? "bg-gradient-to-b from-red-50/70 via-white to-white border-red-200 ring-1 ring-red-200 shadow-sm"
                : "bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-200 ring-1 ring-amber-200 shadow-sm"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-[#FF5A5A] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> Critical Event at Risk
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#0F1B2B] border border-gray-200 shadow-2xs">
                    Buffer Risk: {critical.riskLevel}
                  </span>
                </div>

                <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-[#0F1B2B] tracking-tight">
                  {critical.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#4A5B70]">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    Scheduled Start: <strong className="text-[#0F1B2B]">{critical.scheduledTime}</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    Est. Arrival: <strong className="text-[#FF5A5A]">{critical.estimatedArrival}</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    Remaining Cushion: <strong className="text-[#FF5A5A]">{critical.bufferMinutes} minutes</strong>
                  </span>
                </div>

                {critical.luggageIssue && (
                  <div className="mt-3 flex items-start gap-2.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-xs text-[#0F1B2B]">
                    <Luggage className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900">Luggage Constraint Detected:</span>
                      <p className="mt-0.5 text-[#4A5B70] font-medium">{critical.luggageAdvice}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-72 bg-white/90 p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#4A5B70]">Buffer Erosion</span>
                  <span
                    className={
                      critical.bufferMinutes < 15
                        ? "text-red-600"
                        : critical.bufferMinutes < 45
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }
                  >
                    {critical.bufferMinutes} min remaining
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      critical.bufferMinutes < 15
                        ? "bg-red-500"
                        : critical.bufferMinutes < 45
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, (critical.bufferMinutes / 90) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-[#4A5B70] font-medium block">
                  Original buffer cushion was 90m before disruption.
                </span>
              </div>
            </div>

            {impact.feasibility === "IMPOSSIBLE" && impact.impossibleReason && (
              <div className="mt-5 pt-4 border-t border-red-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <ShieldX className="w-4 h-4" />
                  <span>Deterministic Engine Notice: Physical Attendance Unreachable</span>
                </div>
                <p className="text-xs text-[#4A5B70] font-medium">{impact.impossibleReason}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  {impact.fallbacks?.map((fb, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-red-100 text-xs font-semibold text-[#0F1B2B] shadow-2xs"
                    >
                      • {fb}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Impact Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F8FBFF] p-5 rounded-2xl border border-[#74BCFB]/30 shadow-xs space-y-2.5">
            <h4 className="font-sans font-extrabold text-sm text-[#0F1B2B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Directly Affected Bookings ({(impact.directImpact || []).length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {(impact.directImpact || []).map((id) => (
                <span key={id} className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {id}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#4A5B70] font-medium">
              These items were directly hit by the {(disruption?.type || "disruption").replace(/_/g, " ").toLowerCase()}.
            </p>
          </div>

          <div className="bg-[#F8FBFF] p-5 rounded-2xl border border-[#74BCFB]/30 shadow-xs space-y-2.5">
            <h4 className="font-sans font-extrabold text-sm text-[#0F1B2B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Downstream Ripple Effect ({(impact.downstreamImpact || []).length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {(impact.downstreamImpact || []).map((id) => (
                <span key={id} className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  {id}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#4A5B70] font-medium">
              Cascading connection squeeze calculated across dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
