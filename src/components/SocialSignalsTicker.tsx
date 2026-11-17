"use client";

import React, { useEffect, useState } from "react";
import { Radio, ExternalLink, RefreshCw, Clock } from "lucide-react";

interface Signal {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  relativeTime?: string;
  url: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "INFO";
  sentiment: string;
  transitImpact: string;
  snippet?: string;
}

interface SocialSignalsTickerProps {
  location?: string;
  className?: string;
}

function cleanDisplayCity(raw: string): string {
  if (!raw) return "Mumbai";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("bom") || lower.includes("mumbai") || lower.includes("csmt")) return "Mumbai";
  if (lower.includes("blr") || lower.includes("bengaluru") || lower.includes("bangalore")) return "Bengaluru";
  if (lower.includes("del") || lower.includes("delhi") || lower.includes("ndls")) return "Delhi";
  if (lower.includes("pnq") || lower.includes("pune")) return "Pune";
  if (lower.includes("hyd") || lower.includes("hyderabad")) return "Hyderabad";
  if (lower.includes("maa") || lower.includes("chennai")) return "Chennai";
  return raw.replace(/\(.*?\)/g, "").trim();
}

export function SocialSignalsTicker({ location = "Mumbai", className = "" }: SocialSignalsTickerProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(location);

  const displayCity = cleanDisplayCity(resolvedLocation || location);

  async function loadSignals(showSpin = true) {
    if (showSpin) setRefreshing(true);
    try {
      const res = await fetch(`/api/social-signals?location=${encodeURIComponent(location)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.signals) {
          setSignals(data.signals);
          if (data.location) setResolvedLocation(data.location);
        }
      }
    } catch (err) {
      console.warn("Failed to load live social signals:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSignals(false);
    const interval = setInterval(() => loadSignals(false), 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className={`bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-4 text-[#0F1B2B] ${className}`}>
      {/* Ticker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FF] border border-[#74BCFB]/40">
            <Radio className="w-3.5 h-3.5 text-[#1C6FD9]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1C6FD9]">
              Live Public Disruption Signals ({displayCity})
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#047857] bg-[#E6FBF7] px-2.5 py-1 rounded-full border border-[#A7F3D0] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            Live Feed (Active)
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadSignals(true)}
            disabled={refreshing}
            className="px-3 py-1 rounded-xl border border-gray-200 hover:border-[#74BCFB] text-xs font-bold text-[#4A5B70] hover:text-[#0F1B2B] bg-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Refresh live news feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#1C6FD9]" : ""}`} />
            <span>{refreshing ? "Scanning..." : "Refresh Signals"}</span>
          </button>
        </div>
      </div>

      {/* Ticker Stream Content */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {loading && signals.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#4A5B70] flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1C6FD9]" />
            <span>Scanning live public feeds for {displayCity} transit alerts...</span>
          </div>
        ) : signals.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#4A5B70] font-medium bg-[#F8FBFF] rounded-2xl border border-[#74BCFB]/30 p-4">
            No active severe public disruption reports detected for {displayCity} in the last 7 days.
          </div>
        ) : (
          signals.map((sig) => (
            <div
              key={sig.id}
              className="p-3.5 rounded-2xl bg-[#F8FBFF] border border-[#74BCFB]/30 hover:border-[#1C6FD9]/50 hover:bg-white transition-all shadow-[0_2px_8px_rgba(10,61,115,0.03)] flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      sig.severity === "CRITICAL"
                        ? "bg-[#FFECEC] text-[#C13A1F] border-[#FF5A5A]/30"
                        : sig.severity === "HIGH"
                        ? "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]"
                        : "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40"
                    }`}
                  >
                    {sig.category.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-[#0F1B2B] font-bold truncate">{sig.source}</span>
                  {sig.relativeTime && (
                    <span className="text-[10px] text-[#1C6FD9] font-mono font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#74BCFB]/30">
                      <Clock className="w-2.5 h-2.5" />
                      {sig.relativeTime}
                    </span>
                  )}
                  {sig.publishedAt && (
                    <span className="text-[10px] text-[#4A5B70] font-mono hidden sm:inline">
                      ({sig.publishedAt})
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-[#0F1B2B] group-hover:text-[#1C6FD9] transition-colors line-clamp-2 leading-snug">
                  {sig.title}
                </h5>
                <p className="text-[11px] text-[#4A5B70] italic line-clamp-2 font-medium">
                  &ldquo;{sig.transitImpact}&rdquo;
                </p>
              </div>

              {sig.url && sig.url !== "#" && (
                <a
                  href={sig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white border border-gray-200 text-[#4A5B70] hover:text-[#1C6FD9] hover:border-[#1C6FD9] shrink-0 self-center transition-all shadow-xs"
                  title="View original public report"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
