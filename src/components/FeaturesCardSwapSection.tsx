"use client";

import React, { useRef, useState } from "react";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Network,
  Cpu,
} from "lucide-react";
import CardSwap, { Card, CardSwapHandle } from "@/components/CardSwap";

export function FeaturesCardSwapSection() {
  const cardSwapRef = useRef<CardSwapHandle | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const featureTabs = [
    {
      id: "01",
      label: "Multi-Modal Graph",
      subtitle: "Unified cross-modal routes",
      icon: Network,
      color: "#1C6FD9",
      activeBg: "bg-[#F0F7FF]",
      activeBorder: "border-[#1C6FD9]/40",
      activeShadow: "shadow-[0_4px_16px_rgba(28,111,217,0.12)]",
      iconActiveBg: "bg-[#EAF5FF] text-[#1C6FD9]",
      dotColor: "bg-[#1C6FD9]",
    },
    {
      id: "02",
      label: "Gemini Copilot",
      subtitle: "Autonomous recovery tools",
      icon: Sparkles,
      color: "#00A878",
      activeBg: "bg-[#F0FAF7]",
      activeBorder: "border-[#00A878]/40",
      activeShadow: "shadow-[0_4px_16px_rgba(0,168,120,0.12)]",
      iconActiveBg: "bg-[#E6FAF5] text-[#00A878]",
      dotColor: "bg-[#00A878]",
    },
    {
      id: "03",
      label: "Buffer Defense",
      subtitle: "Cascade delay radar",
      icon: Zap,
      color: "#F27A18",
      activeBg: "bg-[#FFF9F3]",
      activeBorder: "border-[#F27A18]/40",
      activeShadow: "shadow-[0_4px_16px_rgba(242,122,24,0.12)]",
      iconActiveBg: "bg-[#FFF5EB] text-[#F27A18]",
      dotColor: "bg-[#F27A18]",
    },
    {
      id: "04",
      label: "Policy Engine",
      subtitle: "DOT & net cost transparency",
      icon: ShieldCheck,
      color: "#FF5A5A",
      activeBg: "bg-[#FFF5F5]",
      activeBorder: "border-[#FF5A5A]/40",
      activeShadow: "shadow-[0_4px_16px_rgba(255,90,90,0.12)]",
      iconActiveBg: "bg-[#FFEBEB] text-[#FF5A5A]",
      dotColor: "bg-[#FF5A5A]",
    },
  ];

  return (
    <section id="features" className="bg-gradient-to-b from-[#EAF5FF] via-[#F4FAFF] to-[#FFFFFF] pt-20 pb-28 sm:pt-24 sm:pb-36 px-4 sm:px-6 lg:px-8 border-t-3 border-[#0F1B2B] relative overflow-hidden">
      {/* Background Soft Lighting Gradients */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] rounded-full bg-[#74BCFB]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-[600px] h-[600px] rounded-full bg-[#1C6FD9]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* =========================================================================
            SPLIT 2-COLUMN HERO SHOWCASE (Matches React Bits CardSwap Half-Page Layout)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[620px]">
          
          {/* LEFT COLUMN: Large Typography, Controls & Storytelling */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            
            {/* Big Bold Headline */}
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-[52px] text-[#0F1B2B] leading-[1.08] tracking-tight">
              What disruptions break, ReMode resolves.
            </h2>

            {/* Subtitle & Story */}
            <div className="space-y-2.5">
              <p className="font-display font-bold text-xl sm:text-2xl text-[#1C6FD9]">
                Multi-modal, policy-backed, and autonomous.
              </p>
              <p className="text-base sm:text-lg text-[#4A5B70] font-medium leading-relaxed">
                When flights delay, connections vanish, or hotels walk you, ReMode generates
                deterministic, policy-backed rescues in seconds—synchronizing commercial airlines,
                Amtrak rail, chauffeur transfers, and stays with zero fantasy bookings.
              </p>
            </div>

            {/* Structured Feature Buttons (2x2 Balanced Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-w-lg">
              {featureTabs.map((tab, idx) => {
                const isActive = activeCardIndex === idx;
                const Icon = tab.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveCardIndex(idx);
                      cardSwapRef.current?.next();
                    }}
                    className={`group relative flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-250 cursor-pointer border ${
                      isActive
                        ? `${tab.activeBg} ${tab.activeBorder} ${tab.activeShadow} -translate-y-0.5 scale-[1.01]`
                        : "bg-white/85 hover:bg-white text-[#4A5B70] hover:text-[#0F1B2B] border-[#0F1B2B]/10 hover:border-[#0F1B2B]/20 shadow-[0_2px_8px_rgba(10,61,115,0.03)]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-250 group-hover:scale-105 ${
                        isActive ? tab.iconActiveBg : "bg-[#F4F7FB] text-[#7490A8]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#7490A8]">
                          {tab.id}
                        </span>
                        <span
                          className={`text-xs sm:text-[13px] font-bold tracking-tight truncate ${
                            isActive ? "text-[#0F1B2B]" : "text-[#2C3E50]"
                          }`}
                        >
                          {tab.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7490A8] font-medium truncate mt-0.5">
                        {tab.subtitle}
                      </p>
                    </div>

                    {/* Active Pulse Pill */}
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor} shrink-0 animate-pulse`} />
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Huge CardSwap Stack (Fills the entire right half of the page) */}
          <div className="lg:col-span-7 relative h-[600px] sm:h-[660px] lg:h-[700px] w-full overflow-visible flex items-center justify-center lg:justify-end select-none">
            
            <CardSwap
              ref={cardSwapRef}
              width={520}
              height={420}
              cardDistance={60}
              verticalDistance={70}
              delay={3800}
              pauseOnHover={false}
              skewAmount={6}
              easing="elastic"
              onCardClick={(idx) => setActiveCardIndex((idx + 1) % 4)}
              onCardChange={(frontIdx) => setActiveCardIndex(frontIdx)}
            >
              {/* Card 1: Multi-Modal Graph Solver (Light Sky Theme) */}
              <Card className="w-[460px] sm:w-[520px] h-[390px] sm:h-[420px] bg-white text-[#0F1B2B] border-2 border-[#1C6FD9]/35 hover:border-[#1C6FD9] rounded-[22px] shadow-[0_24px_50px_rgba(10,61,115,0.14),0_6px_18px_rgba(10,61,115,0.06)] flex flex-col justify-between overflow-hidden relative">
                {/* Subtle soft tint glow in top corner */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#EAF5FF]/80 rounded-full blur-3xl pointer-events-none" />
                
                {/* Top macOS-Style Header Bar */}
                <div className="px-6 py-3.5 bg-[#F4FAFF] border-b border-[#1C6FD9]/15 flex items-center justify-between text-xs font-mono font-bold tracking-wider relative z-10">
                  <div className="flex items-center gap-2 text-[#1C6FD9]">
                    <span className="text-[#1C6FD9] font-black">&lt;/&gt;</span>
                    <span className="text-[#0F1B2B] font-bold">Reliable Graph Solver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1C6FD9] animate-pulse" />
                    <span className="text-[#4A5B70] text-[11px] font-sans font-semibold">100% Policy-Backed</span>
                  </div>
                </div>

                {/* Card Interior */}
                <div className="p-6 sm:p-7 space-y-3 relative z-10 my-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF5FF] text-[11px] font-semibold text-[#1C6FD9]">
                    <Network className="w-3.5 h-3.5 text-[#1C6FD9]" />
                    <span>13-Factor BFS Multi-Modal Graph</span>
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] leading-tight">
                    Multi-Modal Graph Solver
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4A5B70] leading-relaxed font-medium max-w-md">
                    Links commercial airline segments, Amtrak rail corridors, chauffeur transfers,
                    and hotel rooms into a synchronized directed graph. When disruptions strike, the
                    engine recalculates all 3 legs simultaneously with zero hallucinated flights.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#1C6FD9]">
                    <span className="bg-[#F0F7FF] border border-[#1C6FD9]/20 px-2.5 py-1 rounded-lg">Sub-Second Solver</span>
                    <span className="bg-[#F0F7FF] border border-[#1C6FD9]/20 px-2.5 py-1 rounded-lg">Zero Fantasy Flights</span>
                    <span className="bg-[#F0F7FF] border border-[#1C6FD9]/20 px-2.5 py-1 rounded-lg">Cross-Modal Sync</span>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="px-6 py-3 bg-[#F8FCFF] border-t border-[#1C6FD9]/10 flex items-center text-xs font-mono text-[#1C6FD9] relative z-10 font-bold">
                  <span>● Active In Engine</span>
                </div>
              </Card>

              {/* Card 2: Autonomous Copilot (Light Emerald Theme) */}
              <Card className="w-[460px] sm:w-[520px] h-[390px] sm:h-[420px] bg-white text-[#0F1B2B] border-2 border-[#00A878]/35 hover:border-[#00A878] rounded-[22px] shadow-[0_24px_50px_rgba(0,168,120,0.12),0_6px_18px_rgba(10,61,115,0.06)] flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#E6FAF5]/80 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Bar */}
                <div className="px-6 py-3.5 bg-[#F0FAF7] border-b border-[#00A878]/15 flex items-center justify-between text-xs font-mono font-bold tracking-wider relative z-10">
                  <div className="flex items-center gap-2 text-[#00A878]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00A878]" />
                    <span className="text-[#0F1B2B] font-bold">Autonomous AI Copilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
                    <span className="text-[#4A5B70] text-[11px] font-sans font-semibold">Gemini ADK Agent</span>
                  </div>
                </div>

                {/* Card Interior */}
                <div className="p-6 sm:p-7 space-y-3 relative z-10 my-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6FAF5] text-[11px] font-semibold text-[#00A878]">
                    <Cpu className="w-3.5 h-3.5 text-[#00A878]" />
                    <span>Live Tool Execution & Scoring</span>
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] leading-tight">
                    Recovery AI Copilot
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4A5B70] leading-relaxed font-medium max-w-md">
                    Equipped with live deterministic trip execution tools. Travelers can query flight
                    alternatives, weigh trade-offs via interactive follow-up chips, and apply
                    recovery plans directly from conversational chat without navigating menus.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#00A878]">
                    <span className="bg-[#F0FAF7] border border-[#00A878]/20 px-2.5 py-1 rounded-lg">Direct Rebooking</span>
                    <span className="bg-[#F0FAF7] border border-[#00A878]/20 px-2.5 py-1 rounded-lg">Interactive Chips</span>
                    <span className="bg-[#F0FAF7] border border-[#00A878]/20 px-2.5 py-1 rounded-lg">Trade-off Scoring</span>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="px-6 py-3 bg-[#F6FCFA] border-t border-[#00A878]/10 flex items-center text-xs font-mono text-[#00A878] relative z-10 font-bold">
                  <span>● Tools Active</span>
                </div>
              </Card>

              {/* Card 3: Buffer Squeezing (Light Amber Theme) */}
              <Card className="w-[460px] sm:w-[520px] h-[390px] sm:h-[420px] bg-white text-[#0F1B2B] border-2 border-[#F27A18]/35 hover:border-[#F27A18] rounded-[22px] shadow-[0_24px_50px_rgba(242,122,24,0.12),0_6px_18px_rgba(10,61,115,0.06)] flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFF5EB]/80 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Bar */}
                <div className="px-6 py-3.5 bg-[#FFF9F3] border-b border-[#F27A18]/15 flex items-center justify-between text-xs font-mono font-bold tracking-wider relative z-10">
                  <div className="flex items-center gap-2 text-[#F27A18]">
                    <Zap className="w-3.5 h-3.5 text-[#F27A18]" />
                    <span className="text-[#0F1B2B] font-bold">Smooth Buffer Defense</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F27A18] animate-pulse" />
                    <span className="text-[#4A5B70] text-[11px] font-sans font-semibold">55m Early Warning</span>
                  </div>
                </div>

                {/* Card Interior */}
                <div className="p-6 sm:p-7 space-y-3 relative z-10 my-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5EB] text-[11px] font-semibold text-[#F27A18]">
                    <Zap className="w-3.5 h-3.5 text-[#F27A18]" />
                    <span>Cascade Delay Prevention</span>
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] leading-tight">
                    Buffer Erosion Defense
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4A5B70] leading-relaxed font-medium max-w-md">
                    Detects creeping delays across baggage transfers, terminal shuttles, and security
                    lines minutes before airlines announce disruptions—safeguarding hard constraints
                    like keynote speeches, weddings, and executive check-ins.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#F27A18]">
                    <span className="bg-[#FFF9F3] border border-[#F27A18]/20 px-2.5 py-1 rounded-lg">55m Radar Alert</span>
                    <span className="bg-[#FFF9F3] border border-[#F27A18]/20 px-2.5 py-1 rounded-lg">Hard Constraints</span>
                    <span className="bg-[#FFF9F3] border border-[#F27A18]/20 px-2.5 py-1 rounded-lg">Ripple Defense</span>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="px-6 py-3 bg-[#FFFBF8] border-t border-[#F27A18]/10 flex items-center text-xs font-mono text-[#F27A18] relative z-10 font-bold">
                  <span>● Margin Protected</span>
                </div>
              </Card>

              {/* Card 4: Policy & Net Cost Math (Light Coral Theme) */}
              <Card className="w-[460px] sm:w-[520px] h-[390px] sm:h-[420px] bg-white text-[#0F1B2B] border-2 border-[#FF5A5A]/35 hover:border-[#FF5A5A] rounded-[22px] shadow-[0_24px_50px_rgba(255,90,90,0.12),0_6px_18px_rgba(10,61,115,0.06)] flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFEBEB]/80 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Bar */}
                <div className="px-6 py-3.5 bg-[#FFF5F5] border-b border-[#FF5A5A]/15 flex items-center justify-between text-xs font-mono font-bold tracking-wider relative z-10">
                  <div className="flex items-center gap-2 text-[#FF5A5A]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A5A]" />
                    <span className="text-[#0F1B2B] font-bold">Policy & Refund Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF5A5A] animate-pulse" />
                    <span className="text-[#4A5B70] text-[11px] font-sans font-semibold">DOT Rule Compliant</span>
                  </div>
                </div>

                {/* Card Interior */}
                <div className="p-6 sm:p-7 space-y-3 relative z-10 my-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFEBEB] text-[11px] font-semibold text-[#FF5A5A]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A5A]" />
                    <span>True Net Cost Transparency</span>
                  </div>

                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#0F1B2B] leading-tight">
                    Policy & Net Cost Math
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4A5B70] leading-relaxed font-medium max-w-md">
                    Pre-computes carrier rebooking rights, hotel walk voucher compensation, and true
                    net change costs. Automatically ranks 3 distinct recovery options (Fastest, Lowest
                    Cost, Minimum Changes) with dollar transparency and zero fantasy bookings.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#FF5A5A]">
                    <span className="bg-[#FFF5F5] border border-[#FF5A5A]/20 px-2.5 py-1 rounded-lg">3 Ranked Options</span>
                    <span className="bg-[#FFF5F5] border border-[#FF5A5A]/20 px-2.5 py-1 rounded-lg">Live Net Math</span>
                    <span className="bg-[#FFF5F5] border border-[#FF5A5A]/20 px-2.5 py-1 rounded-lg">Zero Guesswork</span>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="px-6 py-3 bg-[#FFF9F9] border-t border-[#FF5A5A]/10 flex items-center text-xs font-mono text-[#FF5A5A] relative z-10 font-bold">
                  <span>● 100% Policy-Backed</span>
                </div>
              </Card>

            </CardSwap>
          </div>

        </div>

      </div>
    </section>
  );
}

export default FeaturesCardSwapSection;

