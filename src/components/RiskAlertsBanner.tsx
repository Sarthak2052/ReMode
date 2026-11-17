"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { RiskAlert } from "@/types";

interface RiskAlertsBannerProps {
  alerts: RiskAlert[];
}

export const RiskAlertsBanner: React.FC<RiskAlertsBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="max-w-7xl mx-auto space-y-2">
        {alerts.map((al) => (
          <div
            key={al.id}
            className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-amber-200/80 shadow-[0_4px_20px_rgba(245,158,11,0.08)] text-xs transition-all hover:border-amber-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <span className="font-extrabold text-[#0F1B2B]">{al.title}: </span>
                <span className="text-[#4A5B70] font-medium">{al.message}</span>
              </div>
            </div>
            {al.suggestedAction && (
              <span className="hidden sm:inline-flex items-center font-bold text-xs text-[#1C6FD9] bg-[#EAF5FF] px-3.5 py-1.5 rounded-full border border-[#74BCFB]/40 shrink-0 shadow-2xs">
                {al.suggestedAction}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
