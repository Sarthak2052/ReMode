"use client";

import React, { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Eye,
  Droplets,
  AlertTriangle,
  Radio,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { WeatherCondition } from "@/types";

interface LiveWeatherWidgetProps {
  source?: string;
  destination?: string;
  onOpenSandbox?: () => void;
  className?: string;
}

export function LiveWeatherWidget({
  source,
  destination,
  onOpenSandbox,
  className = "",
}: LiveWeatherWidgetProps) {
  const [sourceWeather, setSourceWeather] = useState<WeatherCondition | null>(null);
  const [destWeather, setDestWeather] = useState<WeatherCondition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      const srcQuery = source || "Delhi";
      const dstQuery = destination || "Jaipur";

      const [srcRes, dstRes] = await Promise.allSettled([
        fetch(`/api/weather?city=${encodeURIComponent(srcQuery)}`),
        fetch(`/api/weather?city=${encodeURIComponent(dstQuery)}`),
      ]);

      if (srcRes.status === "fulfilled" && srcRes.value.ok) {
        const data = await srcRes.value.json();
        if (data.weather) setSourceWeather(data.weather);
      }
      if (dstRes.status === "fulfilled" && dstRes.value.ok) {
        const data = await dstRes.value.json();
        if (data.weather) setDestWeather(data.weather);
      }
    } catch (err) {
      console.warn("Notice: Weather widget fetch warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!source && !destination) return;
    fetchWeather();
  }, [source, destination]);

  const getWeatherIcon = (cond?: string, isRain?: boolean) => {
    const c = (cond || "").toLowerCase();
    if (c.includes("rain") || c.includes("drizzle") || (isRain ?? false)) {
      return <CloudRain className="w-4 h-4 text-[#1C6FD9] animate-bounce" />;
    }
    if (c.includes("thunder") || c.includes("storm")) {
      return <CloudRain className="w-4 h-4 text-[#C13A1F]" />;
    }
    if (c.includes("cloud")) {
      return <Cloud className="w-4 h-4 text-[#0284C7]" />;
    }
    if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
      return <Wind className="w-4 h-4 text-[#64748B]" />;
    }
    return <Sun className="w-4 h-4 text-[#F59E0B]" />;
  };

  const getRiskBadge = (weather?: WeatherCondition | null) => {
    const risk = weather?.riskAssessment?.overallRisk || "LOW";
    switch (risk) {
      case "CRITICAL":
        return (
          <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-300 animate-pulse">
            Critical Disruption Risk
          </span>
        );
      case "HIGH":
        return (
          <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300">
            Adverse Weather Alert
          </span>
        );
      case "MODERATE":
        return (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-300">
            Moderate Conditions
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            Clear / Nominal
          </span>
        );
    }
  };

  if (isLoading && !sourceWeather && !destWeather) {
    return (
      <div className={`flex items-center gap-2 text-xs text-[#4A5B70] bg-[#F8FBFF] px-3.5 py-1.5 rounded-xl border border-[#74BCFB]/30 ${className}`}>
        <Radio className="w-3.5 h-3.5 text-[#1C6FD9] animate-pulse" />
        <span className="font-semibold">Querying Live Corridor Weather...</span>
      </div>
    );
  }

  const activeWeather = sourceWeather || destWeather;
  if (!activeWeather) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Origin Weather Badge */}
        {sourceWeather && (
          <div
            onClick={() => setShowDetails((p) => !p)}
            className="flex items-center gap-2 bg-white hover:bg-[#F8FBFF] px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#74BCFB]/50 transition-all shadow-2xs cursor-pointer"
            title="Click to view detailed meteorological readings"
          >
            {getWeatherIcon(sourceWeather.condition, sourceWeather.rainfall > 0)}
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#0F1B2B]">{sourceWeather.city}:</span>
              <span className="font-black text-[#1C6FD9]">{sourceWeather.temperature}°C</span>
              <span className="text-[#4A5B70] hidden sm:inline capitalize font-medium text-[11px]">
                ({sourceWeather.description || sourceWeather.condition})
              </span>
            </div>
            {sourceWeather.riskAssessment?.overallRisk !== "LOW" && getRiskBadge(sourceWeather)}
          </div>
        )}

        {/* Destination Weather Badge */}
        {destWeather && (
          <div
            onClick={() => setShowDetails((p) => !p)}
            className="flex items-center gap-2 bg-white hover:bg-[#F8FBFF] px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#74BCFB]/50 transition-all shadow-2xs cursor-pointer"
            title="Click to view detailed meteorological readings"
          >
            {getWeatherIcon(destWeather.condition, destWeather.rainfall > 0)}
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#0F1B2B]">{destWeather.city}:</span>
              <span className="font-black text-[#1C6FD9]">{destWeather.temperature}°C</span>
              <span className="text-[#4A5B70] hidden sm:inline capitalize font-medium text-[11px]">
                ({destWeather.description || destWeather.condition})
              </span>
            </div>
            {destWeather.riskAssessment?.overallRisk !== "LOW" && getRiskBadge(destWeather)}
          </div>
        )}

        {/* Live Weather Feed Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/10 to-[#EAF5FF] border border-emerald-400/30 text-[11px] font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time Weather Live</span>
        </div>

        {/* Button to Open Sandbox or refresh */}
        <button
          type="button"
          onClick={onOpenSandbox}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EAF5FF] hover:bg-[#D5EBFB] text-[#1C6FD9] border border-[#74BCFB]/40 text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs ml-auto"
          title="Open Weather Digital Twin & Radar Sandbox"
        >
          <span>Weather Twin</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Expanded Meteorological Telemetry Card */}
      {showDetails && (
        <div className="bg-[#FAFDFE] p-3 sm:p-4 rounded-2xl border border-[#74BCFB]/35 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
          {sourceWeather && (
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F1B2B] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {sourceWeather.city} (Origin)
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {sourceWeather.source === "OPENWEATHER_LIVE" ? "OpenWeather Live" : "Physics Twin Telemetry"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A5B70] pt-1">
                <div>Temp: <strong className="text-[#0F1B2B]">{sourceWeather.temperature}°C</strong> (feels {sourceWeather.feelsLike}°C)</div>
                <div className="flex items-center gap-1"><Wind className="w-3 h-3" /> Wind: <strong className="text-[#0F1B2B]">{sourceWeather.windSpeed} km/h</strong></div>
                <div className="flex items-center gap-1"><Droplets className="w-3 h-3" /> Rain: <strong className="text-[#0F1B2B]">{sourceWeather.rainfall} mm/h</strong></div>
                <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> Visibility: <strong className="text-[#0F1B2B]">{(sourceWeather.visibility / 1000).toFixed(1)} km</strong></div>
              </div>
              {sourceWeather.riskAssessment?.advisory && (
                <div className="text-[10.5px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                  {sourceWeather.riskAssessment.advisory}
                </div>
              )}
            </div>
          )}

          {destWeather && (
            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F1B2B] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {destWeather.city} (Destination)
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {destWeather.source === "OPENWEATHER_LIVE" ? "OpenWeather Live" : "Physics Twin Telemetry"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A5B70] pt-1">
                <div>Temp: <strong className="text-[#0F1B2B]">{destWeather.temperature}°C</strong> (feels {destWeather.feelsLike}°C)</div>
                <div className="flex items-center gap-1"><Wind className="w-3 h-3" /> Wind: <strong className="text-[#0F1B2B]">{destWeather.windSpeed} km/h</strong></div>
                <div className="flex items-center gap-1"><Droplets className="w-3 h-3" /> Rain: <strong className="text-[#0F1B2B]">{destWeather.rainfall} mm/h</strong></div>
                <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> Visibility: <strong className="text-[#0F1B2B]">{(destWeather.visibility / 1000).toFixed(1)} km</strong></div>
              </div>
              {destWeather.riskAssessment?.advisory && (
                <div className="text-[10.5px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                  {destWeather.riskAssessment.advisory}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
