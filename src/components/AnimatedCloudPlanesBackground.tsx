"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedCloudPlanesBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ willChange: "transform", transform: "translate3d(0, 0, 0)" }}
    >
      {/* 1. Pure Crisp Aviation Sky Blue Gradient (Matching Landing Page theme) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#168EE6] via-[#2A9DF2] to-[#4EA9F8]" />

      {/* 2. Soft Drifting Cartoon Clouds (Enlarged and positioned downwards towards corners) */}
      {/* Left Cloud: Positioned downwards and closer to the left corner with larger presence */}
      <motion.div
        className="absolute top-[24%] sm:top-[27%] lg:top-[29%] left-2 sm:left-5 lg:left-8 pointer-events-none select-none z-10"
        style={{ willChange: "transform" }}
        animate={{ x: [0, 12, 0], y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 86 38"
          fill="none"
          className="w-36 h-auto sm:w-44 lg:w-56 drop-shadow-[0_6px_18px_rgba(8,55,104,0.18)]"
        >
          <rect x="8" y="14" width="70" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.9" />
          <circle cx="28" cy="14" r="14" fill="#FFFFFF" fillOpacity="0.9" />
          <circle cx="50" cy="17" r="12" fill="#FFFFFF" fillOpacity="0.9" />
        </svg>
      </motion.div>

      {/* Right Cloud: Positioned downwards and closer to the right corner with larger presence */}
      <motion.div
        className="absolute top-[26%] sm:top-[29%] lg:top-[32%] right-2 sm:right-5 lg:right-8 pointer-events-none select-none z-10"
        style={{ willChange: "transform" }}
        animate={{ x: [0, -10, 0], y: [0, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <svg
          viewBox="0 0 104 46"
          fill="none"
          className="w-40 h-auto sm:w-52 lg:w-64 drop-shadow-[0_6px_18px_rgba(8,55,104,0.18)]"
        >
          <rect x="10" y="18" width="84" height="24" rx="12" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="38" cy="18" r="16" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="66" cy="22" r="13" fill="#FFFFFF" fillOpacity="0.85" />
        </svg>
      </motion.div>

      {/* 3. SVG Canvas with Ticket Booking Contrails, Origami Airplanes, and Bottom Cloud Bank */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Plane elevation shadow */}
          <filter id="planeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#083768" floodOpacity="0.25" />
          </filter>

          {/* Reusable Origami Paper Plane (Tail anchored at exact origin (0, 0)) */}
          <g id="origamiPaperPlane">
            {/* Left Wing (Crisp pure white upper face) */}
            <polygon points="0,-34 -17,0 0,-9" fill="#FFFFFF" />
            {/* Right Wing (Soft sky blue shaded underwing) */}
            <polygon points="0,-34 17,0 0,-9" fill="#D3EBFF" />
            {/* Center Fold / Keel shadow */}
            <polygon points="0,-9 -4,0 4,0" fill="#88BEF8" opacity="0.95" />
          </g>
        </defs>

        {/* ------------------------------------------------------------------ */}
        {/* DOTTED FLIGHT TRAILS: Clean ticket booking flight paths             */}
        {/* Every trail originates behind bottom clouds and concludes at a plane */}
        {/* ------------------------------------------------------------------ */}

        {/* Trail 1: Hero Flight - From bottom cloud (260, 840) to Hero Plane (520, 205) */}
        <path
          d="M 260 840 
             C 270 700, 200 580, 240 460 
             C 280 340, 390 320, 420 380 
             C 440 420, 380 470, 340 430 
             C 310 390, 350 290, 430 230 
             C 460 210, 490 200, 520 205"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeDasharray="6 8"
          strokeLinecap="round"
          className="trail-dash-anim-1"
        />

        {/* Trail 2: Right Flight - From bottom cloud (1200, 840) to Right Plane (930, 215) */}
        <path
          d="M 1200 840 
             C 1220 700, 1290 580, 1250 460 
             C 1210 340, 1100 320, 1070 380 
             C 1050 420, 1110 470, 1150 430 
             C 1180 390, 1140 290, 1060 230 
             C 1020 205, 970 205, 930 215"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeDasharray="6 8"
          strokeLinecap="round"
          className="trail-dash-anim-2"
        />

        {/* Trail 3: Steep Left Margin Climb - From bottom cloud (170, 810) to Plane (125, 290) */}
        <path
          d="M 170 810 
             C 150 690, 70 590, 95 490 
             C 120 390, 155 350, 125 290"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeDasharray="6 8"
          strokeLinecap="round"
          className="trail-dash-anim-3"
        />

        {/* Trail 4: Steep Right Margin Climb - From bottom cloud (1270, 810) to Plane (1315, 290) */}
        <path
          d="M 1270 810 
             C 1290 690, 1370 590, 1345 490 
             C 1320 390, 1285 350, 1315 290"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeDasharray="6 8"
          strokeLinecap="round"
          className="trail-dash-anim-4"
        />

        {/* ------------------------------------------------------------------ */}
        {/* AIRPLANES: 100% ATTACHED & LOCKED TO DOTTED TRAIL ENDPOINTS        */}
        {/* Outer <g> fixes coordinates (immune to CSS transform resets).       */}
        {/* Inner <g> handles banking tilt around local tail (0, 0).           */}
        {/* ------------------------------------------------------------------ */}

        {/* PLANE 1 (Hero Plane): Pinned at (520, 205), banking up-right */}
        <g transform="translate(520, 205)">
          <g transform="rotate(78) scale(1.3)">
            <g className="plane-bank-tilt-1" filter="url(#planeShadow)">
              <use href="#origamiPaperPlane" />
            </g>
          </g>
        </g>

        {/* PLANE 2 (Right Plane): Pinned at (930, 215), banking up-left */}
        <g transform="translate(930, 215)">
          <g transform="rotate(-78) scale(1.25)">
            <g className="plane-bank-tilt-2" filter="url(#planeShadow)">
              <use href="#origamiPaperPlane" />
            </g>
          </g>
        </g>

        {/* PLANE 3 (Left Takeoff): Pinned at (125, 290), climbing up-left */}
        <g transform="translate(125, 290)">
          <g transform="rotate(-22) scale(1.15)">
            <g className="plane-bank-tilt-3" filter="url(#planeShadow)">
              <use href="#origamiPaperPlane" />
            </g>
          </g>
        </g>

        {/* PLANE 4 (Right Takeoff): Pinned at (1315, 290), climbing up-right */}
        <g transform="translate(1315, 290)">
          <g transform="rotate(22) scale(1.15)">
            <g className="plane-bank-tilt-4" filter="url(#planeShadow)">
              <use href="#origamiPaperPlane" />
            </g>
          </g>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* BOTTOM CUMULUS CLOUD BANK (Crisp, solid white, organic scalloped)  */}
        {/* ------------------------------------------------------------------ */}

        {/* Back Cloud Horizon Ridge (Soft Sky Blue Horizon Silhouette for depth) */}
        <g opacity="0.45" className="animate-bottom-cloud-back">
          <path
            d="M -50 960 
               L -50 820 
               Q 30 760 120 790 
               Q 210 740 310 770 
               Q 410 730 520 765 
               Q 630 720 740 755 
               Q 850 710 960 750 
               Q 1060 720 1170 760 
               Q 1270 725 1370 765 
               Q 1440 750 1500 800 
               L 1500 960 Z"
            fill="#E1F1FD"
          />
        </g>

        {/* Front Cloud Ridge (Pure Solid White #FFFFFF, Crisp Edges, No Blur/Light) */}
        <path
          d="M -50 960 
             L -50 840 
             Q 20 795 80 825 
             Q 150 765 240 795 
             Q 330 745 430 780 
             Q 520 735 630 770 
             Q 730 725 840 765 
             Q 940 730 1040 770 
             Q 1140 735 1240 775 
             Q 1330 750 1410 790 
             Q 1460 780 1500 830 
             L 1500 960 Z"
          fill="#FFFFFF"
        />

        {/* Harmonious overlapping cumulus scallops for natural billowy cloud volume */}
        <g fill="#FFFFFF">
          <circle cx="100" cy="840" r="55" />
          <circle cx="210" cy="820" r="65" />
          <circle cx="350" cy="805" r="75" />
          <circle cx="510" cy="795" r="82" />
          <circle cx="690" cy="785" r="88" />
          <circle cx="890" cy="785" r="86" />
          <circle cx="1090" cy="795" r="80" />
          <circle cx="1270" cy="810" r="72" />
          <circle cx="1420" cy="835" r="60" />
        </g>

        {/* Solid White Floor below y=850 to base of screen */}
        <rect x="-50" y="850" width="1540" height="130" fill="#FFFFFF" />
      </svg>

      {/* 4. Embedded CSS Animations: Contrail Streaming & In-Place Airplane Banking */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Continuous live streaming for dashed ticket contrails */
        .trail-dash-anim-1 {
          animation: streamDash 3s linear infinite;
        }
        .trail-dash-anim-2 {
          animation: streamDash 3.6s linear infinite;
        }
        .trail-dash-anim-3 {
          animation: streamDash 4s linear infinite;
        }
        .trail-dash-anim-4 {
          animation: streamDash 4.5s linear infinite;
        }

        @keyframes streamDash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -56;
          }
        }

        /* IN-PLACE AIRPLANE BANKING TILT:
           Pivoting around the tail origin (0, 0) keeps the airplane 100% locked to the dotted line */
        .plane-bank-tilt-1 {
          animation: planeBank1 4.5s ease-in-out infinite alternate;
          will-change: transform;
        }
        .plane-bank-tilt-2 {
          animation: planeBank2 5s ease-in-out infinite alternate;
          will-change: transform;
        }
        .plane-bank-tilt-3 {
          animation: planeBank3 4.2s ease-in-out infinite alternate;
          will-change: transform;
        }
        .plane-bank-tilt-4 {
          animation: planeBank4 4.8s ease-in-out infinite alternate;
          will-change: transform;
        }

        @keyframes planeBank1 {
          0% {
            transform: rotate(-3.5deg) scale(0.98);
          }
          100% {
            transform: rotate(3.5deg) scale(1.02);
          }
        }

        @keyframes planeBank2 {
          0% {
            transform: rotate(3.5deg) scale(0.98);
          }
          100% {
            transform: rotate(-3.5deg) scale(1.02);
          }
        }

        @keyframes planeBank3 {
          0% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(3deg);
          }
        }

        @keyframes planeBank4 {
          0% {
            transform: rotate(3deg);
          }
          100% {
            transform: rotate(-3deg);
          }
        }

        /* Bottom cloud gentle horizontal sway */
        .animate-bottom-cloud-back {
          animation: bottomCloudDrift 22s ease-in-out infinite alternate;
        }
        @keyframes bottomCloudDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(18px, 0, 0); }
        }
          `,
        }}
      />
    </div>
  );
}
