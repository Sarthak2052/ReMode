"use client";

import React, { useState, useEffect } from "react";
import {
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  Gauge,
  MapPin,
  Sparkles,
  Plane,
  Train,
  Car,
  Search,
} from "lucide-react";
import type { WeatherCondition } from "@/types";

interface LiveWeatherCardProps {
  defaultCity?: string;
  destinationCity?: string;
  onSyncToSandbox?: (metrics: {
    rainfall: number;
    windSpeed: number;
    temperature: number;
    visibility: number;
  }) => void;
}

export function LiveWeatherCard({
  defaultCity = "Mumbai",
  destinationCity = "New Delhi",
  onSyncToSandbox,
}: LiveWeatherCardProps) {
  const [activeCity, setActiveCity] = useState<string>(defaultCity);
  const [customInput, setCustomInput] = useState<string>("");
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const fetchLiveWeather = async (cityToFetch: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityToFetch)}`);
      const data = await res.json();
      if (data?.weather) {
        setWeather(data.weather);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch live weather", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather(activeCity);
  }, [activeCity]);

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    setCustomInput("");
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setActiveCity(customInput.trim());
    }
  };

  const handleSync = () => {
    if (!weather) return;
    if (onSyncToSandbox) {
      onSyncToSandbox({
        rainfall: weather.rainfall || 0,
        windSpeed: weather.windSpeed || 15,
        temperature: Math.round(weather.temperature),
        visibility: weather.visibility || 10000,
      });
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    }
  };

  const quickCities = [
    { label: `${defaultCity} (Origin)`, value: defaultCity },
    { label: `${destinationCity} (Destination)`, value: destinationCity },
    { label: "Bengaluru", value: "Bengaluru" },
    { label: "Pune", value: "Pune" },
    { label: "Goa", value: "Goa" },
  ];

  const risk = weather?.riskAssessment?.overallRisk || "LOW";
  const riskColor =
    risk === "CRITICAL"
      ? "bg-red-500 text-white border-red-600"
      : risk === "HIGH"
      ? "bg-amber-500 text-white border-amber-600"
      : risk === "MODERATE"
      ? "bg-yellow-400 text-yellow-950 border-yellow-500"
      : "bg-emerald-500 text-white border-emerald-600";

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden space-y-5 text-[#0F1B2B]">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#E6FBF7] text-[#047857] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE OpenWeather Telemetry
            </span>
            <span className="text-xs text-[#4A5B70] font-mono">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
            {weather?.source === "OPENWEATHER_LIVE" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/40">
                Official 2.5 API
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#0F1B2B] tracking-tight flex items-center gap-2">
            <span>Atmospheric Corridor Radar</span>
            <span className="text-lg font-bold text-[#1C6FD9]">
              ({weather?.city || activeCity}, {weather?.country || "IN"})
            </span>
          </h3>
          <p className="text-xs text-[#4A5B70] font-medium mt-1 max-w-2xl leading-relaxed">
            Direct satellite & surface telemetry streamed live for real-time multi-modal transit safety evaluation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchLiveWeather(activeCity)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0F1B2B] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh OpenWeather"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1C6FD9] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {onSyncToSandbox && (
            <button
              onClick={handleSync}
              disabled={!weather || loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 ${
                syncSuccess
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] hover:from-[#1558B0] hover:to-[#1D4ED8] text-white shadow-[0_4px_14px_rgba(28,111,217,0.25)]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{syncSuccess ? "✓ Synced with Twin!" : "Sync Live into Digital Twin"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Corridor Quick Switcher */}
      <div className="relative z-10 my-1 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#4A5B70] mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#1C6FD9]" />
            Corridor Nodes:
          </span>
          {quickCities.map((c) => (
            <button
              key={c.value}
              onClick={() => handleCitySelect(c.value)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCity.toLowerCase() === c.value.toLowerCase()
                  ? "bg-[#1C6FD9] text-white shadow-xs border border-[#1C6FD9]"
                  : "bg-[#F8FBFF] hover:bg-[#EAF5FF] text-[#4A5B70] hover:text-[#0F1B2B] border border-[#74BCFB]/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Custom City Search */}
        <form onSubmit={handleCustomSearch} className="flex items-center gap-1.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search any city or IATA..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="px-3 py-1.5 pl-8 rounded-xl bg-[#F8FBFF] hover:bg-white focus:bg-white border border-[#74BCFB]/40 text-xs text-[#0F1B2B] placeholder-[#4A5B70]/60 outline-none w-48 sm:w-56 transition shadow-2xs focus:border-[#1C6FD9]"
            />
            <Search className="w-3.5 h-3.5 text-[#4A5B70] absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-[#1C6FD9] hover:bg-[#1558B0] text-white text-xs font-bold cursor-pointer shadow-xs transition"
          >
            Check
          </button>
        </form>
      </div>

      {/* Live Telemetry Metrics Grid */}
      {weather && (
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* 1. Main Temp & Condition */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 bg-gradient-to-br from-[#EAF5FF] via-white to-[#F0F6FC] rounded-2xl p-4 border border-[#74BCFB]/40 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1C6FD9]">
                Live Temperature
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-[#0F1B2B]">
                  {loading ? (
                    <span className="inline-block animate-pulse text-[#1C6FD9]/70">...</span>
                  ) : (
                    `${Math.round(weather.temperature)}°C`
                  )}
                </span>
                <span className="text-xs text-[#4A5B70] font-semibold">
                  Feels {Math.round(weather.feelsLike)}°C
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="capitalize text-xs font-bold text-[#0F1B2B]">
                  {weather.description}
                </span>
                <span className="text-[10px] text-[#4A5B70]">
                  ({weather.condition})
                </span>
              </div>
            </div>
            {weather.icon && (
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-16 h-16 drop-shadow-sm filter"
              />
            )}
          </div>

          {/* 2. Rainfall / Precipitation */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#4A5B70] text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Precipitation</span>
              <CloudRain className="w-4 h-4 text-[#1C6FD9]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black font-sans text-[#0F1B2B]">
                {weather.rainfall ?? 0}
              </span>
              <span className="text-xs text-[#4A5B70] ml-1 font-semibold">mm/h</span>
            </div>
            <span className="text-[10px] text-[#4A5B70] font-medium mt-1">
              {(weather.rainfall ?? 0) > 0 ? "Active Downpour" : "Dry Ground Track"}
            </span>
          </div>

          {/* 3. Wind Speed & Gusts */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#4A5B70] text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Wind Velocity</span>
              <Wind className="w-4 h-4 text-[#1C6FD9]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black font-sans text-[#0F1B2B]">
                {weather.windSpeed}
              </span>
              <span className="text-xs text-[#4A5B70] ml-1 font-semibold">km/h</span>
            </div>
            <span className="text-[10px] text-[#4A5B70] font-medium mt-1">
              Heading {weather.windDeg ?? 0}° {weather.windGust ? `• Gusts ${weather.windGust}k` : ""}
            </span>
          </div>

          {/* 4. Humidity & Pressure */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#4A5B70] text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Air Humidity</span>
              <Droplets className="w-4 h-4 text-[#1C6FD9]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black font-sans text-[#0F1B2B]">
                {weather.humidity}
              </span>
              <span className="text-xs text-[#4A5B70] ml-1 font-semibold">%</span>
            </div>
            <span className="text-[10px] text-[#4A5B70] font-medium mt-1">
              Barometer {weather.pressure} hPa
            </span>
          </div>

          {/* 5. Visibility Runway Index */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-[#4A5B70] text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Visibility</span>
              <Eye className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black font-sans text-[#0F1B2B]">
                {weather.visibility ? Math.round(weather.visibility / 1000) : 10}
              </span>
              <span className="text-xs text-[#4A5B70] ml-1 font-semibold">km</span>
            </div>
            <span className="text-[10px] text-[#4A5B70] font-medium mt-1">
              {(weather.visibility ?? 10000) < 2000 ? "Fog / Reduced Visual" : "Optimal Clear LOS"}
            </span>
          </div>
        </div>
      )}

      {/* Transit Physics Risk Assessment Banner */}
      {weather?.riskAssessment && (
        <div className="relative z-10 mt-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F8FBFF] via-white to-[#F0F6FC] border border-[#74BCFB]/35 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          {/* Left: Risk Level Pill */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${riskColor}`}>
            {risk === "LOW" ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{risk} DISRUPTION RISK</span>
          </div>

          {/* Middle: Clean Advisory Text (in proper order, vertically centered, no emoji) */}
          <div className="flex-1 min-w-0 text-center md:text-left md:px-2 flex flex-col justify-center">
            <p className="text-xs font-bold text-[#0F1B2B] leading-normal">
              {(weather.riskAssessment.advisory || "").replace(/^[\p{Emoji}\s]+/u, "").trim()}
            </p>
            {weather.riskAssessment.breakdown && weather.riskAssessment.breakdown.length > 0 && (
              <p className="text-[11px] text-[#4A5B70] font-medium mt-0.5">
                • {weather.riskAssessment.breakdown[0].replace(/^[\p{Emoji}\s]+/u, "").trim()}
              </p>
            )}
          </div>

          {/* Mode Badges */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5B70] self-end md:self-auto flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <Plane className="w-3.5 h-3.5 text-[#1C6FD9]" />
              <span className="text-[#0F1B2B]">Flight:</span>
              <span className={weather.riskAssessment.flightRisk === "LOW" ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
                {weather.riskAssessment.flightRisk}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <Train className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="text-[#0F1B2B]">Rail:</span>
              <span className={weather.riskAssessment.trainRisk === "LOW" ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
                {weather.riskAssessment.trainRisk}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <Car className="w-3.5 h-3.5 text-[#047857]" />
              <span className="text-[#0F1B2B]">Road:</span>
              <span className={weather.riskAssessment.roadRisk === "LOW" ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
                {weather.riskAssessment.roadRisk}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
