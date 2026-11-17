"use client";

import React, { useState } from "react";
import {
  Plane,
  PlaneTakeoff,
  Train,
  Bus,
  Car,
  Building2,
  CalendarX,
  CloudLightning,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  AlertTriangle,
  Layers,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { BENCHMARK_SCENARIOS, BenchmarkScenario } from "@/core/dataset/disruptionBenchmarks";
import { DisruptionEvent } from "@/types";

interface ScenarioPickerProps {
  activeDisruption: DisruptionEvent | null | undefined;
  onSelectScenario: (scenarioId: number) => void;
  onClearDisruption?: () => void;
  isLoading: boolean;
}

interface ScenarioPresentation {
  title: string;
  category: "AVIATION_RAIL" | "ROAD_TRANSFER" | "HOTEL_ACTIVITY" | "WEATHER_DYNAMIC";
  modeName: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  engineGoal: string;
  highlightBenefit: string;
}

const SCENARIO_PRESENTATION: Record<number, ScenarioPresentation> = {
  1: {
    title: "Flight Departure Delay",
    category: "AVIATION_RAIL",
    modeName: "Aviation",
    Icon: PlaneTakeoff,
    iconColor: "text-[#1C6FD9]",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    engineGoal: "Proposes 4 alternatives with layover buffer preservation",
    highlightBenefit: "Protects arrival deadlines against ATC & weather holds",
  },
  2: {
    title: "Flight Cancellation & Grounding",
    category: "AVIATION_RAIL",
    modeName: "Aviation",
    Icon: Plane,
    iconColor: "text-[#C13A1F]",
    iconBg: "bg-red-50",
    iconBorder: "border-red-200",
    engineGoal: "Excludes cancelled flight and swaps to high-speed rail, bus, or cab",
    highlightBenefit: "Full multimodal corridor reroute without air dependency",
  },
  3: {
    title: "Express Rail Track Delay",
    category: "AVIATION_RAIL",
    modeName: "Railways",
    Icon: Train,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    iconBorder: "border-indigo-200",
    engineGoal: "Detects signal congestion and generates 4 non-rail bypass options",
    highlightBenefit: "Bypasses jammed rail sections to protect onward hotel check-in",
  },
  4: {
    title: "Train Corridor Cancellation",
    category: "AVIATION_RAIL",
    modeName: "Railways",
    Icon: Train,
    iconColor: "text-[#C13A1F]",
    iconBg: "bg-red-50",
    iconBorder: "border-red-200",
    engineGoal: "Blocks rail route entirely and generates flight, bus, or private cab",
    highlightBenefit: "Complete railway corridor bypass with zero delay cascade",
  },
  5: {
    title: "Volvo Bus Highway Delay",
    category: "ROAD_TRANSFER",
    modeName: "Highway Bus",
    Icon: Bus,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-200",
    engineGoal: "Recognizes non-rail terrain (e.g. Ghats) and strictly excludes trains",
    highlightBenefit: "Terrain-aware routing with verified physical road constraints",
  },
  6: {
    title: "Intercity Bus Breakdown",
    category: "ROAD_TRANSFER",
    modeName: "Highway Bus",
    Icon: Bus,
    iconColor: "text-[#C13A1F]",
    iconBg: "bg-red-50",
    iconBorder: "border-red-200",
    engineGoal: "Excludes coach operator and dispatches emergency cab or rail options",
    highlightBenefit: "Rapid same-day recovery for stranded highway passengers",
  },
  7: {
    title: "Tight Layover Missed Connection",
    category: "ROAD_TRANSFER",
    modeName: "Intercity Transfer",
    Icon: RefreshCw,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    iconBorder: "border-violet-200",
    engineGoal: "Recovers connection without proposing illogical short-hop flights (<150km)",
    highlightBenefit: "Sensible local ground transit substitution",
  },
  8: {
    title: "Hotel Room Overbooking",
    category: "HOTEL_ACTIVITY",
    modeName: "Hospitality",
    Icon: Building2,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-200",
    engineGoal: "Excludes the overbooked property and secures comparable 4-star stays nearby",
    highlightBenefit: "Automated same-day rebooking with proximity preservation",
  },
  9: {
    title: "Airport Chauffeur Transfer Failure",
    category: "ROAD_TRANSFER",
    modeName: "Local Cab",
    Icon: Car,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-200",
    engineGoal: "Substitutes failed taxi with express bus or private ride alternatives",
    highlightBenefit: "Guarantees reliable last-mile connection to terminal",
  },
  10: {
    title: "Activity & Excursion Conflict",
    category: "HOTEL_ACTIVITY",
    modeName: "Experiences",
    Icon: CalendarX,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    iconBorder: "border-teal-200",
    engineGoal: "Excludes cancelled activity and suggests thematic heritage/nature equivalents",
    highlightBenefit: "Preserves vacation itinerary with equivalent experiences",
  },
  11: {
    title: "Severe Monsoon & Road Closure",
    category: "WEATHER_DYNAMIC",
    modeName: "Severe Weather",
    Icon: CloudLightning,
    iconColor: "text-[#C13A1F]",
    iconBg: "bg-red-50",
    iconBorder: "border-red-200",
    engineGoal: "Digital twin blocks all road corridors during active flood/landslide risk",
    highlightBenefit: "Zero-risk safety enforcement against impassable mountain passes",
  },
  12: {
    title: "Mid-Journey Preference Reroute",
    category: "WEATHER_DYNAMIC",
    modeName: "Copilot AI",
    Icon: SlidersHorizontal,
    iconColor: "text-[#1C6FD9]",
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    engineGoal: "Dynamically re-ranks 4 recovery plans based on updated cost/speed priorities",
    highlightBenefit: "Real-time Pareto utility adaptation without restarting trip",
  },
};

type CategoryFilter = "ALL" | "AVIATION_RAIL" | "ROAD_TRANSFER" | "HOTEL_ACTIVITY" | "WEATHER_DYNAMIC";

const CATEGORY_TABS: { id: CategoryFilter; label: string; count: number; Icon: React.ElementType }[] = [
  { id: "ALL", label: "All Scenarios", count: 12, Icon: Layers },
  { id: "AVIATION_RAIL", label: "Flights & Railways", count: 4, Icon: Plane },
  { id: "ROAD_TRANSFER", label: "Buses & Transfers", count: 4, Icon: Bus },
  { id: "HOTEL_ACTIVITY", label: "Hotels & Activities", count: 2, Icon: Building2 },
  { id: "WEATHER_DYNAMIC", label: "Weather & Copilot", count: 2, Icon: CloudLightning },
];

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  activeDisruption,
  onSelectScenario,
  onClearDisruption,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");

  const filteredScenarios = BENCHMARK_SCENARIOS.filter((sc) => {
    if (selectedCategory === "ALL") return true;
    const meta = SCENARIO_PRESENTATION[sc.numericId];
    return meta?.category === selectedCategory;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "MEDIUM-HIGH":
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6">
      {/* Header & Meta Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-[#0F1B2B] tracking-tight">
              Disruption Benchmark Center
            </h3>
            <span className="text-[11px] font-bold text-[#0F1B2B] bg-[#FFF9E6] px-3 py-1 rounded-full border border-[#FDE68A]">
              12 NUGEN Benchmarks
            </span>
            <span className="text-[11px] font-bold text-[#047857] bg-[#E6FBF7] px-3 py-1 rounded-full border border-[#A7F3D0] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Modal Validated</span>
            </span>
          </div>
          <p className="text-xs text-[#4A5B70] font-medium mt-1.5 max-w-3xl leading-relaxed">
            Stress-test recovery intelligence against real operational transit failures across Indian aviation, railway corridors, mountain highways, and hospitality.
          </p>
        </div>

        {activeDisruption && (
          <div className="text-xs flex items-center gap-2.5 bg-blue-50 text-[#1C6FD9] px-4 py-2 rounded-2xl border border-blue-200 font-bold shrink-0 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C6FD9] animate-ping" />
            <span>
              Simulating: {activeDisruption.type} (Scenario DS_{String(activeDisruption.scenarioId || 1).padStart(3, "0")})
            </span>
            <a
              href="#impact"
              className="px-2.5 py-1 rounded-lg bg-[#1C6FD9] hover:bg-[#1558B0] text-white text-[11px] font-bold transition-all shadow-xs"
            >
              View Impact & Recovery ↓
            </a>
            <button
              type="button"
              onClick={() => {
                if (onClearDisruption) onClearDisruption();
                else onSelectScenario(Number(activeDisruption.scenarioId || 1));
              }}
              disabled={isLoading}
              className="ml-1 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#0F1B2B] border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-bold shadow-2xs"
              title="Reset and clear disruption"
            >
              <RotateCcw className="w-3 h-3 text-[#1C6FD9]" />
              <span>Reset Disruption</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((tab) => {
          const TabIcon = tab.Icon;
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                isSelected
                  ? "bg-[#1C6FD9] text-white border-[#1C6FD9] shadow-[0_4px_14px_rgba(28,111,217,0.3)]"
                  : "bg-white/90 text-[#4A5B70] border-gray-200 hover:border-[#74BCFB] hover:text-[#0F1B2B] hover:bg-[#F8FBFF]"
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#1C6FD9]"}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                  isSelected
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-gray-100 text-[#4A5B70] border-gray-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Benchmark Scenarios Grid - Generous 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((sc) => {
          const isActive =
            !!activeDisruption &&
            (Number(activeDisruption.scenarioId) === Number(sc.numericId) ||
              activeDisruption.id === `sc-${sc.numericId}` ||
              activeDisruption.id === `sc-${sc.scenarioId}`);
          const meta = SCENARIO_PRESENTATION[sc.numericId] || {
            title: sc.disruptionType.replace(/_/g, " "),
            category: "AVIATION_RAIL",
            modeName: sc.affectedBookingType,
            Icon: AlertTriangle,
            iconColor: "text-[#1C6FD9]",
            iconBg: "bg-blue-50",
            iconBorder: "border-blue-200",
            engineGoal: sc.validationSummary,
            highlightBenefit: sc.downstreamImpact,
          };
          const CardIcon = meta.Icon;

          return (
            <div
              key={sc.scenarioId}
              onClick={() => {
                if (isActive) {
                  if (onClearDisruption) onClearDisruption();
                  else onSelectScenario(sc.numericId);
                } else {
                  onSelectScenario(sc.numericId);
                }
              }}
              className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 relative group cursor-pointer ${
                isActive
                  ? "bg-gradient-to-b from-[#EBF5FF] via-white to-white border-2 border-[#1C6FD9] ring-4 ring-[#1C6FD9]/15 shadow-[0_12px_36px_rgba(28,111,217,0.22)] translate-y-[-2px]"
                  : "bg-white/95 backdrop-blur-md border-[#74BCFB]/30 hover:border-[#1C6FD9]/60 hover:bg-[#FDFEFF] shadow-[0_4px_20px_rgba(10,61,115,0.04)] hover:shadow-[0_12px_28px_rgba(10,61,115,0.08)] hover:translate-y-[-2px]"
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#1C6FD9] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Active Simulation</span>
                </div>
              )}

              <div className="space-y-3.5">
                {/* Top Metadata Row: Mode + Benchmark ID + Severity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${meta.iconBg} ${meta.iconBorder} ${meta.iconColor} shadow-2xs`}>
                      <CardIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#0F1B2B]">
                      {meta.modeName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onClearDisruption) onClearDisruption();
                          else onSelectScenario(sc.numericId);
                        }}
                        disabled={isLoading}
                        className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F1B2B] text-[10px] font-bold flex items-center gap-1 border border-slate-300 transition-all cursor-pointer shadow-2xs"
                        title="Reset this disruption"
                      >
                        <RotateCcw className="w-2.5 h-2.5 text-[#1C6FD9]" />
                        <span>Reset</span>
                      </button>
                    )}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {sc.scenarioId}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getSeverityStyle(sc.defaultSeverity)}`}>
                      {sc.defaultSeverity}
                    </span>
                  </div>
                </div>

                {/* Scenario Title - Clean, Descriptive, No Hashtags */}
                <div>
                  <h4 className="font-sans font-extrabold text-base text-[#0F1B2B] leading-snug group-hover:text-[#1C6FD9] transition-colors">
                    {meta.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A5B70] mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1C6FD9] shrink-0" />
                    <span className="truncate">{sc.exampleRoute}</span>
                    {sc.exampleProvider && (
                      <span className="text-[11px] font-medium text-gray-400">
                        • {sc.exampleProvider}
                      </span>
                    )}
                  </div>
                </div>

                {/* Operational Cause & Risk Context */}
                <div className="space-y-1.5 bg-[#F8FBFF] p-3 rounded-2xl border border-[#74BCFB]/20 text-xs">
                  <div>
                    <span className="font-bold text-[#0F1B2B]">Root Cause: </span>
                    <span className="text-[#4A5B70] font-medium">{sc.typicalCause}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#0F1B2B]">Downstream Risk: </span>
                    <span className="text-[#4A5B70] font-medium">{sc.downstreamImpact}</span>
                  </div>
                </div>

                {/* AI Engine Benchmark Guarantee */}
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#1C6FD9] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#0F1B2B] block">
                      AI Recovery Target:
                    </span>
                    <span className="text-[#4A5B70] font-medium leading-relaxed block">
                      {meta.engineGoal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) {
                      if (onClearDisruption) onClearDisruption();
                      else onSelectScenario(sc.numericId);
                    } else {
                      onSelectScenario(sc.numericId);
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 hover:bg-slate-200 text-[#0F1B2B] border border-slate-300 shadow-2xs group/btn"
                      : "bg-[#1C6FD9] hover:bg-[#1558B0] text-white shadow-sm"
                  }`}
                >
                  {isActive ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-[#1C6FD9] group-hover/btn:-rotate-45 transition-transform" />
                      <span>Reset Disruption</span>
                    </>
                  ) : (
                    <>
                      <span>Simulate Disruption</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
