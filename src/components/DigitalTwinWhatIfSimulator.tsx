"use client";

import React, { useState, useEffect } from "react";
import {
  CloudRain,
  Thermometer,
  Clock,
  Sparkles,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Newspaper,
  Layers,
  ArrowRight,
  Scale,
  RefreshCw,
  ExternalLink,
  MapPin,
  TrendingUp,
} from "lucide-react";
import type { TripSnapshot } from "@/types";
import type { SimulatedWeatherImpact } from "@/core/RecoveryEngine";
import type { WeatherNewsHeadline } from "@/core/social/fetchWeatherNews";
import { NugenModelComparisonModal } from "./NugenModelComparisonModal";

interface DigitalTwinWhatIfSimulatorProps {
  trip: TripSnapshot;
  onSimulatedImpactChange?: (impact: SimulatedWeatherImpact | null) => void;
}

export function DigitalTwinWhatIfSimulator({
  trip,
  onSimulatedImpactChange,
}: DigitalTwinWhatIfSimulatorProps) {
  // Select initial transit item
  const transitItems = (trip.items || []).filter(
    (it) =>
      it.type === "TRAIN" ||
      it.type === "FLIGHT" ||
      it.type === "BUS" ||
      it.type === "TRANSFER"
  );
  const defaultBookingId = transitItems[0]?.id || trip.items?.[0]?.id || "";

  const [selectedBookingId, setSelectedBookingId] = useState<string>(defaultBookingId);
  const [rainfallMm, setRainfallMm] = useState<number>(35);
  const [tempC, setTempC] = useState<number>(27);
  const [stormDurationHrs, setStormDurationHrs] = useState<number>(2);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulatedWeatherImpact | null>(null);
  const [headlines, setHeadlines] = useState<WeatherNewsHeadline[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Update selected booking if trip changes
  useEffect(() => {
    if (!selectedBookingId && defaultBookingId) {
      setSelectedBookingId(defaultBookingId);
    }
  }, [defaultBookingId, selectedBookingId]);

  // Load live weather from OpenWeather to auto-populate form
  const handleLoadLiveWeather = async () => {
    setIsLoadingLiveWeather(true);
    try {
      const city = trip.source || trip.destination || "Mumbai";
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data?.weather) {
        setRainfallMm(data.weather.rainfall ?? 0);
        setTempC(Math.round(data.weather.temperature ?? 27));
        setStormDurationHrs(1);
      }
    } catch (e) {
      console.warn("Failed to load live weather for simulation:", e);
    } finally {
      setIsLoadingLiveWeather(false);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);

    try {
      const activeItem = trip.items.find((it) => it.id === selectedBookingId);
      const city =
        activeItem?.departureLocation ||
        activeItem?.arrivalLocation ||
        trip.source ||
        trip.destination ||
        "Mumbai";

      const res = await fetch("/api/digital-twin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          rainfallMm,
          tempC,
          stormDurationHrs,
          tripId: trip.id,
          city,
        }),
      });

      const data = await res.json();
      if (data?.success && data.impact) {
        setSimulationResult(data.impact);
        setHeadlines(data.headlines || []);
        if (onSimulatedImpactChange) {
          onSimulatedImpactChange(data.impact);
        }
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const confidenceBadgeColor =
    simulationResult?.confidence === "high"
      ? "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]"
      : simulationResult?.confidence === "medium"
      ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
      : "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40";

  const riskBg =
    (simulationResult?.probability || 0) >= 0.6
      ? "from-red-50/70 via-white to-red-50/30 border-red-200"
      : (simulationResult?.probability || 0) >= 0.3
      ? "from-amber-50/70 via-white to-amber-50/30 border-amber-200"
      : "from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200";

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6 text-[#0F1B2B]">
      {/* Top Header */}
      <div className="border-b border-gray-100 pb-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#1C6FD9] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C6FD9]">
                Digital Twin &bull; In-Memory What-If Simulation
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0]">
                Safe Cloned State (Zero Trip Writes)
              </span>
            </div>
            <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-[#0F1B2B] tracking-tight">
              Meteorological Disruption Ripple Simulator
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F7FF] border border-gray-200/90 hover:border-[#74BCFB] text-[#0F1B2B] hover:text-[#1C6FD9] text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              title="Prove Nugen Alignment Chain"
            >
              <Scale className="w-3.5 h-3.5 text-[#1C6FD9]" />
              <span>Prove Alignment</span>
            </button>

            <button
              type="button"
              onClick={handleLoadLiveWeather}
              disabled={isLoadingLiveWeather}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F7FF] border border-gray-200/90 hover:border-[#74BCFB] text-[#0F1B2B] hover:text-[#1C6FD9] text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 active:scale-[0.98]"
              title="Pull real live weather into inputs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1C6FD9] ${isLoadingLiveWeather ? "animate-spin" : ""}`} />
              <span>{isLoadingLiveWeather ? "Fetching..." : "Load Live Weather"}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#4A5B70] max-w-3xl leading-relaxed font-medium">
          Propagate storm severity along the <code className="text-[#1C6FD9] bg-[#EAF5FF] px-1.5 py-0.5 rounded font-mono text-[11px] border border-[#74BCFB]/30">dependsOn</code> booking graph. Gemini Agent predicts delay probabilities, buffer erosion, and real-time news telemetry.
        </p>
      </div>

      {/* Input Form */}
      {(() => {
        const rainfallPercent = Math.min(100, Math.max(0, ((rainfallMm - 0) / (90 - 0)) * 100));
        const tempPercent = Math.min(100, Math.max(0, ((tempC - 10) / (50 - 10)) * 100));
        const durationPercent = Math.min(100, Math.max(0, ((stormDurationHrs - 1) / (8 - 1)) * 100));

        return (
          <form onSubmit={handleRunSimulation} className="bg-gradient-to-br from-[#F8FBFF] via-white to-[#F0F6FC] p-4 sm:p-5 rounded-3xl border border-[#74BCFB]/30 shadow-xs space-y-4">
            {/* 4 Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Input 1: Target Booking */}
              <div className="bg-white/90 p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:border-[#74BCFB]/60 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F1B2B] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1C6FD9]" />
                    <span>Target Booking</span>
                  </label>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/30">
                    Root Node
                  </span>
                </div>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FBFF] hover:bg-white border border-gray-200 text-xs font-semibold text-[#0F1B2B] outline-none cursor-pointer focus:border-[#1C6FD9] focus:ring-2 focus:ring-[#1C6FD9]/20 shadow-2xs transition-all"
                >
                  {trip.items.map((it) => (
                    <option key={it.id} value={it.id}>
                      [{it.type}] {it.title.slice(0, 28)}...
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#4A5B70] block font-mono">
                  Traverses dependsOn graph
                </span>
              </div>

              {/* Input 2: Rainfall */}
              <div className="bg-white/90 p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:border-[#74BCFB]/60 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F1B2B] flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-[#1C6FD9]" />
                    <span>Rainfall</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/30">
                    {rainfallMm} mm/h
                  </span>
                </div>
                <div className="py-1">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={rainfallMm}
                    onChange={(e) => setRainfallMm(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #1C6FD9 0%, #1C6FD9 ${rainfallPercent}%, #E2E8F0 ${rainfallPercent}%, #E2E8F0 100%)`,
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#1C6FD9] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#4A5B70] font-medium font-mono">
                  <span>0 (Dry)</span>
                  <span>30 (Heavy)</span>
                  <span>90 (Cloudburst)</span>
                </div>
              </div>

              {/* Input 3: Temperature */}
              <div className="bg-white/90 p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:border-amber-300/60 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F1B2B] flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Temperature</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                    {tempC}°C
                  </span>
                </div>
                <div className="py-1">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #D97706 0%, #D97706 ${tempPercent}%, #E2E8F0 ${tempPercent}%, #E2E8F0 100%)`,
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#D97706] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#4A5B70] font-medium font-mono">
                  <span>10° (Cool)</span>
                  <span>32° (Warm)</span>
                  <span>50° (Extreme)</span>
                </div>
              </div>

              {/* Input 4: Storm Duration */}
              <div className="bg-white/90 p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs hover:border-purple-300/60 transition-all flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F1B2B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7E22CE]" />
                    <span>Storm Duration</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                    {stormDurationHrs} hrs
                  </span>
                </div>
                <div className="py-1">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={stormDurationHrs}
                    onChange={(e) => setStormDurationHrs(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #7E22CE 0%, #7E22CE ${durationPercent}%, #E2E8F0 ${durationPercent}%, #E2E8F0 100%)`,
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#7E22CE] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#4A5B70] font-medium font-mono">
                  <span>1 hr (Brief)</span>
                  <span>4 hrs</span>
                  <span>8 hrs (Long)</span>
                </div>
              </div>
            </div>

            {/* Dedicated Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
              <div className="flex items-center gap-2 text-xs text-[#4A5B70]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Simulates disruption ripple across booking graph without modifying real trip data</span>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1C6FD9] via-[#2176E5] to-[#2563EB] hover:from-[#1558B0] hover:to-[#1D4ED8] text-white font-black text-xs transition-all shadow-[0_4px_16px_rgba(28,111,217,0.28)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
              >
                <Zap className={`w-4 h-4 text-amber-300 ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Simulating Digital Twin..." : "Run Simulation"}</span>
              </button>
            </div>
          </form>
        );
      })()}

      {/* Simulation Results Display */}
      {simulationResult && (
        <div className={`rounded-2xl border p-5 bg-gradient-to-b ${riskBg} space-y-5 animate-fade-in shadow-xs`}>
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/70 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${confidenceBadgeColor}`}>
                  Confidence: {simulationResult.confidence}
                </span>
                <span className="text-xs text-[#4A5B70] font-mono">
                  Feasibility: <strong className="text-[#0F1B2B]">{simulationResult.feasibility}</strong>
                </span>
                {simulationResult.criticalEventAtRisk && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFECEC] text-[#C13A1F] border border-[#FF5A5A]/30 text-[10px] font-bold animate-pulse">
                    ⚠️ Critical Event Keynote At Risk
                  </span>
                )}
              </div>
              <h4 className="font-sans font-extrabold text-xl text-[#0F1B2B]">
                Simulated Disruption Impact on "{simulationResult.bookingTitle}"
              </h4>
            </div>

            {/* Probability Gauge */}
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#4A5B70]">
                  Disruption Probability
                </div>
                <div className="text-2xl font-black font-sans text-[#1C6FD9]">
                  {Math.round(simulationResult.probability * 100)}%
                </div>
              </div>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                  style={{ width: `${Math.round(simulationResult.probability * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gemini AI Explainability Box */}
          <div className="bg-gradient-to-r from-[#EAF5FF] via-white to-[#F0F6FC] border border-[#74BCFB]/40 rounded-xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C6FD9]">
              <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
              <span>Gemini Agent Physical & Downstream Explainability:</span>
            </div>
            <p className="text-xs text-[#0F1B2B] leading-relaxed font-sans font-medium">
              {simulationResult.explanation}
            </p>
          </div>

          {/* Affected Bookings Table (dependsOn Propagation) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F1B2B]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1C6FD9]" />
                Propagated Booking Ripple ({simulationResult.affectedBookings.length} Nodes Analyzed)
              </span>
              <span className="text-[10px] font-mono text-[#4A5B70]">
                Direct: {simulationResult.directImpact.length} &bull; Downstream: {simulationResult.downstreamImpact.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {simulationResult.affectedBookings.map((bk, idx) => (
                <div
                  key={bk.id}
                  className={`p-3 rounded-xl border transition-all ${
                    idx === 0
                      ? "bg-[#FFF5F5] border-red-200 shadow-2xs"
                      : bk.simulatedStatus === "NORMAL"
                      ? "bg-white border-gray-200 shadow-2xs"
                      : "bg-[#FFFDF0] border-amber-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-mono text-[#4A5B70] uppercase">
                      [{bk.type}]
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        bk.simulatedStatus === "NORMAL"
                          ? "bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0]"
                          : bk.simulatedStatus === "CANCELLED"
                          ? "bg-[#FFECEC] text-[#C13A1F] border border-[#FF5A5A]/30"
                          : "bg-[#FFF9E6] text-[#B45309] border border-[#FDE68A]"
                      }`}
                    >
                      {bk.simulatedStatus}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#0F1B2B] mt-1 truncate">
                    {bk.title}
                  </div>
                  <div className="text-[11px] text-[#4A5B70] mt-1 font-medium">
                    Delay: <strong className="text-[#B45309]">+{bk.delayMinutes}m</strong> &bull; Buffer Left:{" "}
                    <strong className="text-[#0F1B2B]">{bk.remainingBufferMinutes}m</strong>
                  </div>
                  <div className="text-[10px] text-[#4A5B70] mt-1 line-clamp-1 italic">
                    {bk.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Signal: Real-time Weather Disruption News Headlines */}
          {headlines.length > 0 && (
            <div className="border-t border-gray-200/70 pt-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#B45309]">
                <Newspaper className="w-4 h-4 text-[#B45309]" />
                <span>Live Google News Disruption Headlines (Real-Time Social Corroboration):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {headlines.map((hl, i) => (
                  <a
                    key={i}
                    href={hl.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-white hover:bg-[#F8FBFF] border border-gray-200/90 hover:border-[#74BCFB]/60 shadow-2xs transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-[#1C6FD9] font-bold mb-1">
                        {hl.source}
                      </div>
                      <div className="text-xs text-[#0F1B2B] group-hover:text-[#1C6FD9] transition-colors line-clamp-2 font-semibold leading-snug">
                        {hl.title}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#4A5B70] mt-2">
                      <span>{hl.pubDate ? new Date(hl.pubDate).toLocaleDateString() : "Recent"}</span>
                      <ExternalLink className="w-3 h-3 text-[#4A5B70] group-hover:text-[#1C6FD9]" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prove Alignment Chain Modal for Judges */}
      <NugenModelComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  );
}
