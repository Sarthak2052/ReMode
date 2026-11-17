"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  Scale,
  Clock,
  Compass,
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  Building2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 88;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms & Operator Scope" },
    { id: "solver-sla", title: "2. Deterministic Routing Standard & SLAs" },
    { id: "power-of-attorney", title: "3. Reservation Agency & PNR Modification" },
    { id: "carrier-tariffs", title: "4. Carrier Tariffs & Force Majeure Exclusions" },
    { id: "connection-margins", title: "5. Minimum Connection Time (MCT) Margins" },
    { id: "traveler-obligations", title: "6. Traveler Identification & Documentation" },
    { id: "fares-compensation", title: "7. Fare Differential, Compensation & Refunds" },
    { id: "liability-limits", title: "8. Limitation of Liability & Disclaimers" },
    { id: "enterprise-accounts", title: "9. Corporate Accounts & Multi-Seat Governance" },
    { id: "jurisdiction", title: "10. Governing Jurisdiction & Binding Arbitration" },
  ];

  return (
    <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col selection:bg-[#4FA8F8] selection:text-[#FFFFFF]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1C6FD9] hover:text-[#0F1B2B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Flight Deck</span>
          </Link>
          <span className="text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider font-mono">
            Document: RM-TERMS-2026.4
          </span>
        </div>

        {/* Header Title Card */}
        <div className="bg-white rounded-3xl border-3 border-[#0F1B2B] p-6 sm:p-8 shadow-[5px_6px_0px_#0F1B2B] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF5FF] text-[#1C6FD9] flex items-center justify-center border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#0F1B2B] leading-none">
                  Terms of Transit Recovery
                </h1>
                <p className="text-xs sm:text-sm text-[#4A5B70] font-bold mt-1.5">
                  Algorithmic Multi-Modal Orchestration • Deterministic Carrier Passenger Agreement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1 rounded-full bg-[#EAF5FF] text-[#1C6FD9] font-mono text-xs font-black border border-[#1C6FD9]/30">
                Version 2.4 • Current
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout with Table of Contents Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents (Sticky on Desktop) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-5 shadow-[4px_5px_0px_#0F1B2B]">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#0F1B2B]/10">
                <Scale className="w-4 h-4 text-[#1C6FD9]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-[#0F1B2B]">
                  Table of Contents
                </h3>
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      activeSection === sec.id
                        ? "bg-[#1C6FD9] text-white shadow-[2px_2px_0px_#0F1B2B]"
                        : "text-[#4A5B70] hover:bg-[#EAF5FF] hover:text-[#0F1B2B]"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                        activeSection === sec.id ? "rotate-90 text-white" : "text-[#8A9BA8] group-hover:translate-x-0.5"
                      }`}
                    />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-[#E6FAF5] rounded-2xl border-2 border-[#00A878]/30 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00A878] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-semibold text-[#00A878] leading-relaxed">
                  ReMode is a deterministic solver engine. We re-route disrupted passengers onto verified multimodal capacity across airlines, high-speed rail, and certified ground transit.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Legal Body */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* 1. Acceptance */}
            <article id="acceptance" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  1
                </span>
                Acceptance of Terms & Operator Scope
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                By accessing, deploying, or utilizing the <strong>ReMode Autonomous Disruption Recovery Engine</strong> (&quot;ReMode,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;), you (&quot;Traveler,&quot; &quot;Enterprise Logistics Client,&quot; or &quot;User&quot;) agree to be legally bound by these Terms of Transit Recovery.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                ReMode functions as an intelligent orchestration layer and high-performance algorithmic dispatch engine. ReMode is not itself a common air carrier, rail operator, or ground limousine fleet; rather, ReMode establishes programmatic connectivity with certified common carriers, Global Distribution Systems (GDS), and regional intermodal networks to generate feasible rerouting corridors.
              </p>
            </article>

            {/* 2. Solver SLA */}
            <article id="solver-sla" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  2
                </span>
                Deterministic Routing Standard & Sub-Second SLAs
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                ReMode operates on strict deterministic graph search algorithms. Unlike speculative conversational interfaces, ReMode guarantees that every proposed itinerary branch adheres to the following principles:
              </p>
              <ul className="text-xs sm:text-sm text-[#4A5B70] font-medium space-y-2 pl-4 list-disc marker:text-[#1C6FD9]">
                <li>
                  <strong>Live Inventory Verification:</strong> Routes are synthesized exclusively against confirmed seat allocation feeds, direct carrier APIs, and verified inventory locks.
                </li>
                <li>
                  <strong>Latency Standard:</strong> Global graph recomputation completes within &lt;240 milliseconds upon receiving flight cancellation or ground stop alerts.
                </li>
                <li>
                  <strong>Zero Hallucinated Legs:</strong> Itineraries will never include nonexistent flight numbers, retired equipment codes, or defunct train segments.
                </li>
              </ul>
            </article>

            {/* 3. Agency & PNR */}
            <article id="power-of-attorney" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  3
                </span>
                Reservation Agency & Passenger PNR Modification
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                When you tap &quot;Auto-Recover&quot; or enable autonomous rebooking rules within your passenger profile, you grant ReMode limited, revocable agency and power of attorney to:
              </p>
              <ul className="text-xs sm:text-sm text-[#4A5B70] font-medium space-y-2 pl-4 list-disc marker:text-[#1C6FD9]">
                <li>Query active Passenger Name Records (PNR) and electronic ticket numbers across airline ticketing switches.</li>
                <li>Submit involuntary exchange requests, schedule change waivers, and IRROPS (Irregular Operations) rule triggers to operating carriers.</li>
                <li>Hold secondary reservation locks while awaiting primary carrier confirmation, immediately releasing unchosen holds upon traveler selection.</li>
              </ul>
            </article>

            {/* 4. Carrier Tariffs & Force Majeure */}
            <article id="carrier-tariffs" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  4
                </span>
                Carrier Tariffs & Force Majeure Exclusions
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Every ticketed segment remains subject to the respective operating carrier&apos;s Contract of Carriage, national civil aviation regulations (e.g., US DOT 14 CFR, EU Regulation 261/2004, UK261), and rail transport conventions.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                ReMode is not liable for secondary disruptions stemming from uncontrollable events, including but not limited to severe convective weather systems, volcanic ash advisories, air traffic controller staffing ground delay programs, war, civil unrest, or carrier IT core outages.
              </p>
            </article>

            {/* 5. Connection Margins */}
            <article id="connection-margins" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  5
                </span>
                Minimum Connection Time (MCT) & Transfer Windows
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                ReMode enforces strict Minimum Connection Time (MCT) safety margins that exceed standard airline published minimums to account for inter-terminal transit and luggage transfers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#EAF5FF] rounded-xl p-3 border border-[#1C6FD9]/20 text-center">
                  <span className="block text-[10px] font-black text-[#8A9BA8] uppercase tracking-wider">Domestic Air</span>
                  <span className="font-display font-black text-base text-[#1C6FD9]">45 min minimum</span>
                </div>
                <div className="bg-[#EAF5FF] rounded-xl p-3 border border-[#1C6FD9]/20 text-center">
                  <span className="block text-[10px] font-black text-[#8A9BA8] uppercase tracking-wider">International Air</span>
                  <span className="font-display font-black text-base text-[#1C6FD9]">90 min minimum</span>
                </div>
                <div className="bg-[#EAF5FF] rounded-xl p-3 border border-[#1C6FD9]/20 text-center">
                  <span className="block text-[10px] font-black text-[#8A9BA8] uppercase tracking-wider">Air-to-Rail Intermodal</span>
                  <span className="font-display font-black text-base text-[#1C6FD9]">60 min buffer</span>
                </div>
              </div>
            </article>

            {/* 6. Traveler Obligations */}
            <article id="traveler-obligations" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  6
                </span>
                Traveler Identification & Documentation
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                The passenger remains solely responsible for possessing valid government-issued photo identification, passports, transit visas, electronic travel authorizations (ESTA, ETA), and required health certifications.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                ReMode’s routing algorithms highlight international border-crossing requirements where applicable, but the traveler must ensure eligibility prior to boarding alternative transit branches.
              </p>
            </article>

            {/* 7. Fares & Compensation */}
            <article id="fares-compensation" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  7
                </span>
                Fare Differentials, Compensation & Refunds
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Whenever an operating airline cancels a flight, passengers are generally entitled to rebooking at no added cost under standard airline irregular operations (IRROPS) reciprocity rules.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                If an elective reroute involves cross-carrier interline purchase or private high-speed rail where fare parity cannot be negotiated via airline reciprocity, ReMode presents full, transparent cost breakdowns before payment authorization. Automated cash-back and compensation claims are executed on your behalf strictly under your prior authorization.
              </p>
            </article>

            {/* 8. Limitation of Liability */}
            <article id="liability-limits" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  8
                </span>
                Limitation of Liability & Algorithmic Disclaimers
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                To the maximum extent permitted by applicable law, ReMode and its founders, affiliates, and licensors disclaim liability for consequential, incidental, indirect, or punitive damages arising from missed client meetings, hotel cancellations, event tickets, or emotional distress resulting from carrier schedule disruptions.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Our aggregate liability under any cause of action shall never exceed the platform subscription fees paid by the traveler or enterprise account holder during the previous 12-month period.
              </p>
            </article>

            {/* 9. Corporate Accounts */}
            <article id="enterprise-accounts" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  9
                </span>
                Corporate Accounts & Multi-Seat Governance
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Corporate travel administrators utilizing the ReMode Fleet Operations Console maintain autonomous discretion to configure duty-of-care policies, maximum allowable deviation budgets, preferred carrier tiers, and mandatory overnight rest stops.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Individual travelers provisioned under corporate accounts are subject to their employer&apos;s corporate travel policy rules configured on the platform.
              </p>
            </article>

            {/* 10. Jurisdiction */}
            <article id="jurisdiction" className="bg-white rounded-2xl border-2.5 border-[#0F1B2B] p-6 sm:p-7 shadow-[4px_5px_0px_#0F1B2B] space-y-3">
              <h2 className="font-display font-black text-lg sm:text-xl text-[#0F1B2B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#1C6FD9] text-xs font-black inline-flex items-center justify-center border border-[#1C6FD9]/30">
                  10
                </span>
                Governing Jurisdiction & Binding Arbitration
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                These terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.
              </p>
              <p className="text-xs sm:text-sm text-[#4A5B70] font-medium leading-relaxed">
                Any dispute, controversy, or claim arising out of or relating to these terms or the breach thereof shall be settled by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
              </p>
            </article>

            {/* Footer Sign-off Note */}
            <div className="p-4 rounded-xl bg-white border border-[#0F1B2B]/10 flex items-center justify-between text-xs text-[#8A9BA8] font-bold">
              <span>ReMode Transit Protocols • Revision 2.4</span>
              <span>Updated: September 2026</span>
            </div>

          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
