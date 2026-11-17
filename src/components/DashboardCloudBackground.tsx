"use client";

import React from "react";
import { motion } from "framer-motion";

interface DashboardCloudBackgroundProps {
  status?: "NORMAL" | "AT_RISK" | "IMPOSSIBLE" | "RECOVERED";
}

export function DashboardCloudBackground({ status = "NORMAL" }: DashboardCloudBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ willChange: "transform, opacity", transform: "translate3d(0, 0, 0)" }}
    >
      {/* 1. Base Sky Gradient matching the top of the cloud wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4695E6] via-[#529CE8] to-[#6AAEF0]" />

      {/* 2. User's Paper-Cut Cloud Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-95 transition-opacity duration-700"
        style={{
          backgroundImage: "url('/dashboard-cloud-bg.jpg')",
        }}
      />

      {/* 3. Subtle ambient mood tint for simulation status */}
      {status === "IMPOSSIBLE" && (
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/15 via-rose-500/10 to-transparent transition-all duration-700" />
      )}
      {status === "AT_RISK" && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-transparent transition-all duration-700" />
      )}
      {status === "RECOVERED" && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent transition-all duration-700" />
      )}

      {/* 4. Subtle Ambient Light & Contrast Vignette so dashboard cards pop with crisp depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-[#2879D0]/20" />

      {/* 5. Delicate Floating Origami Paper Planes (Matching ReMode Theme) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="dashPlaneShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#083768" floodOpacity="0.2" />
          </filter>
          <g id="dashOrigamiPlane">
            <polygon points="0,-24 -12,0 0,-6" fill="#FFFFFF" />
            <polygon points="0,-24 12,0 0,-6" fill="#D3EBFF" />
            <polygon points="0,-6 -3,0 3,0" fill="#88BEF8" opacity="0.9" />
          </g>
        </defs>

        {/* Trail 1: Top Right Soaring Plane */}
        <path
          d="M 1100 650 C 1140 520, 1260 420, 1220 310 C 1190 230, 1100 200, 1050 220"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className="opacity-70"
        />
        <g transform="translate(1050, 220) rotate(-110) scale(0.9)" filter="url(#dashPlaneShadow)">
          <use href="#dashOrigamiPlane" />
        </g>

        {/* Trail 2: Top Left Gentle Glide Plane */}
        <path
          d="M 120 620 C 140 480, 210 380, 290 280 C 330 230, 390 210, 440 220"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className="opacity-70"
        />
        <g transform="translate(440, 220) rotate(75) scale(0.85)" filter="url(#dashPlaneShadow)">
          <use href="#dashOrigamiPlane" />
        </g>
      </svg>
    </div>
  );
}
