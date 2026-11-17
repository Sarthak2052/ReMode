"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { RotatingGlobe } from "@/components/RotatingGlobe";
import TextPressure from "@/components/TextPressure";
import { ScenariosCarouselSection } from "@/components/ScenariosCarouselSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AirplaneLightRevealOverlay } from "@/components/AirplaneLightRevealOverlay";
import {
  Plane,
  Train,
  Car,
  ShieldCheck,
  Zap,
  RotateCw,
  ArrowRight,
  User,
  CheckCircle2,
} from "lucide-react";

// Dynamic circular orbital flight trajectories (originating from BEHIND the boarding pass)
const TICKET_FLIGHT_PATHS = [
  // 1. Clockwise Orbital Arc sweeping around Right and High over Top
  "M 268 350 C 350 340, 480 290, 490 180 C 500 70, 390 0, 268 -10 C 170 -18, 90 20, 20 80",
  // 2. Counter-Clockwise Orbital Arc sweeping around Left and High over Top
  "M 268 350 C 186 340, 56 290, 46 180 C 36 70, 146 0, 268 -10 C 366 -18, 446 20, 516 80",
  // 3. Ascending Circular Spiral soaring into Top-Right
  "M 268 350 C 340 310, 440 240, 490 150 C 530 70, 530 -20, 570 -60",
  // 4. Ascending Circular Spiral soaring into Top-Left
  "M 268 350 C 196 310, 96 240, 46 150 C 6 70, 6 -20, -34 -60",
  // 5. Circular Arc sweeping out Right and rounding under Bottom
  "M 268 350 C 350 370, 470 420, 490 500 C 510 590, 430 660, 330 690 C 220 720, 120 690, 40 650",
  // 6. Circular Arc sweeping out Left and rounding under Bottom
  "M 268 350 C 186 370, 66 420, 46 500 C 26 590, 106 660, 206 690 C 316 720, 416 690, 496 650",
];

function HeroWidgets() {
  const [mode, setMode] = useState<"air" | "rail" | "ride">("air");
  const [guaranteed, setGuaranteed] = useState(true);
  const [latency, setLatency] = useState(182);
  const [pinging, setPinging] = useState(false);

  const handlePing = () => {
    if (pinging) return;
    setPinging(true);
    const newSpeed = Math.floor(Math.random() * 40) + 120;
    setTimeout(() => {
      setLatency(newSpeed);
      setPinging(false);
    }, 350);
  };

  const modeLabels = {
    air: "Direct Flights",
    rail: "Express Rail",
    ride: "Ground Chauffeur",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl w-full select-none">
      {/* Widget 1: Multi-Modal */}
      <div className="group p-2.5 sm:p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-[#1C6FD9]/15 hover:border-[#1C6FD9]/50 shadow-[0_4px_14px_rgba(10,61,115,0.04)] hover:shadow-[0_8px_20px_rgba(28,111,217,0.12)] transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] flex items-center justify-center transition-transform group-hover:scale-105">
              {mode === "air" && <Plane className="w-3.5 h-3.5" />}
              {mode === "rail" && <Train className="w-3.5 h-3.5" />}
              {mode === "ride" && <Car className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs font-black text-[#0F1B2B] tracking-tight">
              Multi-Modal
            </span>
          </div>

          <div className="flex items-center gap-0.5 bg-[#EAF5FF] p-0.5 rounded-lg">
            {(["air", "rail", "ride"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  mode === m
                    ? "bg-[#1C6FD9] text-white shadow-xs"
                    : "text-[#8A9BA8] hover:text-[#0F1B2B]"
                }`}
                title={`Switch to ${m}`}
                aria-label={m}
              >
                {m === "air" && <Plane className="w-2.5 h-2.5" />}
                {m === "rail" && <Train className="w-2.5 h-2.5" />}
                {m === "ride" && <Car className="w-2.5 h-2.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A5B70] pt-0.5">
          <span className="truncate">{modeLabels[mode]}</span>
          <span className="text-[9.5px] font-mono font-bold text-[#1C6FD9] bg-[#EAF5FF] px-1 py-0.2 rounded">
            SYNCED
          </span>
        </div>
      </div>

      {/* Widget 2: Policy Sentinel */}
      <div
        onClick={() => setGuaranteed((g) => !g)}
        className="group p-2.5 sm:p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-[#1C6FD9]/15 hover:border-[#00A878]/50 shadow-[0_4px_14px_rgba(10,61,115,0.04)] hover:shadow-[0_8px_20px_rgba(0,168,120,0.12)] transition-all duration-200 flex flex-col justify-between cursor-pointer"
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#E6FAF5] text-[#00A878] flex items-center justify-center transition-transform group-hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-[#0F1B2B] tracking-tight">
              Zero Fake
            </span>
          </div>

          <div
            className={`w-6 h-3.5 rounded-full p-0.5 transition-colors ${
              guaranteed ? "bg-[#00A878]" : "bg-[#8A9BA8]"
            }`}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-white shadow-xs"
              animate={{ x: guaranteed ? 10 : 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A5B70] pt-0.5">
          <span>{guaranteed ? "100% Policy-Safe" : "Flexible MCT"}</span>
          <span className="text-[9.5px] font-mono font-bold text-[#00A878] bg-[#E6FAF5] px-1 py-0.2 rounded">
            LOCKED
          </span>
        </div>
      </div>

      {/* Widget 3: Sub-Second Speed Ping */}
      <div
        onClick={handlePing}
        className="group p-2.5 sm:p-3 rounded-2xl bg-white/95 hover:bg-white border-2 border-[#1C6FD9]/15 hover:border-[#F27A18]/50 shadow-[0_4px_14px_rgba(10,61,115,0.04)] hover:shadow-[0_8px_20px_rgba(242,122,24,0.12)] transition-all duration-200 flex flex-col justify-between cursor-pointer"
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-[#FFF5EB] text-[#F27A18] flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-[#0F1B2B] tracking-tight">
              Sub-Second
            </span>
          </div>

          <RotateCw
            className={`w-3 h-3 text-[#8A9BA8] transition-all ${
              pinging ? "animate-spin text-[#F27A18]" : "group-hover:rotate-90 group-hover:text-[#F27A18]"
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A5B70] pt-0.5">
          <span className="font-mono text-xs font-black text-[#0F1B2B]">
            {pinging ? "Solving..." : `< ${latency}ms`}
          </span>
          <span className="text-[9.5px] font-mono font-bold text-[#F27A18] bg-[#FFF5EB] px-1 py-0.2 rounded">
            FAST
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("remode_active_trip_id");
      if (stored) {
        setActiveTripId(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // When unauthenticated -> login first
  // When authenticated -> view active trip dashboard details (or trip input form if new)
  const protectJourneyHref = !isAuthenticated
    ? "/login?redirect=/trip/new"
    : activeTripId
    ? `/dashboard?tripId=${encodeURIComponent(activeTripId)}`
    : "/trip/new";

  // If a trip or payment success lands here, immediately direct to Dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search && (search.includes("tripId=") || search.includes("paymentSuccess="))) {
        router.replace(`/dashboard${search}`);
      }
    }
  }, [router]);

  // Splash page flight reveal animation state
  const [showSplash, setShowSplash] = useState(true);

  // Ticket hover flight animation state
  const [isTicketHovered, setIsTicketHovered] = useState(false);
  const [flightPathIndex, setFlightPathIndex] = useState(0);
  const [flightCycle, setFlightCycle] = useState(0);

  const triggerNextFlight = useCallback(() => {
    setFlightPathIndex((prev) => {
      let next = Math.floor(Math.random() * TICKET_FLIGHT_PATHS.length);
      if (next === prev) next = (prev + 1) % TICKET_FLIGHT_PATHS.length;
      return next;
    });
    setFlightCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!isTicketHovered) return;
    const interval = setInterval(() => {
      triggerNextFlight();
    }, 1500);
    return () => clearInterval(interval);
  }, [isTicketHovered, triggerNextFlight]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setTimeout(() => {
          if (hash === "footer") {
            const footerEl = document.getElementById("footer");
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
            }
          } else {
            const el = document.getElementById(hash);
            if (el) {
              const navbarOffset = 76;
              const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navbarOffset);
              window.scrollTo({ top: targetY, behavior: "smooth" });
            }
          }
        }, 200);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col selection:bg-[#4FA8F8] selection:text-[#FFFFFF] overflow-x-hidden">
      {/* Flight Takeoff Splash Reveal */}
      {showSplash && (
        <AirplaneLightRevealOverlay forcePlay={true} onComplete={() => setShowSplash(false)} />
      )}

      <Navbar />

      {/* =========================================================================
          HERO SECTION — Sky Theme Waves + Aviation Boarding Pass Tickets
          ========================================================================= */}
      <section id="hero" className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-center overflow-hidden bg-[#EAF5FF] rounded-b-[40px] sm:rounded-b-[56px] border-b-2 border-[#1C6FD9]/15 shadow-[0_24px_60px_rgba(10,61,115,0.07)] pt-14 sm:pt-16 pb-12 sm:pb-16">
        {/* =========================================================================
            AARDVARK-STYLE 3-SHADE FLUID TOPOGRAPHIC WAVES WITH LIVING MOTION
            ========================================================================= */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
          <svg
            className="absolute -inset-x-10 -inset-y-10 w-[calc(100%+80px)] h-[calc(100%+80px)]"
            viewBox="0 0 1920 1403"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shade 1: Base Canvas Background is #EAF5FF */}

            {/* Shade 2: Mid Cerulean Primary Swirl Layer (#74BCFB) with Gentle Floating Animation */}
            <motion.g
              animate={{
                x: [0, 28, -22, 14, 0],
                y: [0, -24, 18, -12, 0],
                rotate: [0, 1.2, -0.9, 0.5, 0],
                scale: [1, 1.025, 0.99, 1.015, 1],
              }}
              transition={{
                duration: 9.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                willChange: "transform",
              }}
            >
              <path
                d="M1695.07 151.632c64.24-31.904 131.73-7.088 176.11 42.102 40.17 44.528 55.82 98.753 61.56 156.949 6.14 62.16-2.03 123.84-5.58 185.677-3.39 59.179-3.64 118.025 17.39 174.679 10.72 28.85 25.42 55.218 51.77 73.069 37.97 25.728 81.74 25.202 122.06-1.291 30.97-20.344 55.08-47.559 77.62-76.157v264.039c-58.87 19.501-116.27 43.421-174.84 63.861-44.23 15.43-89.54 27.89-136.8 29.55-56.61 1.99-105.94-14-133.74-67.126-13.24-25.298-23.19-53.745-27.66-81.867-8.42-53.005-10.61-106.956-17.74-160.196-3.59-26.806-9.33-54.115-19.35-79.093-19.69-49.067-66.48-65.165-114.61-43.224-29.94 13.641-55.74 33.151-80.62 54.275-37 31.428-73.18 64.005-112.05 92.942-22.25 16.551-48.12 29.623-74.19 39.345-41.28 15.384-78.24 2.614-110.36-26.124-31.39-28.102-50.42-64.67-70.05-100.935-11.96-22.103-24.51-43.883-37.17-65.587-3.23-5.562-7.57-10.586-11.94-15.365-27.98-30.646-58.88-30.767-82.42 3.757-19.89 29.17-34.427 61.976-51.488 93.082-21.019 38.326-40.302 77.781-63.758 114.584-39.329 61.713-97.979 101.491-163.715 129.981-59.999 26.005-121.922 47.501-182.611 71.931-42.824 17.23-83.179 39.5-118.338 69.59-34.021 29.14-59.637 64.2-65.374 110.44-3.776 30.48 4.892 57.48 24.129 81.15 36.407 44.77 86.741 62.81 141.012 73.57 59.97 11.89 120.728 11.08 181.378 12.17 61.192 1.09 122.363 2.43 181.917 18.66 37.051 10.09 72.202 24.64 102.005 49.74 39.753 33.48 57.763 73.94 57.933 120.19H226.533c-32.085-15.58-61.858-36.47-89.169-62.36-48.299-45.77-73.99-103.5-81.404-168.72-13.75-120.96 23.385-223.39 117.115-302.9 47.855-40.585 105.059-63.358 164.62-80.624 55.764-16.161 111.972-30.874 167.344-48.27 81.076-25.473 126.787-83.135 138.108-165.858 7.617-55.667 10.094-112.134 12.801-168.345 3.398-70.665 5.964-141.34 26.451-209.729 14.422-48.177 37.313-91.294 76.771-124.226 54.474-45.449 114.019-50.265 177.528-22.453 57.146 25.041 98.342 69.929 140.732 113.528 45.29 46.59 90.28 93.645 138.12 137.532 35.4 32.486 79.11 50.935 127.66 56.479 46.17 5.271 86.45-6.277 120.85-38.421 37.86-35.39 61.71-79.931 84.98-125.169 20.81-40.424 41.24-81.195 64.93-119.919 19.97-32.658 45.75-61.364 81.1-78.913"
                fill="#74BCFB"
                stroke="#74BCFB"
                strokeWidth="1.5"
              />
            </motion.g>

            {/* Shade 3: Deep Royal Electric Azure Swirl Layer (#1C6FD9) with Opposing Motion */}
            <motion.g
              animate={{
                x: [0, -32, 24, -16, 0],
                y: [0, 26, -18, 14, 0],
                rotate: [0, -1.2, 1.0, -0.6, 0],
                scale: [1, 0.985, 1.022, 0.995, 1],
              }}
              transition={{
                duration: 12.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                willChange: "transform",
              }}
            >
              <path
                d="M957.607 848.011c20.203-17.228 39.917-18.164 60.863-1.598 24.27 19.186 39.37 45.721 56.29 70.767 20.96 31.054 43.97 59.866 77.1 79.279 41.59 24.371 83.09 22.411 120.71-5.291 52.77-38.829 86.04-99.464 141.58-134.68 55.94-35.443 123.8-13.01 158.65 32.594 24.12 31.568 37.13 67.993 49.5 105.059 15.59 46.719 30.26 93.909 49.19 139.269 17.07 40.92 45.88 73.4 88.67 90.21 28.36 11.14 57.68 9.52 87.02 3.74 41.87-8.25 78.62-28.78 116.22-47.63 33.58-16.84 67.56-33.2 102.44-47.01 26.07-10.33 55.11-9.2 82.05-3.2 56.46 12.08 85.31 54.13 71.77 110.37-5.95 24.65-16.34 48.25-25.99 72.01l-200.78 210.09c-1.38 21.8-56.65 62.14-72.01 78.21-83.44-113.45-193.12-200.93-308.88-278.2-32.4-21.62-122-69.18-168.22-88.23-46.23-19.06-83.56-40.17-105.3-15.59-6.32 7.14-8.24 18.89-4.06 34.64 17.72 66.79 82.4 117.75 128.69 165.26 41.55 42.65 79.03 83.98 109.75 135.17 27.95 54.83 33.11 111.22.04 165.6-11.32 18.46-23.77 36.39-36.62 54.15h-398.04c11.97-17.53 23.77-35.16 35.19-53.04 51.48-80.58 72.49-167.09 44.19-261.54-17.6-58.74-55.7-101.56-103.96-136.93-77.07-56.49-164.4-70.38-256.68-58.91-90.677 11.28-180.716 36.61-272.653 33.39-53.175-1.87-76.339-50.6-54.608-99.18 12.558-28.06 37.122-45.2 63.16-59.83 65.899-37.02 146.081-33.01 217.687-51.68 64.376-16.8 100.398-59.8 109.708-125.523 3.03-21.431 6.031-42.89 10.139-64.133 3.621-18.691 12.243-34.869 27.194-47.613"
                fill="#1C6FD9"
                stroke="#1C6FD9"
                strokeWidth="1.5"
              />
            </motion.g>
          </svg>

          {/* Soft Atmospheric Depth Gradient in Top Right */}
          <div className="absolute top-[8%] right-[8%] w-[480px] h-[480px] rounded-full bg-[#4FA8F8]/15 blur-3xl pointer-events-none"></div>
        </div>

        {/* Rotating Cartoon Earth Globe (Enlarged, positioned in middle-left corner) */}
        <div className="absolute top-[44%] sm:top-[46%] lg:top-[48%] -translate-y-1/2 -left-18 sm:-left-22 lg:-left-26 xl:-left-20 z-10 pointer-events-none select-none">
          <RotatingGlobe className="w-56 h-56 sm:w-72 sm:h-72 lg:w-[340px] lg:h-[340px] xl:w-[380px] xl:h-[380px]" />
        </div>

        {/* Soft Drifting Cartoon Clouds on Left Side (flanking the globe) */}
        <motion.div
          className="absolute top-[16%] left-6 sm:top-[18%] sm:left-12 lg:left-16 pointer-events-none select-none z-10"
          animate={{ x: [0, 10, 0], y: [0, -4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="86" height="38" viewBox="0 0 86 38" fill="none">
            <rect x="8" y="14" width="70" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="28" cy="14" r="14" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="50" cy="17" r="12" fill="#FFFFFF" fillOpacity="0.85" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-2 sm:bottom-14 sm:left-6 lg:bottom-16 lg:left-8 pointer-events-none select-none z-10"
          animate={{ x: [0, -8, 0], y: [0, 5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg width="104" height="46" viewBox="0 0 104 46" fill="none">
            <rect x="10" y="18" width="84" height="24" rx="12" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="38" cy="18" r="16" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="66" cy="22" r="13" fill="#FFFFFF" fillOpacity="0.75" />
          </svg>
        </motion.div>

        {/* Hero Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
            
            {/* Left Column: Chunky Headline & Sky Theme Split Buttons */}
            <div className="lg:col-span-7 space-y-5 pt-2 sm:pt-3 lg:pt-4">
              
              {/* Accessible SEO H1 */}
              <h1 className="sr-only">Your journey, always unbroken.</h1>

              {/* Main Headline — Interactive TextPressure Variable Font Effect (2 Lines, Brand Colors) */}
              <div className="w-full max-w-xl space-y-1 select-none">
                <div className="h-12 sm:h-16 lg:h-[70px]">
                  <TextPressure
                    text="YOUR JOURNEY,"
                    flex={false}
                    alpha={false}
                    stroke={false}
                    width={true}
                    weight={true}
                    italic={true}
                    scale={false}
                    textColor="#0F1B2B"
                    minFontSize={30}
                  />
                </div>
                <div className="h-12 sm:h-16 lg:h-[70px]">
                  <TextPressure
                    text="ALWAYS UNBROKEN."
                    flex={false}
                    alpha={false}
                    stroke={false}
                    width={true}
                    weight={true}
                    italic={true}
                    scale={false}
                    textColor="#1C6FD9"
                    minFontSize={30}
                  />
                </div>
              </div>

              {/* Interactive Modern Feature Widgets (Multi-Modal Switcher, Policy Sentinel, BFS Benchmark) */}
              <HeroWidgets />

              {/* Subtitle Paragraph */}
              <p className="text-base sm:text-lg text-[#0F1B2B]/90 font-medium leading-relaxed max-w-xl">
                The autonomous recovery engine engineered for high-stakes journeys. When air traffic delays strike, connections vanish, or cancellations cascade, ReMode calculates deterministic, policy-backed multi-modal rescues in sub-seconds. Zero fake bookings — guaranteed arrivals.
              </p>

              {/* Modern Professional CTA Buttons in Sky Theme with Smooth Micro-Bump */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                {/* Primary Button: Sign Up / Plan Recovery */}
                <Link
                  href={!isAuthenticated ? "/signup?redirect=/trip/new" : protectJourneyHref}
                  className="group relative overflow-hidden inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#1C6FD9] to-[#257BE5] hover:from-[#1762C4] hover:to-[#1C6FD9] text-white font-bold text-sm sm:text-base shadow-[0_6px_18px_rgba(28,111,217,0.32),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[0_12px_26px_rgba(28,111,217,0.42),0_0_0_2px_rgba(79,168,248,0.4)] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform hover:-translate-y-1 hover:scale-[1.018] active:translate-y-0 active:scale-[0.985] border border-white/30"
                >
                  {/* Subtle Light Glint Sweep */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  <span className="relative z-10 tracking-tight font-sans">
                    {isAuthenticated ? "Plan Recovery" : "Sign Up"}
                  </span>
                  <div className="relative z-10 w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-1 group-hover:bg-white/30">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </Link>

                {/* Secondary Button: Log In / Dashboard */}
                <Link
                  href={!isAuthenticated ? "/login?redirect=/trip/new" : "/dashboard"}
                  className="group relative overflow-hidden inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/95 hover:bg-white text-[#0A3D73] font-bold text-sm sm:text-base border-2 border-[#1C6FD9]/20 hover:border-[#1C6FD9]/60 shadow-[0_4px_14px_rgba(10,61,115,0.06)] hover:shadow-[0_10px_22px_rgba(28,111,217,0.18)] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform hover:-translate-y-1 hover:scale-[1.018] active:translate-y-0 active:scale-[0.985]"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EAF5FF] group-hover:bg-[#DDF0FF] flex items-center justify-center text-[#1C6FD9] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:rotate-12">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="tracking-tight font-sans">
                    {isAuthenticated ? "Dashboard" : "Log In"}
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Single Boarding Pass Ticket with Slight Animation */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center lg:translate-x-12 xl:translate-x-18">
              
              {/* Minimal Soft Drifting Sky Clouds (Quiet, minimal, atmospheric) */}
              <motion.div
                className="absolute -top-4 -right-8 pointer-events-none select-none z-0"
                animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="100" height="46" viewBox="0 0 100 46" fill="none">
                  <rect x="12" y="18" width="76" height="24" rx="12" fill="#FFFFFF" fillOpacity="0.85" />
                  <circle cx="36" cy="18" r="16" fill="#FFFFFF" fillOpacity="0.85" />
                  <circle cx="62" cy="22" r="14" fill="#FFFFFF" fillOpacity="0.85" />
                </svg>
              </motion.div>

              <motion.div
                className="absolute -top-6 -left-10 pointer-events-none select-none z-0"
                animate={{ x: [0, -6, 0], y: [0, -3, 0] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <svg width="92" height="42" viewBox="0 0 92 42" fill="none">
                  <rect x="10" y="16" width="72" height="22" rx="11" fill="#FFFFFF" fillOpacity="0.8" />
                  <circle cx="32" cy="16" r="15" fill="#FFFFFF" fillOpacity="0.8" />
                  <circle cx="56" cy="19" r="13" fill="#FFFFFF" fillOpacity="0.8" />
                </svg>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-8 pointer-events-none select-none z-0"
                animate={{ x: [0, -8, 0], y: [0, 4, 0] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <svg width="118" height="52" viewBox="0 0 118 52" fill="none">
                  <rect x="14" y="20" width="90" height="28" rx="14" fill="#FFFFFF" fillOpacity="0.75" />
                  <circle cx="44" cy="22" r="20" fill="#FFFFFF" fillOpacity="0.75" />
                  <circle cx="74" cy="26" r="16" fill="#FFFFFF" fillOpacity="0.75" />
                </svg>
              </motion.div>

              {/* Animated Single Ticket Container */}
              <motion.div
                className="relative w-[305px] sm:w-[345px] select-none cursor-pointer group z-10"
                onMouseEnter={() => {
                  triggerNextFlight();
                  setIsTicketHovered(true);
                }}
                onMouseLeave={() => {
                  setIsTicketHovered(false);
                }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [2.5, 3.8, 2.5],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  rotate: 0,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Tactile Ambient Shadow underneath */}
                <div className="absolute inset-0 bg-[#0A3D73]/20 rounded-[28px] blur-xl transform translate-x-3 translate-y-5 pointer-events-none"></div>

                {/* Floating Aeroplane & Dotted Flight Trail Hover Animation (Originating BEHIND Ticket) */}
                <AnimatePresence>
                  {isTicketHovered && (
                    <motion.div
                      key={flightCycle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -inset-24 w-[calc(100%+192px)] h-[calc(100%+192px)] pointer-events-none z-0 overflow-visible"
                    >
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 535 700"
                        fill="none"
                      >
                        <defs>
                          {/* Reveal Mask for progressive DOTTED path */}
                          <mask id={`flight-mask-${flightCycle}`}>
                            <motion.path
                              d={TICKET_FLIGHT_PATHS[flightPathIndex]}
                              fill="none"
                              stroke="#FFFFFF"
                              strokeWidth="14"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                duration: 1.25,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            />
                          </mask>
                          <filter id="plane-elevation-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0A3D73" floodOpacity="0.3" />
                          </filter>
                        </defs>

                        {/* 100% Guaranteed Circular Dotted Line Trail revealed by mask */}
                        <path
                          d={TICKET_FLIGHT_PATHS[flightPathIndex]}
                          fill="none"
                          stroke="#1C6FD9"
                          strokeWidth="3.5"
                          strokeDasharray="0.1 11"
                          strokeLinecap="round"
                          mask={`url(#flight-mask-${flightCycle})`}
                        />

                        {/* Minimalist Aeroplane Flying along Circular Dotted Trajectory */}
                        <g>
                          <animateMotion
                            path={TICKET_FLIGHT_PATHS[flightPathIndex]}
                            dur="1.25s"
                            fill="freeze"
                            rotate="auto"
                            keyTimes="0; 1"
                            keySplines="0.16 1 0.3 1"
                            calcMode="spline"
                          />
                          <motion.g
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: [0.75, 1, 1, 0.75], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 1.25, times: [0, 0.08, 0.88, 1] }}
                            filter="url(#plane-elevation-shadow)"
                          >
                            {/* Minimalist Aeroplane Silhouette (Clean, iconic single-path geometry) */}
                            <path
                              d="M 12 0 L 2 -10 L 0.5 -10 L 3 -1.5 L -5 -1.5 L -8 -5 L -9.5 -5 L -8 0 L -9.5 5 L -8 5 L -5 1.5 L 3 1.5 L 0.5 10 L 2 10 Z"
                              fill="#1C6FD9"
                              stroke="#0F1B2B"
                              strokeWidth="1.2"
                              strokeLinejoin="round"
                            />
                          </motion.g>
                        </g>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Front Boarding Pass Ticket (Crisp White with Cutout Notches & Pastel Stripes, in FRONT of Flight Animation) */}
                <div className="relative z-10 w-full bg-[#FFFFFF] border-2 border-[#0F1B2B]/15 rounded-[28px] shadow-[0_16px_40px_rgba(10,61,115,0.16)] overflow-hidden">
                  
                  {/* Soft concentric circular watermarks matching the reference design */}
                  <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full border border-[#74BCFB]/25 pointer-events-none" />
                  <div className="absolute top-1/2 -right-16 w-52 h-52 rounded-full border border-[#74BCFB]/25 pointer-events-none" />
                  <div className="absolute -bottom-10 left-6 w-40 h-40 rounded-full border border-[#74BCFB]/25 pointer-events-none" />

                  {/* Top Pastel Barber-Pole Diagonal Stripes */}
                  <div className="h-3.5 ticket-stripe-pastel border-b border-[#0F1B2B]/10"></div>

                  {/* Top Section: Pass Type, Shield Status, Coverage, Algorithm */}
                  <div className="p-4 sm:p-5 pb-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A9BA8] tracking-tight uppercase">Pass Type</p>
                        <p className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] leading-none mt-0.5">UNIVERSAL</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A9BA8] tracking-tight uppercase">Shield Status</p>
                        <p className="font-display font-black text-lg sm:text-xl text-[#1C6FD9] leading-none mt-0.5">ACTIVE</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A9BA8] tracking-tight uppercase">Coverage</p>
                        <p className="font-display font-black text-xs text-[#0F1B2B] tracking-wider uppercase mt-0.5">
                          MULTI-MODAL • ALL LEGS
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A9BA8] tracking-tight uppercase">Algorithm</p>
                        <p className="font-display font-black text-xs text-[#0F1B2B] tracking-wider mt-0.5">
                          13-FACTOR BFS
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Perforated Horizontal Dashed Tear Line with Self-Centering Notch Cutouts */}
                  <div className="relative w-full px-6">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#EAF5FF] rounded-full z-20 shadow-[inset_-2px_0_3px_rgba(15,27,43,0.12)]"></div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#EAF5FF] rounded-full z-20 shadow-[inset_2px_0_3px_rgba(15,27,43,0.12)]"></div>
                    <div className="border-t-2 border-dashed border-[#B0C4DE] w-full"></div>
                  </div>

                  {/* Lower Section: Universal Route (ORIGIN -> DEST), Traveler, Shield Status, Barcode */}
                  <div className="p-4 sm:p-5 pt-3 space-y-3">
                    
                    {/* Universal Journey Route: ORIGIN ── ✈ ──> DEST */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase text-[#1C6FD9] tracking-wider">DEPART</span>
                        <h4 className="font-display font-black text-xl text-[#0F1B2B] leading-none mt-0.5">ORIGIN</h4>
                        <p className="text-[10px] text-[#8A9BA8] italic font-medium mt-0.5">Any Departure Point</p>
                      </div>

                      {/* Flight Path Arrow with Angled Airplane */}
                      <div className="flex-1 px-3 flex flex-col items-center justify-center">
                        <div className="w-full flex items-center relative">
                          <div className="h-[2px] flex-1 bg-[#0F1B2B]/70" />
                          <div className="w-6 h-6 rounded-full bg-[#4FA8F8] border border-[#0F1B2B] text-white flex items-center justify-center mx-1 shadow-sm">
                            <Plane className="w-3 h-3 text-white transform -rotate-45" />
                          </div>
                          <div className="h-[2px] flex-1 bg-[#0F1B2B]/70 relative">
                            <span className="absolute right-0 -top-[4px] border-solid border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#0F1B2B]/70" />
                          </div>
                        </div>
                        <span className="text-[8.5px] font-black text-[#1C6FD9] uppercase tracking-wider mt-0.5">
                          GUARANTEED TRANSIT
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-[#1C6FD9] tracking-wider">ARRIVE</span>
                        <h4 className="font-display font-black text-xl text-[#0F1B2B] leading-none mt-0.5">DEST</h4>
                        <p className="text-[10px] text-[#8A9BA8] italic font-medium mt-0.5">Safe Arrival Margin</p>
                      </div>
                    </div>

                    {/* Universal Traveler & Protection Meta */}
                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <p className="text-[9.5px] font-semibold text-[#8A9BA8] uppercase tracking-wider">Pass Holder</p>
                        <p className="font-display font-black text-xs text-[#0F1B2B] tracking-wide uppercase mt-0.5">
                          UNIVERSAL TRAVELER
                        </p>
                      </div>
                      <div>
                        <p className="text-[9.5px] font-semibold text-[#8A9BA8] uppercase tracking-wider">Itinerary Status</p>
                        <p className="font-display font-black text-xs text-[#1C6FD9] tracking-wider uppercase mt-0.5">
                          100% PROTECTED
                        </p>
                      </div>
                    </div>

                    {/* Universal Disruption Shield Guarantee Box */}
                    <div className="py-2 px-2.5 rounded-lg bg-[#E6FAF5] border border-[#2CD9B8] space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-[#0A3D73] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878]" />
                          Disruption Shield Active
                        </span>
                        <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded bg-[#2CD9B8] text-[#0A3D73]">
                          ZERO DELAY ✓
                        </span>
                      </div>
                      <p className="text-[10.5px] leading-tight text-[#0F1B2B]/90 font-medium">
                        Instant policy-backed rebooking across flights, trains, cabs & hotels.
                      </p>
                    </div>

                    {/* Realistic Barcode & Universal Verification */}
                    <div className="pt-0.5">
                      <div className="h-7 sm:h-7.5 flex items-center justify-between px-1">
                        {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4].map(
                          (w, i) => (
                            <div key={i} className="h-full bg-[#0F1B2B]" style={{ width: `${w}px` }} />
                          )
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold text-[#8A9BA8] tracking-[0.14em] mt-1">
                        <span>SERIAL: REMODE-UNIVERSAL-2026</span>
                        <span>13-FACTOR SOLVER</span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Pastel Barber-Pole Diagonal Stripes */}
                  <div className="h-3.5 ticket-stripe-pastel border-t border-[#0F1B2B]/10"></div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION BELOW HERO — Aardvark-Style Disruption Scenarios Carousel
          ========================================================================= */}
      <ScenariosCarouselSection />



      {/* =========================================================================
          SECTION 3 — "HOW IT WORKS" (Aardvark-Style 4-Card Fanned Showcase)
          ========================================================================= */}
      <HowItWorksSection />



      {/* =========================================================================
          SECTION 5 — FINAL CALL TO ACTION (Aviation Observation Deck & Living Video Window)
          ========================================================================= */}
      <section id="cta" className="relative py-8 sm:py-12 px-2 sm:px-4 lg:px-6 bg-[#EAF5FF] overflow-hidden scroll-mt-20">
        {/* Soft Drifting Cartoon Clouds flanking the card (matching the Hero section) */}
        <motion.div
          className="absolute top-10 left-4 sm:left-12 lg:left-20 pointer-events-none select-none z-0"
          animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="86" height="38" viewBox="0 0 86 38" fill="none">
            <rect x="8" y="14" width="70" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="28" cy="14" r="14" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="50" cy="17" r="12" fill="#FFFFFF" fillOpacity="0.85" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-12 right-4 sm:right-12 lg:right-24 pointer-events-none select-none z-0"
          animate={{ x: [0, -10, 0], y: [0, 5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <svg width="104" height="46" viewBox="0 0 104 46" fill="none">
            <rect x="10" y="18" width="84" height="24" rx="12" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="38" cy="18" r="16" fill="#FFFFFF" fillOpacity="0.75" />
            <circle cx="66" cy="22" r="13" fill="#FFFFFF" fillOpacity="0.75" />
          </svg>
        </motion.div>

        {/* Ambient Topographical Depth Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full bg-[#74BCFB]/20 blur-3xl pointer-events-none z-0" />

        {/* Executive Flight Cabin / Observation Deck Showcase Card (Sized exactly to match above container) */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[1660px] 2xl:max-w-[1780px] mx-auto rounded-[32px] sm:rounded-[44px] lg:rounded-[52px] border-3 border-[#0F1B2B] bg-[#0F1B2B] shadow-[6px_8px_0px_#0F1B2B] overflow-hidden z-10"
        >
          {/* Background Looping CloudFront Video (Window into the Sky) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          />

          {/* Deep Aviation Cockpit Contrast Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2B]/85 via-[#0A3D73]/50 to-[#0F1B2B]/90 backdrop-blur-[0.5px] pointer-events-none z-1" />

          {/* Main Content Area */}
          <div className="relative z-10 px-6 sm:px-12 py-20 sm:py-28 lg:py-32 text-center flex flex-col items-center space-y-6">
            {/* Large Two-Line Heading with Overlapping Effect */}
            <div className="flex flex-col items-center select-none pt-2">
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal text-white/75 leading-none tracking-tighter drop-shadow-md font-sans">
                Your Journey.
              </span>
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter -mt-3 sm:-mt-5 md:-mt-8 lg:-mt-10 drop-shadow-2xl font-sans">
                Always Unbroken.
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed pt-2 drop-shadow">
              Engineered for travelers who cannot afford lost hours. Seamlessly uniting commercial flights, private transfers, high-speed rail, and priority hotel holds into one unbroken arrival guarantee.
            </p>

            {/* Minimal Premium CTA Button */}
            <div className="pt-2">
              <Link
                href={protectJourneyHref}
                className="group relative inline-flex items-center gap-2.5 px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-white/95 text-[#0F1B2B] font-semibold text-sm sm:text-base tracking-tight shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.28)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="font-sans">Protect My Journey</span>
                <ArrowRight className="w-4 h-4 text-[#1C6FD9] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <div>
        <Footer />
      </div>
    </div>
  );
}
