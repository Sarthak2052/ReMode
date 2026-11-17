"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CloudRain,
  Wind,
  Thermometer,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  Eye,
  Sparkles,
  RefreshCw,
  Plane,
  Train,
  Car,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FileText,
  CheckCircle2,
  Hotel,
  Star,
  Bed,
  Sun,
  Radio,
  Minus,
  Plus,
  SlidersHorizontal,
  Gauge,
  Flame,
  ShieldAlert,
  MapPin,

} from "lucide-react";
import type { TripSnapshot, ItineraryItem, Feasibility, WeatherCondition } from "@/types";
import type { NugenEvaluationResult } from "@/lib/nugenService";
import { useEmergencyHotels } from "@/hooks/useEmergencyHotels";
import type { WeatherImpactResult } from "@/core/weather/estimateWeatherImpact";


interface WeatherSimulationSandboxProps {
  trip: TripSnapshot;
  onSimulatedImpactChange?: (simulatedState: {
    rainfall: number;
    windSpeed: number;
    temperature: number;
    durationHours: number;
    feasibility: Feasibility;
    brokenLegs: string[];
    delayedLegs: { itemId: string; title: string; delayMinutes: number; reason: string }[];
    impactResult?: WeatherImpactResult;
  }) => void;
}

function formatProjectedTime(baseTime: string, delayMinutes: number): string {
  const parts = baseTime.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return "10:00";
  const [h, m] = parts;
  const totalMins = h * 60 + m + delayMinutes;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${baseTime} ➔ ${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

interface WeatherSliderProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayValue?: string;
  severityLabel: string;
  severityLevel: "normal" | "caution" | "warning" | "critical";
  accentGradient: { start: string; end: string; thumbColor: string; bgSoft: string; iconColor: string };
  onChange: (val: number) => void;
  presetChips: { label: string; value: number }[];
  cardBg?: string;
  cardBorder?: string;
}

function WeatherSliderCard({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  unit,
  displayValue,
  severityLabel,
  severityLevel,
  accentGradient,
  onChange,
  presetChips,
  cardBg = "bg-white",
  cardBorder = "border-gray-200/90",
}: WeatherSliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const severityBadgeStyles = {
    normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    caution: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
  }[severityLevel];

  return (
    <div className={`p-4 sm:p-4.5 rounded-2xl ${cardBg} ${cardBorder} border shadow-[0_2px_12px_rgba(10,61,115,0.04)] hover:shadow-[0_8px_24px_rgba(10,61,115,0.08)] hover:border-[#74BCFB]/80 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${accentGradient.bgSoft} flex items-center justify-center border border-white/70 shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon className={`w-4 h-4 ${accentGradient.iconColor}`} />
          </div>
          <div>
            <span className="font-extrabold text-xs text-[#0F1B2B] tracking-tight block">
              {label}
            </span>
            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${severityBadgeStyles}`}>
              {severityLabel}
            </span>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-1 bg-[#F0F6FC] p-1 rounded-xl border border-[#74BCFB]/30 shadow-2xs">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={value <= min}
            className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center text-[#4A5B70] hover:text-[#0F1B2B] transition-all shadow-2xs cursor-pointer"
            title={`Decrease ${label}`}
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="font-mono font-black text-xs text-[#0F1B2B] px-1.5 min-w-[56px] text-center select-none">
            {displayValue || `${value} ${unit}`}
          </span>

          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + step))}
            disabled={value >= max}
            className="w-6 h-6 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center text-[#4A5B70] hover:text-[#0F1B2B] transition-all shadow-2xs cursor-pointer"
            title={`Increase ${label}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Slider Range Track */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, ${accentGradient.start}, ${accentGradient.end} ${percentage}%, #E2E8F0 ${percentage}%, #E2E8F0 100%)`,
            }}
            className="weather-twin-slider w-full h-2.5 rounded-full appearance-none cursor-pointer transition-all focus:outline-none"
          />
        </div>

        {/* Quick Notch Presets */}
        <div className="flex items-center justify-between gap-1 pt-1">
          {presetChips.map((chip) => {
            const isActive = Math.abs(value - chip.value) < step;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChange(chip.value)}
                className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1C6FD9] text-white border-[#1C6FD9] font-bold shadow-2xs scale-105"
                    : "bg-[#F8FBFF] hover:bg-white text-[#4A5B70] hover:text-[#0F1B2B] border-gray-200/70"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WeatherSimulationSandbox({
  trip,
  onSimulatedImpactChange,
}: WeatherSimulationSandboxProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Weather Simulation Sliders State
  const [rainfall, setRainfall] = useState(0); // 0 to 80 mm/hr
  const [windSpeed, setWindSpeed] = useState(15); // 0 to 90 km/h
  const [temperature, setTemperature] = useState(28); // 15 to 50 °C
  const [visibility, setVisibility] = useState(10000); // 100 to 10000 meters
  const [durationHours, setDurationHours] = useState(2); // 1 to 8 hours

  // Primary mode state
  const initialMode: "FLIGHT" | "TRAIN" | "ROAD" =
    trip.items?.[0]?.type === "TRAIN"
      ? "TRAIN"
      : trip.items?.[0]?.type === "FLIGHT"
      ? "FLIGHT"
      : "ROAD";
  const [selectedMode, setSelectedMode] = useState<"FLIGHT" | "TRAIN" | "ROAD">(initialMode);

  // Nugen Intelligence AI evaluation state
  const [nugenResult, setNugenResult] = useState<NugenEvaluationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showPipelineDetails, setShowPipelineDetails] = useState<boolean>(false);
  const [bookedHotelId, setBookedHotelId] = useState<string | null>(null);

  // Disrupted city extraction for Hotels.com emergency stay lookup
  const disruptedCity = useMemo(() => {
    return (
      trip.items?.[0]?.arrivalLocation ||
      trip.items?.[0]?.departureLocation ||
      trip.items?.[0]?.location ||
      "Mumbai"
    );
  }, [trip]);

  // Live emergency hotels hook triggered on CANCELLED or MISSED_CONNECTION
  const {
    hotels: emergencyHotels,
    isLoading: isLoadingHotels,
  } = useEmergencyHotels(nugenResult?.status, disruptedCity);

  // Digital Twin What-If States
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    trip.items?.[0]?.id || ""
  );
  const [weatherImpact, setWeatherImpact] = useState<WeatherImpactResult | null>(null);
  const [weatherNewsHeadlines, setWeatherNewsHeadlines] = useState<any[]>([]);

  // Live real-time weather telemetry for trip corridor
  const [liveSrcWeather, setLiveSrcWeather] = useState<WeatherCondition | null>(null);
  const [liveDstWeather, setLiveDstWeather] = useState<WeatherCondition | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      setIsLiveLoading(true);
      try {
        const src = trip.source || "Delhi";
        const dst = trip.destination || "Jaipur";
        const [resSrc, resDst] = await Promise.allSettled([
          fetch(`/api/weather?city=${encodeURIComponent(src)}`),
          fetch(`/api/weather?city=${encodeURIComponent(dst)}`),
        ]);
        if (isMounted) {
          if (resSrc.status === "fulfilled" && resSrc.value.ok) {
            const data = await resSrc.value.json();
            if (data.weather) setLiveSrcWeather(data.weather);
          }
          if (resDst.status === "fulfilled" && resDst.value.ok) {
            const data = await resDst.value.json();
            if (data.weather) setLiveDstWeather(data.weather);
          }
        }
      } catch (e) {
        console.warn("Live weather telemetry probe warning:", e);
      } finally {
        if (isMounted) setIsLiveLoading(false);
      }
    }
    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, [trip.source, trip.destination]);

  // Sync sliders to real-time detected weather
  const syncSlidersToLiveWeather = () => {
    const target = liveSrcWeather || liveDstWeather;
    if (!target) return;
    setRainfall(target.rainfall || 0);
    setWindSpeed(target.windSpeed || 14);
    setTemperature(Math.round(target.temperature || 28));
    setVisibility(target.visibility || 9000);
    setDurationHours(2);
  };

  // Preset Scenarios for rapid 1-click hackathon demonstration
  const applyPreset = (preset: "CLEAR" | "MONSOON" | "CYCLONE" | "HEATWAVE") => {
    switch (preset) {
      case "CLEAR":
        setRainfall(0);
        setWindSpeed(12);
        setTemperature(27);
        setVisibility(10000);
        setDurationHours(1);
        break;
      case "MONSOON":
        setRainfall(55);
        setWindSpeed(38);
        setTemperature(26);
        setVisibility(1200);
        setDurationHours(4);
        break;
      case "CYCLONE":
        setRainfall(40);
        setWindSpeed(78);
        setTemperature(25);
        setVisibility(600);
        setDurationHours(5);
        break;
      case "HEATWAVE":
        setRainfall(0);
        setWindSpeed(10);
        setTemperature(48);
        setVisibility(6000);
        setDurationHours(6);
        break;
    }
  };

  const [isLoadingLiveWeather, setIsLoadingLiveWeather] = useState<boolean>(false);

  // Sync Live Weather from OpenWeather 2.5 API
  const loadLiveWeatherTelemetry = async () => {
    setIsLoadingLiveWeather(true);
    try {
      const city = trip.source || trip.destination || "Mumbai";
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data?.weather) {
        setRainfall(data.weather.rainfall ?? 0);
        setWindSpeed(Math.round(data.weather.windSpeed ?? 15));
        setTemperature(Math.round(data.weather.temperature ?? 28));
        setVisibility(Math.round(data.weather.visibility ?? 10000));
      }
    } catch (e) {
      console.warn("Could not sync live weather into simulation", e);
    } finally {
      setIsLoadingLiveWeather(false);
    }
  };

  // Trigger evaluation request to /api/simulation/nugen-evaluate
  const runNugenSimulation = async () => {
    setIsSimulating(true);
    try {
      const buffer = 45;
      const cond =
        rainfall >= 40
          ? "Thunderstorm"
          : rainfall >= 20
          ? "Heavy Rain"
          : windSpeed >= 50
          ? "Gale"
          : visibility < 1000
          ? "Dense Fog"
          : "Partly Cloudy";

      const targetBookingId = selectedBookingId || trip.items?.[0]?.id || "it-leg-01";

      const [nugenRes, impactRes, newsRes] = await Promise.allSettled([
        fetch("/api/simulation/nugen-evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: selectedMode,
            weather: {
              temperature,
              windSpeed,
              rainfall,
              visibility,
              condition: cond,
            },
            routeContext: {
              from: trip.source || "Mumbai",
              to: trip.destination || "Bengaluru",
              scheduledDeparture: trip.items?.[0]?.startTime || "10:00",
              connectionBufferMinutes: buffer,
            },
          }),
        }),
        fetch("/api/simulation/weather-impact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: targetBookingId,
            rainfallMm: rainfall,
            tempC: temperature,
            stormDurationHrs: durationHours,
            trip,
          }),
        }),
        fetch(`/api/social-signals?city=${encodeURIComponent(trip.source || trip.destination || "Delhi")}`),
      ]);

      if (nugenRes.status === "fulfilled" && nugenRes.value.ok) {
        const data: NugenEvaluationResult = await nugenRes.value.json();
        setNugenResult(data);
      }

      if (impactRes.status === "fulfilled" && impactRes.value.ok) {
        const impactData = await impactRes.value.json();
        if (impactData.result) {
          setWeatherImpact(impactData.result);
          if (onSimulatedImpactChange) {
            onSimulatedImpactChange({
              rainfall,
              windSpeed,
              temperature,
              durationHours,
              feasibility: impactData.result.feasibility,
              brokenLegs: impactData.result.allAffectedItemIds,
              delayedLegs: impactData.result.allAffectedItemIds.map((id: string) => ({
                itemId: id,
                title: trip.items?.find((i) => i.id === id)?.title || "Affected Segment",
                delayMinutes: impactData.result.delayMinutes,
                reason: impactData.result.explanation,
              })),
              impactResult: impactData.result,
            });
          }
        }
      }

      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        if (newsData.signals && Array.isArray(newsData.signals)) {
          setWeatherNewsHeadlines(newsData.signals.slice(0, 3));
        }
      }
    } catch (err) {
      console.warn("Failed to evaluate with Digital Twin:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Pure In-Memory Digital Twin Computation (Zero Database Mutations)
  const simulationResult = useMemo(() => {
    const simulatedItems: ItineraryItem[] = JSON.parse(JSON.stringify(trip.items || []));
    const delayedLegs: { itemId: string; title: string; delayMinutes: number; reason: string }[] = [];
    const brokenLegs: string[] = [];

    simulatedItems.forEach((item) => {
      let delay = 0;
      let reason = "";

      if (item.type === "TRAIN") {
        if (rainfall >= 60) {
          delay = 180;
          reason = `Track waterlogging >100mm over rail head. Signals clamp red; services suspended.`;
          brokenLegs.push(item.id);
        } else if (rainfall >= 30) {
          delay = 75;
          reason = `Track submerged above rail flange. Indian Railways caution order enforced (25 km/h ceiling).`;
        } else if (temperature >= 46) {
          delay = 45;
          reason = `Track buckling & OHE wire sag caution order active (>46°C rail temp).`;
        } else if (rainfall >= 15) {
          delay = 25;
          reason = `Monsoon track clearance and signal point verification check.`;
        }
      } else if (item.type === "FLIGHT") {
        if (windSpeed >= 70 || (windSpeed >= 50 && rainfall >= 35) || visibility < 500) {
          delay = 150;
          reason = `Severe crosswinds (${windSpeed} km/h) & low visibility (${visibility}m) exceed safe approach minimums. Ground stop declared.`;
          brokenLegs.push(item.id);
        } else if (windSpeed >= 50 || rainfall >= 25 || visibility < 1200) {
          delay = 60;
          reason = `ATC holding patterns and CAT-II staggered approach sequencing.`;
        } else if (windSpeed >= 35 || rainfall >= 10 || visibility < 3000) {
          delay = 25;
          reason = `Pushback and apron surface rain delays.`;
        }
      } else if (item.type === "TRANSFER" || item.type === "TAXI" || item.type === "BUS") {
        if (rainfall >= 50) {
          delay = 90;
          reason = `Highway flash flooding and expressway gridlock (${rainfall} mm/h).`;
          brokenLegs.push(item.id);
        } else if (rainfall >= 25 || visibility < 800) {
          delay = 45;
          reason = `High hydroplaning risk and reduced highway visibility.`;
        } else if (rainfall >= 12 || visibility < 1500) {
          delay = 20;
          reason = `Wet pavement traffic slowdown.`;
        }
      }

      if (delay > 0) {
        delayedLegs.push({ itemId: item.id, title: item.title, delayMinutes: delay, reason });
      }
    });

    let cumulativeDelay = 0;
    let feasibility: Feasibility = "RECOVERABLE";

    delayedLegs.forEach((d) => {
      cumulativeDelay += d.delayMinutes;
    });

    if (cumulativeDelay >= 150 || brokenLegs.length >= 2) {
      feasibility = "IMPOSSIBLE";
    } else if (cumulativeDelay >= 45 || brokenLegs.length === 1) {
      feasibility = "AT_RISK";
    }

    let recommendation = "Nominal conditions. All transit buffers remain healthy.";
    if (feasibility === "IMPOSSIBLE") {
      recommendation = `🚨 Digital Twin Alert: Cascade failure! Weather conditions cause total buffer depletion (+${cumulativeDelay}m delay). Immediate mode shift is required to save downstream reservations.`;
    } else if (feasibility === "AT_RISK") {
      recommendation = `⚠️ Warning: Transfer buffer eroded by ${cumulativeDelay}m. Connecting transit node is at high risk of being missed. Pre-activate flexible ground alternative.`;
    }

    return {
      feasibility,
      cumulativeDelay,
      delayedLegs,
      brokenLegs,
      recommendation,
    };
  }, [trip, rainfall, windSpeed, temperature, visibility, durationHours]);

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-6 text-[#0F1B2B]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FF] border border-[#74BCFB]/40">
            <CloudRain className="w-3.5 h-3.5 text-[#1C6FD9]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1C6FD9]">
              Digital Twin • What-If Weather Sandbox
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#047857] bg-[#E6FBF7] px-2.5 py-1 rounded-full border border-[#A7F3D0] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Nugen Aligned AI • In-Memory Safe
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="px-3 py-1 rounded-xl border border-gray-200 hover:border-[#74BCFB] text-xs font-bold text-[#4A5B70] hover:text-[#0F1B2B] bg-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{isOpen ? "Minimize Sandbox" : "Expand Sandbox"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-fadeIn">
          {/* Live Corridor Telemetry Probe - HIGHLIGHTED PRIMARY LIVE METEOROLOGICAL SOURCE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white to-[#EAF5FF] border border-emerald-400/40 space-y-3 shadow-xs ring-1 ring-emerald-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1B2B] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  Live Corridor Telemetry Probe ({trip.source || "Delhi"} ➔ {trip.destination || "Jaipur"})
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={syncSlidersToLiveWeather}
                  disabled={isLiveLoading || (!liveSrcWeather && !liveDstWeather)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold text-[11px] shadow-[0_2px_10px_rgba(5,150,105,0.25)] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  title="Populate simulation sliders with detected real-time weather"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sync Sliders to Live Weather</span>
                </button>
              </div>
            </div>

            {isLiveLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#4A5B70] py-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#1C6FD9] animate-spin" />
                <span>Interrogating OpenWeather API & live meteorological probes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {liveSrcWeather && (
                  <div className="bg-white/95 p-3 rounded-xl border border-sky-200/70 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0F1B2B] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#1C6FD9]" /> {liveSrcWeather.city} (Origin)
                      </span>
                      <span className="font-black text-[#1C6FD9] bg-[#EAF5FF] px-2 py-0.5 rounded-md border border-[#74BCFB]/30">
                        {liveSrcWeather.temperature}°C
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4A5B70] flex flex-wrap gap-x-3 gap-y-1">
                      <span>Condition: <strong>{liveSrcWeather.condition}</strong></span>
                      <span>Wind: <strong>{liveSrcWeather.windSpeed} km/h</strong></span>
                      <span>Rain: <strong>{liveSrcWeather.rainfall} mm/h</strong></span>
                      <span>Visibility: <strong>{(liveSrcWeather.visibility / 1000).toFixed(1)} km</strong></span>
                    </div>
                  </div>
                )}

                {liveDstWeather && (
                  <div className="bg-white/95 p-3 rounded-xl border border-sky-200/70 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0F1B2B] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {liveDstWeather.city} (Destination)
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {liveDstWeather.temperature}°C
                      </span>
                    </div>
                    <div className="text-[11px] text-[#4A5B70] flex flex-wrap gap-x-3 gap-y-1">
                      <span>Condition: <strong>{liveDstWeather.condition}</strong></span>
                      <span>Wind: <strong>{liveDstWeather.windSpeed} km/h</strong></span>
                      <span>Rain: <strong>{liveDstWeather.rainfall} mm/h</strong></span>
                      <span>Visibility: <strong>{(liveDstWeather.visibility / 1000).toFixed(1)} km</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Scenario Preset Buttons with Soft Pastel Themes */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#0F1B2B] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#1C6FD9]" />
                <span>1-Click What-If Scenarios</span>
              </span>
              <span className="text-[10px] font-mono text-[#4A5B70]">Stress-test instant meteorological shifts</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">
              {[
                {
                  id: "CLEAR",
                  title: "Normal Clear",
                  desc: "0 mm/h • 12 km/h • 27°C",
                  icon: Sun,
                  accent: "text-amber-500",
                  normalBg: "bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-200/80 text-amber-950",
                  activeBg: "bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/40 text-amber-950 shadow-sm",
                  hoverBg: "hover:border-amber-400 hover:shadow-xs",
                },
                {
                  id: "MONSOON",
                  title: "Heavy Monsoon",
                  desc: "55 mm/h • 38 km/h • 26°C",
                  icon: CloudRain,
                  accent: "text-[#1C6FD9]",
                  normalBg: "bg-gradient-to-br from-sky-50/70 via-white to-blue-50/30 border-sky-200/80 text-blue-950",
                  activeBg: "bg-blue-100/90 border-[#1C6FD9] ring-2 ring-[#1C6FD9]/40 text-blue-950 shadow-sm",
                  hoverBg: "hover:border-[#1C6FD9] hover:shadow-xs",
                },
                {
                  id: "CYCLONE",
                  title: "Coastal Gale",
                  desc: "40 mm/h • 78 km/h • 25°C",
                  icon: Wind,
                  accent: "text-purple-600",
                  normalBg: "bg-gradient-to-br from-purple-50/70 via-white to-violet-50/30 border-purple-200/80 text-purple-950",
                  activeBg: "bg-purple-100/90 border-purple-400 ring-2 ring-purple-400/40 text-purple-950 shadow-sm",
                  hoverBg: "hover:border-purple-400 hover:shadow-xs",
                },
                {
                  id: "HEATWAVE",
                  title: "Track Heatwave",
                  desc: "48°C • Rail Buckling",
                  icon: Thermometer,
                  accent: "text-rose-600",
                  normalBg: "bg-gradient-to-br from-rose-50/70 via-white to-orange-50/30 border-rose-200/80 text-rose-950",
                  activeBg: "bg-rose-100/90 border-rose-400 ring-2 ring-rose-400/40 text-rose-950 shadow-sm",
                  hoverBg: "hover:border-rose-400 hover:shadow-xs",
                },
              ].map((p) => {
                const Icon = p.icon;
                const isPresetActive =
                  (p.id === "CLEAR" && rainfall === 0 && windSpeed === 12 && temperature === 27 && durationHours === 1) ||
                  (p.id === "MONSOON" && rainfall === 55 && windSpeed === 38 && temperature === 26 && durationHours === 4) ||
                  (p.id === "CYCLONE" && rainfall === 40 && windSpeed === 78 && temperature === 25 && durationHours === 5) ||
                  (p.id === "HEATWAVE" && rainfall === 0 && windSpeed === 10 && temperature === 48 && durationHours === 6);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id as any)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-start gap-1 cursor-pointer text-left shadow-2xs ${
                      isPresetActive
                        ? `${p.activeBg} font-black`
                        : `${p.normalBg} ${p.hoverBg}`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5 font-extrabold text-xs text-[#0F1B2B]">
                        <Icon className={`w-4 h-4 ${p.accent}`} /> {p.title}
                      </span>
                      {isPresetActive && (
                        <span className="w-2 h-2 rounded-full bg-[#1C6FD9] animate-pulse" />
                      )}
                    </div>
                    <span className="text-[9.5px] text-[#4A5B70] font-mono">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Booking Segment Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#F8FBFF] to-[#EAF5FF]/60 p-3.5 sm:p-4 rounded-2xl border border-[#74BCFB]/40 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1C6FD9] text-white flex items-center justify-center shadow-xs shrink-0">
                {trip.items?.find((i) => i.id === selectedBookingId)?.type === "FLIGHT" ? (
                  <Plane className="w-4 h-4" />
                ) : trip.items?.find((i) => i.id === selectedBookingId)?.type === "TRAIN" ? (
                  <Train className="w-4 h-4" />
                ) : (
                  <Car className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#0F1B2B] flex items-center gap-1.5">
                  Target Booking Segment to Stress-Test
                </span>
                <span className="text-[10px] text-[#4A5B70] block">
                  Traverses downstream graph dependencies from this origin leg
                </span>
              </div>
            </div>

            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="bg-white border border-[#74BCFB]/50 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0F1B2B] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1C6FD9]/30 focus:border-[#1C6FD9] cursor-pointer"
            >
              {(trip.items || []).map((it) => (
                <option key={it.id} value={it.id}>
                  {it.title} ({it.type} &bull; {it.startTime})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Slider 1: Rainfall */}
            <WeatherSliderCard
              label="Rainfall Intensity"
              icon={CloudRain}
              value={rainfall}
              min={0}
              max={80}
              step={5}
              unit="mm/h"
              cardBg="bg-gradient-to-br from-sky-50/70 via-white to-[#F0F7FF]"
              cardBorder="border-sky-200/90"
              severityLabel={
                rainfall >= 55
                  ? "Cloudburst / Flood Risk"
                  : rainfall >= 25
                  ? "Heavy Downpour"
                  : rainfall >= 10
                  ? "Moderate Showers"
                  : "Nominal / Dry Track"
              }
              severityLevel={
                rainfall >= 55 ? "critical" : rainfall >= 25 ? "warning" : rainfall >= 10 ? "caution" : "normal"
              }
              accentGradient={{
                start: "#38BDF8",
                end: "#1C6FD9",
                thumbColor: "#1C6FD9",
                bgSoft: "bg-blue-50",
                iconColor: "text-[#1C6FD9]",
              }}
              onChange={setRainfall}
              presetChips={[
                { label: "0mm Dry", value: 0 },
                { label: "20mm Rain", value: 20 },
                { label: "40mm Heavy", value: 40 },
                { label: "60mm Flood", value: 60 },
                { label: "80mm Max", value: 80 },
              ]}
            />

            {/* Slider 2: Wind Speed */}
            <WeatherSliderCard
              label="Wind Speed"
              icon={Wind}
              value={windSpeed}
              min={5}
              max={90}
              step={5}
              unit="km/h"
              cardBg="bg-gradient-to-br from-purple-50/70 via-white to-[#F8F4FF]"
              cardBorder="border-purple-200/90"
              severityLabel={
                windSpeed >= 65
                  ? "Severe Storm Gale"
                  : windSpeed >= 45
                  ? "High Crosswinds"
                  : windSpeed >= 25
                  ? "Moderate Gusts"
                  : "Calm Breeze"
              }
              severityLevel={
                windSpeed >= 65 ? "critical" : windSpeed >= 45 ? "warning" : windSpeed >= 25 ? "caution" : "normal"
              }
              accentGradient={{
                start: "#A855F7",
                end: "#6D28D9",
                thumbColor: "#6D28D9",
                bgSoft: "bg-purple-50",
                iconColor: "text-purple-600",
              }}
              onChange={setWindSpeed}
              presetChips={[
                { label: "10km/h", value: 10 },
                { label: "30km/h", value: 30 },
                { label: "50km/h", value: 50 },
                { label: "70km/h", value: 70 },
                { label: "90km/h", value: 90 },
              ]}
            />

            {/* Slider 3: Temperature */}
            <WeatherSliderCard
              label="Ambient Temp"
              icon={Thermometer}
              value={temperature}
              min={15}
              max={50}
              step={1}
              unit="°C"
              cardBg="bg-gradient-to-br from-amber-50/70 via-white to-[#FFF9F0]"
              cardBorder="border-amber-200/90"
              severityLabel={
                temperature >= 46
                  ? "Track Buckling (>46°C)"
                  : temperature >= 38
                  ? "Extreme Heat Alert"
                  : temperature >= 30
                  ? "Warm Conditions"
                  : "Optimal Thermal Range"
              }
              severityLevel={
                temperature >= 46 ? "critical" : temperature >= 38 ? "warning" : temperature >= 30 ? "caution" : "normal"
              }
              accentGradient={{
                start: "#F59E0B",
                end: "#DC2626",
                thumbColor: "#DC2626",
                bgSoft: "bg-amber-50",
                iconColor: "text-amber-600",
              }}
              onChange={setTemperature}
              presetChips={[
                { label: "20°C Mild", value: 20 },
                { label: "28°C Warm", value: 28 },
                { label: "38°C Hot", value: 38 },
                { label: "46°C Buckle", value: 46 },
                { label: "50°C Max", value: 50 },
              ]}
            />

            {/* Slider 4: Visibility */}
            <WeatherSliderCard
              label="Visibility Range"
              icon={Eye}
              value={visibility}
              min={200}
              max={10000}
              step={200}
              unit="m"
              cardBg="bg-gradient-to-br from-cyan-50/70 via-white to-[#F0FBFF]"
              cardBorder="border-cyan-200/90"
              displayValue={visibility >= 1000 ? `${(visibility / 1000).toFixed(1)} km` : `${visibility} m`}
              severityLabel={
                visibility < 800
                  ? "CAT-III Dense Fog"
                  : visibility < 1500
                  ? "CAT-II Approach Min."
                  : visibility < 4000
                  ? "Hazy / Low Visibility"
                  : "Clear Flight Visibility"
              }
              severityLevel={
                visibility < 800 ? "critical" : visibility < 1500 ? "warning" : visibility < 4000 ? "caution" : "normal"
              }
              accentGradient={{
                start: "#06B6D4",
                end: "#0284C7",
                thumbColor: "#0284C7",
                bgSoft: "bg-cyan-50",
                iconColor: "text-cyan-600",
              }}
              onChange={setVisibility}
              presetChips={[
                { label: "400m Fog", value: 400 },
                { label: "1.2km CAT-II", value: 1200 },
                { label: "3km Fair", value: 3000 },
                { label: "6km Good", value: 6000 },
                { label: "10km Clr", value: 10000 },
              ]}
            />

            {/* Slider 5: Duration */}
            <WeatherSliderCard
              label="Event Duration"
              icon={Clock}
              value={durationHours}
              min={1}
              max={8}
              step={1}
              unit="Hrs"
              cardBg="bg-gradient-to-br from-emerald-50/70 via-white to-[#F0FDF4]"
              cardBorder="border-emerald-200/90"
              displayValue={`${durationHours} Hours`}
              severityLabel={
                durationHours >= 6
                  ? "Protracted Storm Front"
                  : durationHours >= 4
                  ? "Persistent Weather"
                  : durationHours >= 2
                  ? "Standard Weather Event"
                  : "Passing Weather Cell"
              }
              severityLevel={
                durationHours >= 6 ? "critical" : durationHours >= 4 ? "warning" : durationHours >= 2 ? "caution" : "normal"
              }
              accentGradient={{
                start: "#10B981",
                end: "#047857",
                thumbColor: "#047857",
                bgSoft: "bg-emerald-50",
                iconColor: "text-emerald-600",
              }}
              onChange={setDurationHours}
              presetChips={[
                { label: "1 hr", value: 1 },
                { label: "2 hrs", value: 2 },
                { label: "4 hrs", value: 4 },
                { label: "6 hrs", value: 6 },
                { label: "8 hrs", value: 8 },
              ]}
            />
          </div>

          <style>{`
            .weather-twin-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #ffffff;
              border: 3px solid #1C6FD9;
              box-shadow: 0 2px 8px rgba(10, 61, 115, 0.25);
              cursor: grab;
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .weather-twin-slider::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 4px 12px rgba(28, 111, 217, 0.4);
            }
            .weather-twin-slider::-webkit-slider-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
            }
            .weather-twin-slider::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #ffffff;
              border: 3px solid #1C6FD9;
              box-shadow: 0 2px 8px rgba(10, 61, 115, 0.25);
              cursor: grab;
            }
          `}</style>

          {/* Action Trigger Row: Mode Selection & Run Simulation Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#4A5B70] font-bold shrink-0">Simulate Mode:</span>
              <div className="flex rounded-xl bg-[#F8FBFF] p-1 border border-[#74BCFB]/30 text-xs font-bold w-full sm:w-auto justify-center">
                {(["FLIGHT", "TRAIN", "ROAD"] as const).map((m) => {
                  const Icon = m === "FLIGHT" ? Plane : m === "TRAIN" ? Train : Car;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMode(m)}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedMode === m
                          ? "bg-[#1C6FD9] text-white shadow-sm font-extrabold"
                          : "text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={runNugenSimulation}
              disabled={isSimulating}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                isSimulating
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-gradient-to-r from-[#1C6FD9] via-[#2563EB] to-[#4F46E5] hover:from-[#1558B0] hover:to-[#3730A3] text-white shadow-[0_6px_20px_rgba(28,111,217,0.35)] hover:shadow-[0_10px_26px_rgba(28,111,217,0.45)] hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span className="animate-pulse">Simulating Cascade Ripple...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Run Weather Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Nugen Domain-Aligned AI Intelligence Results Card */}
          {nugenResult && (
            <div className="bg-[#F8FBFF] p-5 rounded-2xl border border-[#74BCFB]/40 space-y-4 animate-in fade-in duration-300 shadow-sm">
              {/* Header with Attribution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#0F1B2B]">
                    AI Twin Disruption Assessment:
                  </span>
                </div>
                <div>
                  {nugenResult.source === "nugen_aligned_model" ? (
                    <span className="bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/40 px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C6FD9] animate-ping" />
                      Powered by Nugen Domain-Aligned AI
                    </span>
                  ) : (
                    <span className="bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0] px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
                      ReMode Domain Rules (Local Evaluation)
                    </span>
                  )}
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-[#4A5B70] block mb-1 font-semibold">Risk Level</span>
                  <span
                    className={`font-black text-xs px-2.5 py-0.5 rounded-full inline-block border ${
                      nugenResult.riskLevel === "CRITICAL"
                        ? "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30"
                        : nugenResult.riskLevel === "HIGH"
                        ? "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]"
                        : nugenResult.riskLevel === "MODERATE"
                        ? "bg-[#FFFDEB] text-[#D97706] border-[#FDE68A]"
                        : "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]"
                    }`}
                  >
                    {nugenResult.riskLevel}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-[#4A5B70] block mb-1 font-semibold">Calculated Delay</span>
                  <span className="font-mono font-bold text-sm text-[#1C6FD9]">
                    +{nugenResult.delayMinutes} min
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-[#4A5B70] block mb-1 font-semibold">Operational Status</span>
                  <span
                    className={`font-extrabold text-[11px] uppercase ${
                      nugenResult.status === "MISSED_CONNECTION" || nugenResult.status === "CANCELLED"
                        ? "text-[#C13A1F]"
                        : nugenResult.status === "SEVERELY DELAYED"
                        ? "text-[#B45309]"
                        : nugenResult.status === "DELAYED"
                        ? "text-[#D97706]"
                        : "text-[#047857]"
                    }`}
                  >
                    {nugenResult.status.replace("_", " ")}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] text-[#4A5B70] block mb-1 font-semibold">Projected Time</span>
                  <span className="font-mono text-xs font-bold text-[#0F1B2B]">
                    {formatProjectedTime(trip.items?.[0]?.startTime || "10:00", nugenResult.delayMinutes)}
                  </span>
                </div>
              </div>

              {/* Cascading Alert */}
              {nugenResult.status === "MISSED_CONNECTION" && (
                <div className="p-3.5 rounded-xl bg-[#FFECEC] border border-[#FF5A5A]/30 text-[#C13A1F] text-xs flex items-start gap-2.5 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-[#C13A1F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold uppercase tracking-wider text-[11px]">
                      Cascading Connection Severance Detected
                    </div>
                    <p className="mt-0.5 text-xs text-[#991B1B] leading-relaxed">
                      Delay reduces the downstream connection buffer below the 30-minute safe minimum threshold. ReMode has activated autonomous multimodal re-routing to protect the subsequent itinerary legs.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Reasoning Box */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                <div className="text-[10px] font-mono text-[#1C6FD9] uppercase font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1C6FD9]" />
                  <span>Disruption Rationale & Domain Analysis</span>
                </div>
                <p className="text-[#0F1B2B] leading-relaxed">{nugenResult.reasoning}</p>
              </div>

              {/* Pulsing Skeleton Loader during Live Hotels.com search */}
              {isLoadingHotels && (
                <div className="p-4 rounded-xl bg-[#0B1523] border border-[#2CD9B8]/30 shadow-xl space-y-3 animate-pulse">
                  <div className="flex items-center gap-2.5 text-xs text-[#2CD9B8] font-bold">
                    <Hotel className="w-4 h-4 animate-bounce text-[#2CD9B8]" />
                    <span>Searching live Hotels.com inventory for emergency re-accommodation...</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-32 rounded-lg bg-white/5 border border-white/10" />
                    ))}
                  </div>
                </div>
              )}

              {/* Live Emergency Overnight Accommodation Section */}
              {!isLoadingHotels && emergencyHotels && emergencyHotels.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0B1523] border border-emerald-500/40 shadow-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Hotel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-white">
                            Live Emergency Accommodation ({disruptedCity})
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold">
                            Hotels.com RapidAPI Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Automatic overnight re-accommodation for severe disruption / missed connection.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30 self-start sm:self-auto">
                      ✓ Instant Disruption Protection Voucher
                    </span>
                  </div>

                  {/* Horizontal scrolling flex container */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {emergencyHotels.map((hotel) => {
                      const isBooked = bookedHotelId === hotel.id;
                      return (
                        <div
                          key={hotel.id}
                          className="w-[260px] sm:w-[280px] shrink-0 rounded-xl bg-[#152336] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-lg group"
                        >
                          <div className="relative h-32 w-full bg-slate-800 overflow-hidden">
                            <img
                              src={hotel.imageUrl}
                              alt={hotel.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-[#0F1B2B]/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{hotel.rating}</span>
                            </div>
                            {hotel.tag && (
                              <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                                {hotel.tag}
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                              <span className="flex items-center gap-1 truncate text-gray-300">
                                <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{hotel.distance}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                                {hotel.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span className="font-mono font-bold text-emerald-400 text-sm">
                                  {hotel.price}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {hotel.cancellation || "Free Cancellation"}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setBookedHotelId(hotel.id)}
                              className={`w-full py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                                isBooked
                                  ? "bg-emerald-600 text-white border border-emerald-400"
                                  : "bg-emerald-500 hover:bg-emerald-400 text-[#0F1B2B] shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95"
                              }`}
                            >
                              {isBooked ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Voucher Reserved (#RM-{hotel.id.slice(-4).toUpperCase()})</span>
                                </>
                              ) : (
                                <>
                                  <Bed className="w-3.5 h-3.5" />
                                  <span>Book Emergency Stay</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recovery Action Box */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs space-y-1">
                <div className="text-[10px] font-mono text-[#047857] uppercase font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />

                  <span>Autonomous Recovery Action</span>
                </div>
                <p className="text-[#0F1B2B] leading-relaxed whitespace-pre-line">{nugenResult.recoveryAction}</p>
              </div>
            </div>
          )}

          {/* Digital Twin Probabilistic Assessment (Gemini Agent Grounded) - HIGHLIGHTED PRIMARY RESULT */}
          {weatherImpact && (
            <div className="bg-gradient-to-br from-white via-[#F6FAFF] to-[#EFF6FF] p-5 sm:p-6 rounded-3xl border-2 border-[#1C6FD9]/50 space-y-4 shadow-[0_12px_36px_rgba(28,111,217,0.12)] ring-1 ring-[#1C6FD9]/20 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#74BCFB]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1C6FD9] animate-ping" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#0F1B2B] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
                    Digital Twin Probabilistic Assessment (Gemini Agent Grounded)
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold bg-[#EAF5FF] text-[#1C6FD9] px-3 py-1 rounded-full border border-[#74BCFB]/40 shadow-xs">
                    Confidence: {weatherImpact.confidence.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-white text-[#047857] px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                    Zero DB Writes (In-Memory Clone)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-sky-50/80 via-white to-sky-50/40 p-4 rounded-2xl border border-sky-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4A5B70] font-bold uppercase tracking-wider">
                      Disruption Probability
                    </span>
                    <span className="font-mono font-black text-xl text-[#1C6FD9]">
                      {Math.round(weatherImpact.probability * 100)}%
                    </span>
                  </div>
                  {/* Visual Meter Bar */}
                  <div className="h-2.5 w-full bg-white/80 rounded-full overflow-hidden p-0.5 border border-sky-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        weatherImpact.probability >= 0.7
                          ? "bg-gradient-to-r from-amber-500 to-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                          : weatherImpact.probability >= 0.4
                          ? "bg-gradient-to-r from-blue-500 to-amber-500"
                          : "bg-gradient-to-r from-emerald-400 to-teal-500"
                      }`}
                      style={{ width: `${Math.round(weatherImpact.probability * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    Continuous Physics & Graph Model
                  </span>
                </div>

                <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 p-4 rounded-2xl border border-amber-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] text-[#4A5B70] font-bold uppercase tracking-wider block">
                    Simulated Transit Drift
                  </span>
                  <div className="text-2xl font-black text-[#B45309]">
                    +{weatherImpact.delayMinutes || weatherImpact.affectedBookings?.[0]?.delayMinutes || 45} min
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium block truncate">
                    On {weatherImpact.targetItem?.title || weatherImpact.bookingTitle || "Primary Leg"}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-4 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-1">
                  <span className="text-[10px] text-[#4A5B70] font-bold uppercase tracking-wider block">
                    Ripple Cascade Legs
                  </span>
                  <div className="text-2xl font-black text-[#047857]">
                    {weatherImpact.allAffectedItemIds.length} Nodes
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    {weatherImpact.downstreamImpact.length} downstream connections evaluated
                  </span>
                </div>
              </div>

              {/* Gemini Agent Explanation */}
              <div className="p-4 rounded-2xl bg-white border border-[#74BCFB]/40 text-xs space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-mono text-[#1C6FD9] uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1C6FD9]" />
                  <span>Gemini Agent Root-Cause Explanation</span>
                </div>
                <p className="text-[#0F1B2B] leading-relaxed font-medium">
                  {weatherImpact.explanation}
                </p>
              </div>

              {/* Correlated Google News Headlines (Requirement 4) */}
              {weatherNewsHeadlines.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAFDFE] border border-gray-200/80 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#0F1B2B]">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <Radio className="w-3.5 h-3.5 text-emerald-600" />
                      Live Correlated News Signals (Google News RSS &bull; No API Key Required)
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">Real-time Public Feed</span>
                  </div>
                  <div className="space-y-2">
                    {weatherNewsHeadlines.map((news, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs flex items-start justify-between gap-3">
                        <div>
                          <a
                            href={news.url || news.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#1C6FD9] hover:underline block leading-snug"
                          >
                            {news.title}
                          </a>
                          {news.snippet && (
                            <p className="text-[10.5px] text-[#4A5B70] mt-0.5 line-clamp-2">
                              {news.snippet}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 shrink-0">
                          {news.source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Real-Time Cascading Impact Results Card (Corridor Multi-Leg Overview) */}
          <div className="bg-[#F8FBFF] p-5 rounded-2xl border border-[#74BCFB]/30 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1C6FD9]" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#0F1B2B]">
                  Corridor Multi-Leg Impact Overview:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                    simulationResult.feasibility === "RECOVERABLE"
                      ? "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]"
                      : simulationResult.feasibility === "AT_RISK"
                      ? "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]"
                      : "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30 animate-pulse"
                  }`}
                >
                  Itinerary Status: {simulationResult.feasibility}
                </span>
                <span className="text-[10px] font-mono text-[#4A5B70] font-bold">
                  +{simulationResult.cumulativeDelay}m Cumulative Drift
                </span>
              </div>
            </div>

            {/* Impacted Legs Breakdown */}
            {simulationResult.delayedLegs.length === 0 ? (
              <div className="text-xs text-[#047857] font-semibold flex items-center gap-2 py-1">
                <ShieldCheck className="w-4 h-4 text-[#047857]" />
                <span>All scheduled nodes operating comfortably within safety buffer margins.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {simulationResult.delayedLegs.map((leg) => {
                  const isBroken = simulationResult.brokenLegs.includes(leg.itemId);
                  return (
                    <div
                      key={leg.itemId}
                      className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isBroken
                          ? "bg-[#FFECEC] border-[#FF5A5A]/30 text-[#C13A1F]"
                          : "bg-[#FFF9E6] border-[#FDE68A] text-[#B45309]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{isBroken ? "❌" : "⚠️"}</span>
                        <div>
                          <div className="font-bold text-[#0F1B2B]">{leg.title}</div>
                          <div className="text-[11px] text-[#4A5B70]">{leg.reason}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${
                            isBroken
                              ? "bg-[#C13A1F] text-white border-[#C13A1F]"
                              : "bg-[#B45309] text-white border-[#B45309]"
                          }`}
                        >
                          +{leg.delayMinutes}m delay
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* HackCelestial 3.0 Nugen Alignment Architecture Showcase (Technical Dossier) */}
          <div className="bg-[#F8FBFF] border border-[#74BCFB]/35 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1C6FD9]" />
                <span className="text-xs font-extrabold text-[#0F1B2B] uppercase tracking-wider">
                  Nugen Model Alignment Pipeline (HackCelestial 3.0)
                </span>
                <span className="text-[10px] font-mono bg-[#EAF5FF] text-[#1C6FD9] px-2 py-0.5 rounded-md border border-[#74BCFB]/30 hidden sm:inline">
                  Qwen 2.5 0.5B Aligned
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPipelineDetails((prev) => !prev)}
                className="text-[11px] font-bold text-[#1C6FD9] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>{showPipelineDetails ? "Hide Pipeline Architecture" : "Inspect Alignment Architecture"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPipelineDetails ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* 4-Stage Architecture Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] text-[#4A5B70] font-mono font-semibold">Stage 1: Base AI Model</div>
                <div className="font-extrabold text-[#0F1B2B] mt-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#1C6FD9]" />
                  <span>Qwen 2.5 0.5B</span>
                </div>
                <div className="text-[9.5px] text-[#4A5B70] mt-0.5">qwen-v2p5-0p5b-instruct</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] text-[#4A5B70] font-mono font-semibold">Stage 2: Nugen Customization</div>
                <div className="font-extrabold text-[#1C6FD9] mt-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#1C6FD9]" />
                  <span>remode_domain_rules</span>
                </div>
                <div className="text-[9.5px] text-[#4A5B70] mt-0.5">Transit physics & safety rules</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] text-[#4A5B70] font-mono font-semibold">Stage 3: Aligned Model ID</div>
                <div className="font-extrabold text-[#B45309] mt-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#B45309]" />
                  <span className="truncate">alignment_01m3g6j4</span>
                </div>
                <div className="text-[9.5px] text-[#4A5B70] mt-0.5">Fine-tuned domain model</div>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs">
                <div className="text-[10px] text-[#4A5B70] font-mono font-semibold">Stage 4: ReMode Integration</div>
                <div className="font-extrabold text-[#047857] mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Digital Twin Engine</span>
                </div>
                <div className="text-[9.5px] text-[#4A5B70] mt-0.5">Autonomous cascading recovery</div>
              </div>
            </div>

            {/* Collapsible Deep-Dive Details */}
            {showPipelineDetails && (
              <div className="mt-3 pt-3 border-t border-[#74BCFB]/20 text-xs space-y-2 text-[#4A5B70]">
                <p className="leading-relaxed">
                  <strong className="text-[#0F1B2B]">Domain Problem Alignment:</strong> Generic LLMs provide vague, hallucinated travel recommendations during weather emergencies. ReMode aligns base model parameters using Nugen Intelligence with multimodal Indian transit disruption vectors: aviation crosswind minimums, rail flange submergence thresholds, track thermal buckling limits, and 30-minute cascading connection buffer rules.
                </p>
                <div className="bg-white rounded-xl p-3 border border-gray-200 text-[10px] font-mono text-[#0F1B2B] space-y-1">
                  <div>• <strong>Document Corpus:</strong> remode_domain_rules.txt (ID: document_01m3g38xsfw68j4m, 2.7KB)</div>
                  <div>• <strong>Supervised Dataset:</strong> nugen_training_dataset2.json (ID: document_01m3g3hr4yj68gpa, 6.5KB)</div>
                  <div>• <strong>Benchmark:</strong> benchmark.jsonl.txt (ID: document_01m3g49d1g6d1bge, 4.3KB)</div>
                  <div>• <strong>Active Alignment Project:</strong> alignment_01m3g6j4jr03s88t (Base: qwen-v2p5-0p5b-instruct)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
