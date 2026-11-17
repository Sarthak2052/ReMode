"use client";

import React, { useState } from "react";

export function HowItWorksSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const steps = [
    {
      step: "Step #1",
      title: "Model your journey",
      description:
        "ReMode maps commercial flights, Amtrak rail, stays, and anchor events into an interconnected dependency graph.",
      bgColor: "bg-[#2CD9B8]", // Electric Aqua / Sky Cyan
      badgeColor: "text-[#0A3D73]",
      rotation: "lg:-rotate-6 -rotate-1",
      activeRotation: "lg:rotate-0 rotate-0",
      zIndex: "z-10",
      illustration: (
        <svg
          className="w-full h-32 sm:h-36"
          viewBox="0 0 200 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Calendar / Itinerary Grid Board */}
          <rect
            x="85"
            y="25"
            width="95"
            height="80"
            rx="12"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2.5"
          />
          {/* Calendar Header */}
          <path d="M85 45H180" stroke="#0F1B2B" strokeWidth="2" />
          <circle cx="100" cy="35" r="3" fill="#0F1B2B" />
          <circle cx="112" cy="35" r="3" fill="#0F1B2B" />
          {/* Calendar Mini Cells */}
          <rect x="95" y="52" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="114" y="52" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="133" y="52" width="12" height="10" rx="2" fill="#2CD9B8" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="152" y="52" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="95" y="68" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="114" y="68" width="12" height="10" rx="2" fill="#FF5A5A" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="133" y="68" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="152" y="68" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="95" y="84" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="114" y="84" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="133" y="84" width="12" height="10" rx="2" fill="#EAF5FF" stroke="#0F1B2B" strokeWidth="1.5" />
          <rect x="152" y="84" width="12" height="10" rx="2" fill="#2CD9B8" stroke="#0F1B2B" strokeWidth="1.5" />

          {/* Whimsical Character with Backpack and Pointer */}
          <path
            d="M36 58C36 50 44 44 54 44C64 44 70 50 70 58C70 64 66 69 61 70L61 74H45L45 70C40 68 36 63 36 58Z"
            fill="#0F1B2B"
          />
          <circle cx="53" cy="59" r="10" fill="#FFE5D9" stroke="#0F1B2B" strokeWidth="2.5" />
          <path d="M40 50C32 46 30 56 32 62" stroke="#0F1B2B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="58" cy="58" r="1.5" fill="#0F1B2B" />
          <path d="M57 62C56 64 54 64 53 63" stroke="#0F1B2B" strokeWidth="1.5" strokeLinecap="round" />

          {/* Torso */}
          <path
            d="M42 74L35 110C35 110 50 114 62 110L59 74H42Z"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2.5"
          />
          {/* Backpack */}
          <rect
            x="24"
            y="76"
            width="15"
            height="26"
            rx="6"
            fill="#FFC94D"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          {/* Arm pointing to schedule */}
          <path
            d="M58 80L85 64"
            stroke="#0F1B2B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="86" cy="63" r="3.5" fill="#FFE5D9" stroke="#0F1B2B" strokeWidth="2" />

          {/* Legs & Shoes */}
          <path d="M44 111L41 144" stroke="#0F1B2B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M54 111L58 144" stroke="#0F1B2B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M36 144H46" stroke="#0F1B2B" strokeWidth="4" strokeLinecap="round" />
          <path d="M55 144H66" stroke="#0F1B2B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      step: "Step #2",
      title: "Detect buffer erosion",
      description:
        "When delays strike, our 13-factor solver traces cascading ripples across concourses and connects before airlines notice.",
      bgColor: "bg-[#FF5A8D]", // Vibrant Magenta / Hot Pink
      badgeColor: "text-[#FFFFFF]",
      rotation: "lg:-rotate-2 rotate-0",
      activeRotation: "lg:rotate-0 rotate-0",
      zIndex: "z-20",
      illustration: (
        <svg
          className="w-full h-32 sm:h-36"
          viewBox="0 0 200 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Deck Chair */}
          <path
            d="M40 70L95 125"
            stroke="#0F1B2B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M75 125L135 125"
            stroke="#0F1B2B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M45 125L90 75"
            stroke="#0F1B2B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M105 125L135 90"
            stroke="#0F1B2B"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Hat and Traveler */}
          <path
            d="M45 52C45 52 52 42 66 45C76 47 78 55 78 55L88 56L42 53"
            fill="#0F1B2B"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          <ellipse cx="62" cy="54" rx="14" ry="4" fill="#FFC94D" stroke="#0F1B2B" strokeWidth="2" />
          <circle cx="62" cy="62" r="9" fill="#FFE5D9" stroke="#0F1B2B" strokeWidth="2.5" />
          <path d="M64 64C62 66 59 66 58 64" stroke="#0F1B2B" strokeWidth="1.5" strokeLinecap="round" />

          {/* Body */}
          <path
            d="M62 72L88 98L122 96"
            stroke="#0F1B2B"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M62 72L88 98L122 96"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M122 96L148 108"
            stroke="#0F1B2B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M148 108L155 104" stroke="#0F1B2B" strokeWidth="3.5" strokeLinecap="round" />

          {/* Phone */}
          <rect
            x="90"
            y="68"
            width="14"
            height="22"
            rx="3"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          <circle cx="97" cy="79" r="2.5" fill="#2CD9B8" />

          {/* Delay Alert Bubble */}
          <rect
            x="142"
            y="20"
            width="42"
            height="22"
            rx="6"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          <text x="148" y="34" fill="#FF5A5A" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            -55m ⚠
          </text>
        </svg>
      ),
    },
    {
      step: "Step #3",
      title: "Calculate rescue graph",
      description:
        "Generates 3 ranked recovery options (Fastest, Lowest Cost, Min Stress) with zero fantasy or unfeasible hops.",
      bgColor: "bg-[#FFC94D]", // Sunny Golden Yellow / Amber
      badgeColor: "text-[#0A3D73]",
      rotation: "lg:rotate-2 rotate-0",
      activeRotation: "lg:rotate-0 rotate-0",
      zIndex: "z-30",
      illustration: (
        <svg
          className="w-full h-32 sm:h-36"
          viewBox="0 0 200 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cloud */}
          <path
            d="M30 65C30 58 36 52 43 52C45 46 51 42 58 42C66 42 72 47 74 54C78 54 82 58 82 63C82 68 78 72 73 72H36C32 72 30 69 30 65Z"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          {/* Flight Trajectory */}
          <path
            d="M35 125C65 120 70 85 115 65"
            stroke="#0F1B2B"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          {/* Dynamic Aeroplane */}
          <g transform="translate(100, 32) rotate(-22)">
            <path
              d="M10 28C10 28 35 20 60 16C68 14 74 18 72 24C70 28 62 31 52 33L12 40L10 28Z"
              fill="#FFFFFF"
              stroke="#0F1B2B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M32 24L44 -8L54 -7L46 22"
              fill="#FFFFFF"
              stroke="#0F1B2B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M26 34L32 60L40 59L38 33"
              fill="#FFFFFF"
              stroke="#0F1B2B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 28L4 8L12 9L18 27"
              fill="#4FA8F8"
              stroke="#0F1B2B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="62" cy="22" r="2.5" fill="#0F1B2B" />
          </g>
          {/* Geometric Accents */}
          <circle cx="62" cy="115" r="8" fill="#FF5A8D" stroke="#0F1B2B" strokeWidth="2" />
          <polygon points="145,35 152,48 138,48" fill="#FFFFFF" stroke="#0F1B2B" strokeWidth="2" />
        </svg>
      ),
    },
    {
      step: "Step #4",
      title: "1-Click dispatch",
      description:
        "Execute multi-modal rebooking in seconds with automated airline waivers, luggage re-tagging, and chauffeur pickups.",
      bgColor: "bg-[#9381FF]", // Vibrant Lavender / Royal Purple
      badgeColor: "text-[#FFFFFF]",
      rotation: "lg:rotate-6 rotate-1",
      activeRotation: "lg:rotate-0 rotate-0",
      zIndex: "z-40",
      illustration: (
        <svg
          className="w-full h-32 sm:h-36"
          viewBox="0 0 200 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Character 1 */}
          <circle cx="60" cy="45" r="10" fill="#FFE5D9" stroke="#0F1B2B" strokeWidth="2.5" />
          <path d="M50 42C50 34 58 32 68 34C70 40 68 45 68 45H52Z" fill="#0F1B2B" />
          <path
            d="M50 56C50 56 46 88 46 95H74L70 56H50Z"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2.5"
          />
          {/* Confirmed Ticket Pass */}
          <rect
            x="24"
            y="16"
            width="20"
            height="15"
            rx="3"
            fill="#2CD9B8"
            stroke="#0F1B2B"
            strokeWidth="2"
            transform="rotate(-15 34 23)"
          />
          <path d="M29 23L33 26L39 19" stroke="#0F1B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Character 2 */}
          <circle cx="130" cy="52" r="11" fill="#FFE5D9" stroke="#0F1B2B" strokeWidth="2.5" />
          <path
            d="M120 48C120 38 132 38 140 44C144 48 142 56 142 56L122 52Z"
            fill="#0F1B2B"
          />
          <path
            d="M118 64L114 100H144L140 64H118Z"
            fill="#FFC94D"
            stroke="#0F1B2B"
            strokeWidth="2.5"
          />
          {/* Speech Bubble */}
          <rect
            x="76"
            y="92"
            width="56"
            height="24"
            rx="7"
            fill="#FFFFFF"
            stroke="#0F1B2B"
            strokeWidth="2"
          />
          <text x="83" y="107" fill="#0F1B2B" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            REBOOKED ✓
          </text>
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-[#EAF5FF] overflow-hidden">
      
      {/* =========================================================================
          AUTHENTIC FLUID TOPOGRAPHIC WAVES (Matching ReMode Hero Theme)
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
        <svg
          className="absolute -inset-x-8 -inset-y-12 w-[calc(100%+64px)] h-[calc(100%+96px)] opacity-60"
          viewBox="0 0 1920 800"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wave Layer 1: Cerulean Swirl (#74BCFB) */}
          <path
            d="M-50 480C220 530 460 360 740 420C1020 480 1200 660 1480 590C1760 520 1880 340 2000 370V850H-50V480Z"
            fill="#74BCFB"
            fillOpacity="0.25"
          />
          {/* Wave Layer 2: Deep Azure Ocean Swirl (#1C6FD9) */}
          <path
            d="M-50 560C310 490 560 620 860 540C1160 460 1340 320 1640 410C1840 470 1940 590 2000 570V850H-50V560Z"
            fill="#1C6FD9"
            fillOpacity="0.18"
          />
          {/* Wave Layer 3: Soft Horizon Crest */}
          <path
            d="M-50 640C380 610 680 720 1020 630C1360 540 1620 680 2000 610V850H-50V640Z"
            fill="#4FA8F8"
            fillOpacity="0.12"
          />
        </svg>
      </div>

      {/* Atmospheric Soft Depth Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-[#74BCFB]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-[#1C6FD9]/15 blur-3xl pointer-events-none" />

      {/* =========================================================================
          EXPANDED WIDTH & COMPACT HEIGHT CONTAINER (Theme Matched + Waves)
          ========================================================================= */}
      <div className="w-full max-w-[1660px] 2xl:max-w-[1780px] mx-auto bg-gradient-to-b from-[#FFFFFF] via-[#F4FAFF] to-[#EAF5FF] rounded-[32px] sm:rounded-[44px] lg:rounded-[52px] border-3 border-[#0F1B2B] shadow-[6px_8px_0px_#0F1B2B] p-5 sm:p-7 lg:px-10 lg:py-8 relative z-10 overflow-hidden">
        
        {/* Internal Topographic Wave Swirls inside the Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-[32px] sm:rounded-[44px] lg:rounded-[52px]">
          <svg
            className="absolute -top-20 -right-20 w-[600px] h-[400px] opacity-35"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M120 0C250 80 340 30 450 140C560 250 490 340 600 400H600V0H120Z"
              fill="#74BCFB"
            />
            <path
              d="M260 0C360 90 440 80 520 180C570 240 550 310 600 360V0H260Z"
              fill="#1C6FD9"
              fillOpacity="0.6"
            />
          </svg>
          <svg
            className="absolute -bottom-16 -left-16 w-[500px] h-[350px] opacity-25"
            viewBox="0 0 500 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120C140 100 220 220 340 180C420 150 460 80 500 60V350H0V120Z"
              fill="#74BCFB"
            />
          </svg>
        </div>

        {/* =========================================================================
            HEADER ROW (Headline + Tilted Cursive Note)
            ========================================================================= */}
        <div className="flex flex-wrap items-baseline gap-3 sm:gap-5 pb-6 sm:pb-8 relative z-10">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-[54px] text-[#0F1B2B] tracking-tight leading-none">
            How it works
          </h2>
          
          {/* Tilted Handwritten Script Note matching reference image */}
          <span className="font-handwritten text-[#1C6FD9] text-xl sm:text-2xl lg:text-[28px] font-bold -rotate-2 sm:-rotate-3 inline-block leading-tight select-none mt-0.5">
            Consider us your 24/7 autonomous travel dispatch
          </span>
        </div>

        {/* =========================================================================
            CARDS SHOWCASE — Centered, Overlapping Fanned Deck (Exact Reference Match)
            ========================================================================= */}
        <div className="relative pt-2 pb-6 z-10 flex justify-center items-center w-full overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap justify-center items-center gap-6 sm:gap-6 lg:gap-0 w-full max-w-7xl mx-auto px-2">
            {steps.map((item, idx) => {
              const isHovered = hoveredCard === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`
                    w-full sm:w-auto lg:w-[280px] xl:w-[305px] flex-shrink-0
                    ${idx > 0 ? "lg:-ml-12 xl:-ml-14" : ""}
                    ${isHovered ? "!z-50" : item.zIndex}
                    transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                    ${isHovered ? "scale-105 -translate-y-5" : ""}
                  `}
                >
                  <div
                    className={`
                      ${item.bgColor}
                      border-3 border-[#0F1B2B]
                      rounded-[28px] sm:rounded-[32px]
                      shadow-[5px_7px_0px_#0F1B2B]
                      p-5 sm:p-6 lg:p-6
                      h-full flex flex-col justify-between
                      min-h-[355px] sm:min-h-[385px] lg:min-h-[405px]
                      transform transition-transform duration-300
                      ${isHovered ? item.activeRotation : item.rotation}
                      cursor-pointer select-none
                    `}
                  >
                    {/* Top Handwritten Step Label */}
                    <div className="flex items-center justify-between">
                      <span className={`font-handwritten text-2xl sm:text-[28px] font-black ${item.badgeColor}`}>
                        {item.step}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0F1B2B]" />
                    </div>

                    {/* Playful Illustration */}
                    <div className="my-2 flex items-center justify-center overflow-hidden">
                      {item.illustration}
                    </div>

                    {/* Bottom Title & Description */}
                    <div className="pt-1.5">
                      <h3 className="font-display font-black text-xl sm:text-[21px] text-[#0F1B2B] leading-tight tracking-tight mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-semibold text-[#0F1B2B]/90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default HowItWorksSection;
