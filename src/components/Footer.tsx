"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const navbarOffset = 76;
        const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - navbarOffset);
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      id="footer"
      className="relative bg-[#EAF5FF] text-[#0F1B2B] pt-14 pb-10 overflow-hidden border-t-2 border-[#1C6FD9]/15 scroll-mt-20"
    >
      {/* =========================================================================
          HERO-STYLE FLUID TOPOGRAPHIC WAVES WITH LIVING MOTION
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
        <svg
          className="absolute -inset-x-8 -inset-y-12 w-[calc(100%+64px)] h-[calc(100%+96px)] opacity-45"
          viewBox="0 0 1920 600"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shade 2: Mid Cerulean Primary Swirl Layer (#74BCFB) with Gentle Floating Animation */}
          <motion.g
            animate={{
              x: [0, 24, -20, 12, 0],
              y: [0, -18, 14, -8, 0],
              rotate: [0, 0.8, -0.6, 0.4, 0],
            }}
            transition={{
              duration: 10,
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
              d="M-50 260C240 310 480 180 760 220C1040 260 1220 420 1500 360C1780 300 1880 160 2000 190V650H-50V260Z"
              fill="#74BCFB"
              fillOpacity="0.25"
            />
          </motion.g>

          {/* Shade 3: Deep Royal Electric Azure Swirl Layer (#1C6FD9) with Opposing Motion */}
          <motion.g
            animate={{
              x: [0, -28, 20, -14, 0],
              y: [0, 18, -14, 10, 0],
              rotate: [0, -0.8, 0.7, -0.4, 0],
            }}
            transition={{
              duration: 13,
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
              d="M-50 350C320 290 580 410 880 340C1180 270 1360 150 1660 220C1860 270 1960 370 2000 350V650H-50V350Z"
              fill="#1C6FD9"
              fillOpacity="0.18"
            />
          </motion.g>
        </svg>

        {/* Soft atmospheric depth glow */}
        <div className="absolute -bottom-24 right-1/4 w-[420px] h-[420px] rounded-full bg-[#4FA8F8]/15 blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================================
          MINIMAL & LOGICAL FOOTER CONTENT
          ========================================================================= */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Main Grid: Clean 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#0F1B2B]/10">
          
          {/* Column 1: Brand & Purpose (Span 6) */}
          <div className="md:col-span-6 space-y-3.5">
            <Link
              href="/"
              className="flex items-center gap-3 group flex-shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.99] w-fit"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#1C6FD9] via-[#2F8BF5] to-[#4FA8F8] border border-white/90 flex items-center justify-center p-1.5 shadow-[0_4px_14px_rgba(28,111,217,0.38),inset_0_1px_1px_rgba(255,255,255,0.7)] group-hover:scale-105 group-hover:shadow-[0_6px_18px_rgba(28,111,217,0.48)] group-hover:border-white transition-all">
                <Image
                  src="/logo-white.png"
                  alt="ReMode Logo"
                  width={28}
                  height={28}
                  className="object-contain select-none drop-shadow-[0_1px_2px_rgba(10,61,115,0.35)]"
                />
              </div>
              <div className="leading-tight flex flex-col justify-center">
                <div className="font-fascinate text-2xl sm:text-[27px] tracking-wide leading-none flex items-center select-none">
                  <span className="text-[#0F1B2B] drop-shadow-[0_1px_1px_rgba(15,27,43,0.12)] group-hover:text-[#0A3D73] transition-colors">
                    Re
                  </span>
                  <span className="bg-gradient-to-r from-[#1C6FD9] via-[#2F8BF5] to-[#4FA8F8] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(28,111,217,0.22)]">
                    Mode
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2CD9B8] shadow-[0_0_6px_#2CD9B8] animate-pulse" />
                  <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-[0.24em] text-[#1C6FD9]">
                    Recovery Engine
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#0F1B2B]/75 leading-relaxed font-medium max-w-md">
              Autonomous multi-modal disruption recovery. Calculating guaranteed alternate routes across commercial flights, rail, ground express, and stays in sub-seconds.
            </p>
          </div>

          {/* Column 2: Platform Navigation (Span 3) */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1C6FD9] font-sans">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-[#0F1B2B]/85">
              <li>
                <a
                  href="/#how-it-works"
                  onClick={(e) => scrollToSection(e, "how-it-works")}
                  className="hover:text-[#1C6FD9] transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  onClick={(e) => scrollToSection(e, "features")}
                  className="hover:text-[#1C6FD9] transition-colors"
                >
                  Blueprints
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Legal (Span 3) */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1C6FD9] font-sans">
              Account & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-[#0F1B2B]/85">
              <li>
                <Link href="/login" className="hover:text-[#1C6FD9] transition-colors">
                  Traveler Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#1C6FD9] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#1C6FD9] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1C6FD9] transition-colors">
                  Terms of Transit
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Minimal Back-To-Top Button */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#0F1B2B]/70 gap-4">
          <p>© 2026 ReMode Recovery Engine. Your journey, always unbroken.</p>
          
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#1C6FD9] text-[#1C6FD9] hover:text-white border border-[#1C6FD9]/20 hover:border-[#1C6FD9] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group"
          >
            <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
