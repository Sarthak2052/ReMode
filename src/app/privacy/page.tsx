"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Eye,
  Server,
  Database,
  Trash2,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("scope");

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
    { id: "mission", title: "1. Privacy Mission & Architecture" },
    { id: "collection", title: "2. Information We Collect & Process" },
    { id: "routing", title: "3. Disruption Engine Telemetry Usage" },
    { id: "no-sell", title: "4. Strict Zero-Monetization Policy" },
    { id: "retention", title: "5. Ephemeral Memory & Purge Protocol" },
    { id: "security", title: "6. Cryptographic Transit Security" },
    { id: "integrations", title: "7. Carrier & Multi-Modal APIs" },
    { id: "rights", title: "8. Traveler Rights & Data Sovereignty" },
    { id: "cookies", title: "9. Cookies & Storage Technology" },
    { id: "contact", title: "10. Compliance & Data Protection Officer" },
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
            Document: RM-PRIV-2026.4
          </span>
        </div>

        {/* Header Title Card */}
        <div className="bg-white rounded-3xl border-3 border-[#0F1B2B] p-6 sm:p-8 shadow-[5px_6px_0px_#0F1B2B] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#00A878] flex items-center justify-center border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#0F1B2B] leading-none">
                  Traveler Privacy Commitment
                </h1>
                <p className="text-xs sm:text-sm text-[#4A5B70] font-bold mt-1.5">
                  Autonomous Multi-Modal Engine • Zero-Knowledge Data Protection Standards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1 rounded-full bg-[#EAF5FF] text-[#1C6FD9] font-mono text-xs font-black border border-[#1C6FD9]/30">
                Effective: Sept 2026
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
                <FileText className="w-4 h-4 text-[#1C6FD9]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-[#0F1B2B]">
                  Table of Contents
                </h3>
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeSection === sec.id
                        ? "bg-[#1C6FD9] text-white shadow-xs"
                        : "text-[#0F1B2B]/75 hover:bg-[#EAF5FF] hover:text-[#1C6FD9]"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-60" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Privacy Summary Badge */}
            <div className="bg-[#E6FAF5] rounded-2xl border-2 border-[#0F1B2B] p-4 shadow-[3px_3px_0px_#0F1B2B] text-xs font-medium space-y-1.5">
              <div className="flex items-center gap-2 font-black text-[#00A878]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Data Monetization</span>
              </div>
              <p className="text-[11px] text-[#0F1B2B]/85 leading-snug">
                Your itineraries, passenger details, and routing history are never monetized, sold, or shared with advertising brokers.
              </p>
            </div>
          </aside>

          {/* Main Legal Document Body */}
          <article className="lg:col-span-8 bg-white rounded-3xl border-3 border-[#0F1B2B] p-6 sm:p-10 shadow-[6px_8px_0px_#0F1B2B] space-y-10 text-sm font-medium leading-relaxed text-[#0F1B2B]/90">
            
            {/* Section 1 */}
            <section id="mission" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                1. Privacy Mission & Architecture
              </h2>
              <p>
                At <strong>ReMode</strong>, our mission is to eliminate traveler stranding through deterministic graph calculation. Solving travel disruptions requires extreme computational precision—not invasive personal surveillance. We are engineered from the ground up around data minimization: we process only the bare parameters necessary to calculate and reserve alternative transit legs.
              </p>
              <p>
                Unlike commercial travel aggregator sites that monitor your search history to fluctuate airfares, ReMode treats your booking data as transient operational telemetry.
              </p>
            </section>

            {/* Section 2 */}
            <section id="collection" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                2. Information We Collect & Process
              </h2>
              <p>
                When you model or monitor a journey with ReMode, we ingest the following distinct data points:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#0F1B2B]/85">
                <li>
                  <strong>Booking Identifiers:</strong> Passenger Name Records (PNRs), airline e-ticket references, Amtrak reservation numbers, and hotel confirmation codes.
                </li>
                <li>
                  <strong>Transit Telemetry:</strong> Origin, transit hubs, final destinations, scheduled arrival deadlines, and mandatory keynote/anchor event timestamps.
                </li>
                <li>
                  <strong>Passenger Profile & Policy:</strong> Cabin preferences, corporate travel budget ceilings, and authorized carrier guidelines.
                </li>
                <li>
                  <strong>Disruption Feeds:</strong> Live Federal Aviation Administration (FAA) Air Traffic Control (ATC) advisories, weather radar polygons, and track signaling delays.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="routing" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                3. Disruption Engine Telemetry Usage
              </h2>
              <p>
                Data entered into the ReMode platform is strictly isolated to our <strong>13-Factor Breadth-First-Search (BFS) solver</strong>. We utilize this information exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#0F1B2B]/85">
                <li>Evaluate downstream missed connection probability when delays exceed safe transfer margins.</li>
                <li>Query verified carrier inventory across regional airlines, high-speed rail lines, and priority ground express transfers.</li>
                <li>Generate three ranked, deterministic rescue paths (Fastest Arrival, Lowest Stress, Lowest Cost) matching your destination deadline.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="no-sell" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                4. Strict Zero-Monetization Policy
              </h2>
              <div className="p-4 rounded-2xl bg-[#FFF8EB] border-2 border-[#0F1B2B] shadow-[2px_2px_0px_#0F1B2B] text-xs font-semibold space-y-1">
                <span className="text-[#F27A18] font-black uppercase tracking-wider block">Ironclad Promise</span>
                <p className="text-[#0F1B2B]">
                  ReMode does not sell, rent, license, or barter your travel itineraries, passenger demographics, or corporate travel habits to advertising networks, insurance underwriters, or data brokers.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-[#0F1B2B]/80 pt-1">
                We generate zero revenue from programmatic advertising or consumer behavioral profiling. Our platform is funded solely by enterprise and individual subscription licenses for autonomous disruption protection.
              </p>
            </section>

            {/* Section 5 */}
            <section id="retention" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                5. Ephemeral Memory & Purge Protocol
              </h2>
              <p>
                Transit recovery is time-sensitive. Once a journey reaches its conclusion and the traveler safely arrives at their final destination, active session data enters our automated purge cycle:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#0F1B2B]/85">
                <li>Active GPS and flight tracking coordinates are purged from memory within 48 hours of trip completion.</li>
                <li>Carrier PNRs and booking tokens are scrubbed from operational caches within 7 days.</li>
                <li>Travelers may trigger an instant, unconditional one-click itinerary purge at any time from their Account Dashboard.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="security" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                6. Cryptographic Transit Security
              </h2>
              <p>
                All network interactions with ReMode are enforced over <strong>TLS 1.3</strong> with strict Perfect Forward Secrecy (PFS). Saved user profiles and authentication tokens are encrypted at rest utilizing <strong>AES-256-GCM</strong> with hardware-isolated security modules (HSM).
              </p>
              <p>
                Solver workers execute in ephemeral memory containers with zero persistent disk logging of unencrypted passenger credentials.
              </p>
            </section>

            {/* Section 7 */}
            <section id="integrations" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                7. Carrier & Multi-Modal APIs
              </h2>
              <p>
                To reserve verified alternative inventory, ReMode transmits the minimum necessary passenger metadata to certified Global Distribution Systems (GDS) and direct carrier interfaces (including Amadeus, Sabre, Amtrak, and Indian IRCTC gateway bridges).
              </p>
              <p>
                These transmissions are governed by strict bilateral data processing agreements that prohibit third-party carriers from utilizing shared telemetry for marketing purposes.
              </p>
            </section>

            {/* Section 8 */}
            <section id="rights" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                8. Traveler Rights & Data Sovereignty
              </h2>
              <p>
                Regardless of your country of residence, ReMode accords all travelers complete data sovereignty:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#0F1B2B]/85">
                <li><strong>Right of Access & Portability:</strong> Export your full journey dependency graph and incident timeline in standard JSON format.</li>
                <li><strong>Right to Rectification:</strong> Instantly update seating preferences, contact information, or loyalty identifiers.</li>
                <li><strong>Right to Total Erasure:</strong> Delete your profile, archived trips, and cached solver results permanently with zero retention backups.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="cookies" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                9. Cookies & Storage Technology
              </h2>
              <p>
                ReMode uses zero third-party cross-site tracking cookies. We utilize strictly necessary local storage tokens to preserve:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#0F1B2B]/85">
                <li>Authenticated traveler session keys.</li>
                <li>Active simulation parameter state between views.</li>
                <li>Dark/light UI interface preferences.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact" className="space-y-3 scroll-mt-24">
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#0F1B2B] pb-2 border-b border-[#0F1B2B]/10">
                10. Compliance & Data Protection Officer
              </h2>
              <p>
                ReMode complies with the European General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Indian Digital Personal Data Protection Act 2023.
              </p>
              <div className="p-4 rounded-2xl bg-[#EAF5FF] border border-[#1C6FD9]/30 text-xs font-semibold text-[#0F1B2B]">
                <p><strong>Security Operations & Data Protection:</strong></p>
                <p className="font-mono text-[#1C6FD9] mt-0.5">privacy@remode-recovery.engine</p>
                <p className="text-[11px] text-[#8A9BA8] mt-1">ReMode Aeronautical Operations Hub • Response SLA: &lt;24 Business Hours</p>
              </div>
            </section>

          </article>

        </div>
      </main>

      <Footer />
    </div>
  );
}
