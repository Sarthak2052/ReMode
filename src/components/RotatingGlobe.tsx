"use client";

import React from "react";
import { motion } from "motion/react";

interface RotatingGlobeProps {
  className?: string;
  size?: number | string;
}

/* Minimalist Modern Airplane Silhouette */
const MinimalPlane: React.FC = () => (
  <g transform="rotate(90)">
    {/* Clean White Fuselage & Wings with Dark Outline */}
    <path
      d="M 0 -11 C 2 -11, 2.8 -6, 2.8 0 L 12 4 L 12 6.5 L 2.4 4.5 L 2 10 L 5.5 12.5 L 5.5 14 L 0 12.8 L -5.5 14 L -5.5 12.5 L -2 10 L -2.4 4.5 L -12 6.5 L -12 4 L -2.8 0 C -2.8 -6, -2 -11, 0 -11 Z"
      fill="#FFFFFF"
      stroke="#0F1B2B"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Minimal Electric Sky Cockpit Visor */}
    <path
      d="M -1.4 -7 C -1.4 -9, 1.4 -9, 1.4 -7 C 1.4 -5.5, -1.4 -5.5, -1.4 -7 Z"
      fill="#1C6FD9"
    />
  </g>
);

export const RotatingGlobe: React.FC<RotatingGlobeProps> = ({
  className = "",
  size,
}) => {
  // Tile width for seamless horizontal wrapping
  const tileWidth = 240;

  return (
    <motion.div
      className={`relative select-none pointer-events-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="-15 -15 230 230"
        className="w-full h-full overflow-visible drop-shadow-[0_16px_32px_rgba(10,61,115,0.22)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular Clip for the Planet Sphere */}
          <clipPath id="globe-sphere-mask">
            <circle cx="100" cy="100" r="76" />
          </clipPath>

          {/* 3D Sphere Depth Gradient (Crescent Shadow on Bottom-Right) */}
          <radialGradient
            id="globe-3d-shading"
            cx="40%"
            cy="36%"
            r="65%"
            fx="40%"
            fy="36%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="55%" stopColor="#1C6FD9" stopOpacity="0" />
            <stop offset="85%" stopColor="#08254A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#051730" stopOpacity="0.75" />
          </radialGradient>

          {/* Ocean Base Gradient */}
          <linearGradient id="ocean-gradient" x1="100" y1="24" x2="100" y2="176" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3E8DFF" />
            <stop offset="50%" stopColor="#256FEF" />
            <stop offset="100%" stopColor="#1651B8" />
          </linearGradient>

          {/* Outer Atmosphere Glow Gradient */}
          <radialGradient id="atmosphere-glow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#74BCFB" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#4FA8F8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1C6FD9" stopOpacity="0" />
          </radialGradient>

          {/* Orbit Front Half Clip (y >= 99.5 in rotated ellipse frame) */}
          <clipPath id="orbit-clip-front">
            <rect x="-60" y="99.5" width="320" height="200" />
          </clipPath>

          {/* Orbit Back Half Clip (y <= 100.5 in rotated ellipse frame) */}
          <clipPath id="orbit-clip-back">
            <rect x="-60" y="-80" width="320" height="181" />
          </clipPath>
        </defs>

        {/* =========================================================================
            LAYER 1: BACK ORBIT & AIRPLANE (Travels BEHIND the Earth sphere)
            ========================================================================= */}
        <g transform="rotate(-24 100 100)" clipPath="url(#orbit-clip-back)">
          {/* Dashed Flight Path (Back Segment) */}
          <ellipse
            cx="100"
            cy="100"
            rx="96"
            ry="42"
            stroke="#4FA8F8"
            strokeWidth="1.3"
            strokeDasharray="4 6"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* Animated Plane (Back Half - slightly smaller for 3D depth) */}
          <g>
            <animateMotion
              dur="7.5s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 196, 100 a 96,42 0 1,1 -192,0 a 96,42 0 1,1 192,0 Z"
            />
            <g transform="scale(0.85)" opacity="0.8">
              <MinimalPlane />
            </g>
          </g>
        </g>

        {/* =========================================================================
            OUTER ATMOSPHERIC RINGS (matches reference illustration halo)
            ========================================================================= */}
        {/* Soft Outer Halo */}
        <circle
          cx="100"
          cy="100"
          r="93"
          fill="url(#atmosphere-glow)"
        />

        {/* Concentric Translucent Atmosphere Border */}
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="#1C6FD9"
          strokeWidth="6"
          strokeOpacity="0.25"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="#74BCFB"
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />

        {/* =========================================================================
            PLANET SPHERE (Clipped Inside R=76)
            ========================================================================= */}
        <g clipPath="url(#globe-sphere-mask)">
          {/* Base Ocean Background */}
          <circle cx="100" cy="100" r="76" fill="url(#ocean-gradient)" />

          {/* Deep Ocean Current Bands (Subtle darker blue layers) */}
          <rect x="0" y="70" width="200" height="24" rx="12" fill="#1C57C6" fillOpacity="0.5" />
          <rect x="0" y="118" width="200" height="18" rx="9" fill="#1C57C6" fillOpacity="0.5" />

          {/* CONTINENT & CLOUD TILES — Seamless Horizontal 360° Rotation */}
          <motion.g
            animate={{
              x: [0, -tileWidth],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* We render 2 identical tiles side by side for a seamless infinite loop */}
            {[0, tileWidth].map((offset) => (
              <g key={offset} transform={`translate(${offset}, 0)`}>
                {/* -------------------------------------------------------------
                    GREEN LANDMASSES (Rounded horizontal capsules with vertical bends)
                    ------------------------------------------------------------- */}
                {/* North Continent — Upper Section */}
                <rect x="30" y="44" width="70" height="22" rx="11" fill="#2CD96B" />
                <rect x="68" y="44" width="24" height="42" rx="11" fill="#2CD96B" />
                <rect x="52" y="64" width="85" height="24" rx="12" fill="#2CD96B" />

                {/* Landmass Shading Layer (Translucent deep green overlap) */}
                <rect x="42" y="52" width="55" height="14" rx="7" fill="#159946" fillOpacity="0.45" />
                <rect x="65" y="68" width="50" height="14" rx="7" fill="#159946" fillOpacity="0.35" />

                {/* Sub-Continent / Islands */}
                <rect x="155" y="52" width="48" height="18" rx="9" fill="#22C55E" />
                <rect x="170" y="64" width="55" height="20" rx="10" fill="#2CD96B" />

                {/* South Continent — Lower Section */}
                <rect x="38" y="112" width="62" height="22" rx="11" fill="#2CD96B" />
                <rect x="74" y="118" width="20" height="34" rx="10" fill="#2CD96B" />
                <rect x="58" y="132" width="75" height="22" rx="11" fill="#2CD96B" />

                {/* South Continent Shading */}
                <rect x="48" y="120" width="45" height="12" rx="6" fill="#159946" fillOpacity="0.45" />
                <rect x="70" y="138" width="45" height="12" rx="6" fill="#159946" fillOpacity="0.35" />

                {/* Secondary Southern Landmass */}
                <rect x="150" y="122" width="68" height="20" rx="10" fill="#22C55E" />

                {/* -------------------------------------------------------------
                    WHITE & CYAN CLOUDS (Curved atmosphere puffs with rounded ends)
                    ------------------------------------------------------------- */}
                {/* Top-Right Big White Cloud Formations */}
                <path
                  d="M125 40 h35 a12 12 0 0 1 12 12 v4 a14 14 0 0 1 -14 14 h-22 a10 10 0 0 1 -10 -10 v-10 a10 10 0 0 1 9 -10 Z"
                  fill="#FFFFFF"
                />
                <rect x="145" y="64" width="42" height="16" rx="8" fill="#FFFFFF" fillOpacity="0.95" />
                <rect x="135" y="58" width="30" height="14" rx="7" fill="#BAE6FD" fillOpacity="0.8" />

                {/* Lower-Right Atmosphere Cloud Pill */}
                <rect x="140" y="104" width="38" height="15" rx="7.5" fill="#FFFFFF" fillOpacity="0.9" />
                <rect x="130" y="112" width="28" height="12" rx="6" fill="#93C5FD" fillOpacity="0.75" />

                {/* Floating Soft Cloud Streaks */}
                <rect x="12" y="88" width="36" height="10" rx="5" fill="#FFFFFF" fillOpacity="0.65" />
                <rect x="105" y="94" width="44" height="11" rx="5.5" fill="#FFFFFF" fillOpacity="0.75" />
              </g>
            ))}
          </motion.g>

          {/* 3D Sphere Spherical Lighting & Shadow Overlay */}
          <circle cx="100" cy="100" r="76" fill="url(#globe-3d-shading)" />

          {/* Top-Left Specular Atmosphere Arc Highlight */}
          <path
            d="M52 46 A 74 74 0 0 1 115 28"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Subtle Inner Edge Vignette */}
          <circle
            cx="100"
            cy="100"
            r="75"
            stroke="#0A2D6C"
            strokeWidth="3"
            strokeOpacity="0.4"
          />
        </g>

        {/* =========================================================================
            LAYER 3: FRONT ORBIT & AIRPLANE (Travels IN FRONT of Earth sphere)
            ========================================================================= */}
        <g transform="rotate(-24 100 100)" clipPath="url(#orbit-clip-front)">
          {/* Dashed Flight Path (Front Segment in front of Earth) */}
          <ellipse
            cx="100"
            cy="100"
            rx="96"
            ry="42"
            stroke="#1C6FD9"
            strokeWidth="1.6"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* Animated Plane (Front Half - full scale closer to camera) */}
          <g>
            <animateMotion
              dur="7.5s"
              repeatCount="indefinite"
              rotate="auto"
              path="M 196, 100 a 96,42 0 1,1 -192,0 a 96,42 0 1,1 192,0 Z"
            />
            <g transform="scale(1.08)">
              <MinimalPlane />
            </g>
          </g>
        </g>

        {/* =========================================================================
            WHIMSICAL STAR SPARKLES (matches reference art style)
            ========================================================================= */}
        {/* Top-Right 4-Point Diamond Star */}
        <motion.path
          d="M178 30 Q 182 30 182 26 Q 182 30 186 30 Q 182 30 182 34 Q 182 30 178 30 Z"
          fill="#4FA8F8"
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bottom-Left Mini Diamond Star */}
        <motion.path
          d="M22 152 Q 25 152 25 149 Q 25 152 28 152 Q 25 152 25 155 Q 25 152 22 152 Z"
          fill="#1C6FD9"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Tiny Orbit Sparkle Dots */}
        <circle cx="18" cy="75" r="2" fill="#74BCFB" opacity="0.8" />
        <circle cx="184" cy="120" r="2.5" fill="#4FA8F8" opacity="0.8" />
        <circle cx="160" cy="172" r="1.5" fill="#1C6FD9" opacity="0.7" />
      </svg>
    </motion.div>
  );
};
