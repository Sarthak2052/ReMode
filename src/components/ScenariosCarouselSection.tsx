"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plane,
  Luggage,
  CloudSnow,
  Building2,
  Clock,
  Train,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ScenarioCard {
  id: string;
  category: "flights" | "connections" | "hotels" | "multimodal";
  badgeText: string;
  routeCode: string;
  title: string;
  authorSubtitle: string;
  synopsis: string;
  solutionHighlight: string;
  cardBg: string;
  accentColor: string;
  coverImage: string;
  textColor: string;
  tagColors: { label: string }[];
  scenarioParam: string;
}

export function ScenariosCarouselSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Exact solid, vibrant neo-brutalist pop colors matching HowItWorksSection.tsx
  const cards: ScenarioCard[] = [
    {
      id: "sc-1",
      category: "flights",
      badgeText: "FLIGHT DELAY",
      routeCode: "AA-402",
      title: "Keynote Buffer Defense",
      authorSubtitle: "AA-402 • JFK ➔ ORD ➔ DEN",
      synopsis:
        "Inbound ATC delay squeezes Denver keynote buffer from 90m down to 35m. Swaps ground transit for express cab.",
      solutionHighlight: "35m Buffer Secured",
      cardBg: "bg-[#4FA8F8]", // Electric Sky Blue
      accentColor: "#0A3D73",
      coverImage: "/covers/flight_delay.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Flight Delay" },
        { label: "Keynote" },
        { label: "Express Cab" },
      ],
      scenarioParam: "1",
    },
    {
      id: "sc-2",
      category: "flights",
      badgeText: "CANCELLATION",
      routeCode: "UA-882",
      title: "Luggage Continuity Rebook",
      authorSubtitle: "UA-882 • O'Hare Hub",
      synopsis:
        "Connecting flight cancelled at O'Hare with luggage checked through. Instantly rebooks United Direct Express.",
      solutionHighlight: "Baggage Sync Rebook",
      cardBg: "bg-[#FF5A8D]", // Vibrant Hot Coral / Magenta Pink (matches Step 2)
      accentColor: "#4A0022",
      coverImage: "/covers/midtransit_rebook.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Cancelled" },
        { label: "Bags Checked" },
        { label: "Waiver Active" },
      ],
      scenarioParam: "2",
    },
    {
      id: "sc-8",
      category: "multimodal",
      badgeText: "CASCADING CRISIS",
      routeCode: "ALL-IN-1",
      title: "Cascading Blizzard Crisis",
      authorSubtitle: "Flight + Crawford Hotel + Blizzard",
      synopsis:
        "Double disruption: flight delay + hotel walk + blizzard. Holistic graph solver recalculates all 3 legs simultaneously.",
      solutionHighlight: "3-Leg Graph Re-route",
      cardBg: "bg-[#9381FF]", // Royal Lavender / Purple (matches Step 4)
      accentColor: "#2A1878",
      coverImage: "/covers/snowstorm_crisis.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Multi-Modal" },
        { label: "3-Leg Solver" },
        { label: "Zero Delay" },
      ],
      scenarioParam: "8",
    },
    {
      id: "sc-4",
      category: "hotels",
      badgeText: "HOTEL WALK",
      routeCode: "HTL-CRW",
      title: "Boutique Suite Walk",
      authorSubtitle: "HTL-CRW • Crawford Overbooked",
      synopsis:
        "Crawford Hotel unavailable on arrival night. ReMode instantly rebooks a 4-star boutique 2 blocks away.",
      solutionHighlight: "4-Star Suite Guaranteed",
      cardBg: "bg-[#FFC94D]", // Sunny Golden Yellow / Amber (matches Step 3)
      accentColor: "#664200",
      coverImage: "/covers/hotel_walk.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Hotel Walk" },
        { label: "4-Star Suite" },
        { label: "100% Refund" },
      ],
      scenarioParam: "4",
    },
    {
      id: "sc-3",
      category: "connections",
      badgeText: "MISSED SPRINT",
      routeCode: "CO-104",
      title: "Concourse B-to-C Sprint",
      authorSubtitle: "CO-104 • DEN 15m Sprint",
      synopsis:
        "Inbound taxi delay leaves only 15 minutes to cross DIA. Swaps to next hourly shuttle with express boarding pass.",
      solutionHighlight: "Express Shuttle Transfer",
      cardBg: "bg-[#2CD9B8]", // Electric Aqua Mint / Teal (matches Step 1)
      accentColor: "#004D3F",
      coverImage: "/covers/concourse_sprint.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Tight 15m" },
        { label: "Concourse" },
        { label: "Shuttle" },
      ],
      scenarioParam: "3",
    },
    {
      id: "sc-6",
      category: "multimodal",
      badgeText: "TRAIN DELAY",
      routeCode: "TRN-ASP",
      title: "Amtrak Mountain Snowpack",
      authorSubtitle: "TRN-ASP • 3h Track Snowpack",
      synopsis:
        "Scenic mountain train delayed 3 hours by heavy snowpack on Aspen corridor. Dispatches express coach 20m out.",
      solutionHighlight: "Mountain Coach Dispatched",
      cardBg: "bg-[#FF7A50]", // Vibrant Sunset Tangerine Coral
      accentColor: "#591905",
      coverImage: "/covers/mountain_rail.jpg",
      textColor: "text-[#0F1B2B]",
      tagColors: [
        { label: "Train Delay" },
        { label: "Coach Rescue" },
        { label: "Priority Van" },
      ],
      scenarioParam: "6",
    },
  ];

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case "sc-1":
        return <Plane className="w-3.5 h-3.5 text-white" />;
      case "sc-2":
        return <Luggage className="w-3.5 h-3.5 text-white" />;
      case "sc-8":
        return <CloudSnow className="w-3.5 h-3.5 text-white" />;
      case "sc-4":
        return <Building2 className="w-3.5 h-3.5 text-white" />;
      case "sc-3":
        return <Clock className="w-3.5 h-3.5 text-white" />;
      case "sc-6":
        return <Train className="w-3.5 h-3.5 text-white" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-white" />;
    }
  };

  const tilts = [
    "-rotate-[2deg]",
    "rotate-[1deg]",
    "-rotate-[1.5deg]",
    "rotate-[2deg]",
    "-rotate-[1deg]",
    "rotate-[2.5deg]",
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="features"
      className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden border-t-3 border-[#0F1B2B]"
    >
      <div className="max-w-[1520px] mx-auto relative z-10">
        
        {/* =========================================================================
            HEADER (Centered Title + Subtitle + Top-Left Cursive Note)
            ========================================================================= */}
        <div className="relative pb-2 text-center">
          
          {/* Tilted Handwritten Script Note in Top-Left */}
          <div className="hidden lg:block absolute left-4 top-1 -rotate-6 select-none pointer-events-none">
            <span className="font-handwritten text-[#324578] text-xl xl:text-2xl font-bold leading-tight block max-w-[200px] text-left">
              Discover hidden routes and rescue blueprints
            </span>
          </div>

          {/* Giant Bold Centered Headline */}
          <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-[68px] text-[#0F1B2B] tracking-tight leading-none mb-3">
            Our Disruption Blueprints
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#4A5B70] font-medium max-w-xl mx-auto leading-relaxed">
            Deterministic recovery models calibrated across commercial aviation, Amtrak rail,
            and ground express connections.
          </p>
        </div>

        {/* =========================================================================
            NAVIGATION ARROWS (Positioned close above the cards)
            ========================================================================= */}
        <div className="flex items-center justify-end px-6 sm:px-12 mb-2">
          <div className="flex items-center gap-2.5 z-20">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous scenario"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F1B2B] hover:bg-[#1C6FD9] text-white flex items-center justify-center border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next scenario"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F1B2B] hover:bg-[#1C6FD9] text-white flex items-center justify-center border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CAROUSEL CONTAINER (Horizontal Scrolling Cards matching How It Works Style)
            ========================================================================= */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-5 sm:gap-6 pt-10 pb-10 px-6 sm:px-12 snap-x snap-mandatory scrollbar-none items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card, index) => {
            const tiltClass = tilts[index % tilts.length];
            const targetUrl = `/dashboard?scenario=${card.scenarioParam}`;
            const href = isAuthenticated
              ? targetUrl
              : `/login?redirect=${encodeURIComponent(targetUrl)}`;

            return (
              <Link
                key={card.id}
                href={href}
                className={`
                  group flex-shrink-0 w-[240px] sm:w-[265px] snap-start
                  transform ${tiltClass} hover:rotate-0 hover:scale-105 hover:z-30
                  transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform
                `}
              >
                {/* How-It-Works Style Solid Neo-Brutalist Card */}
                <div
                  className={`
                    ${card.cardBg}
                    border-3 border-[#0F1B2B]
                    rounded-[28px] sm:rounded-[32px]
                    shadow-[5px_6px_0px_#0F1B2B] group-hover:shadow-[7px_9px_0px_#0F1B2B]
                    p-3.5 sm:p-4 flex flex-col justify-between
                    h-full min-h-[385px] sm:min-h-[405px]
                    transition-all duration-300 overflow-hidden
                  `}
                >
                  {/* Framed Visual Banner with Neo-Brutalist Border */}
                  <div className="relative w-full h-24 sm:h-26 rounded-[18px] overflow-hidden border-2.5 border-[#0F1B2B] bg-white shadow-[2px_2px_0px_#0F1B2B] flex-shrink-0">
                    <Image
                      src={card.coverImage}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 215px, 240px"
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                    />

                    {/* Gradient Overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2B]/60 via-transparent to-transparent pointer-events-none" />

                    {/* Route Code Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F1B2B] text-white border border-[#0F1B2B] shadow-xs">
                      {getScenarioIcon(card.id)}
                      <span className="font-mono text-[9px] font-black tracking-wider">
                        {card.routeCode}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="pt-3 pb-0.5 px-0.5 flex flex-col justify-between flex-1">
                    
                    {/* Category Tag Pills (How-It-Works white sticker pills) */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.tagColors.map((tag, i) => (
                        <span
                          key={i}
                          className="font-sans text-[8px] sm:text-[8.5px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-white text-[#0F1B2B] border-1.5 border-[#0F1B2B] shadow-[1.5px_1.5px_0px_#0F1B2B]"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>

                    {/* Title (Sharp, bold geometric font-sans font-black matching theme) */}
                    <h3 className="font-sans font-black text-[17px] sm:text-[18px] leading-tight tracking-tight text-[#0F1B2B] line-clamp-1 mb-1">
                      {card.title}
                    </h3>

                    {/* Route Subtitle */}
                    <p className="font-sans font-black text-[10px] sm:text-[10.5px] tracking-tight uppercase text-[#0F1B2B]/75 truncate mb-1.5">
                      {card.authorSubtitle}
                    </p>

                    {/* Description Text */}
                    <p className="font-sans text-[11px] sm:text-[11.5px] font-bold leading-snug text-[#0F1B2B]/90 line-clamp-3 mb-3">
                      {card.synopsis}
                    </p>

                    {/* Status Bar & Action Button */}
                    <div className="pt-2.5 border-t-2 border-[#0F1B2B]/20 flex items-center justify-between text-[10px] font-black text-[#0F1B2B]">
                      <span className="flex items-center gap-1.5 text-[#0F1B2B]">
                        <span className="w-2 h-2 rounded-full bg-[#0F1B2B]" />
                        <span className="font-black text-[#0F1B2B]">{card.solutionHighlight}</span>
                      </span>
                      <span className="bg-[#0F1B2B] text-white px-2.5 py-1 rounded-full border border-[#0F1B2B] shadow-[1.5px_1.5px_0px_#0F1B2B] group-hover:bg-white group-hover:text-[#0F1B2B] transition-colors font-black text-[9.5px] flex items-center gap-1">
                        Simulate →
                      </span>
                    </div>

                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default ScenariosCarouselSection;
