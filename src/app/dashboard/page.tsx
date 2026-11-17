"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ScenarioPicker } from "@/components/ScenarioPicker";
import { ImpactAnalysisView } from "@/components/ImpactAnalysisView";
import { RecoveryComparisonView } from "@/components/RecoveryComparisonView";
import { ItineraryView } from "@/components/ItineraryView";
import { ConfirmApplyModal } from "@/components/ConfirmApplyModal";
import { RiskAlertsBanner } from "@/components/RiskAlertsBanner";
import { CopilotDrawer } from "@/components/CopilotDrawer";
import { AirplaneLightRevealOverlay } from "@/components/AirplaneLightRevealOverlay";
import { WeatherSimulationSandbox } from "@/components/WeatherSimulationSandbox";
import { LiveWeatherCard } from "@/components/LiveWeatherCard";
import { DigitalTwinWhatIfSimulator } from "@/components/DigitalTwinWhatIfSimulator";
import { SocialSignalsTicker } from "@/components/SocialSignalsTicker";
import type { SimulatedWeatherImpact } from "@/core/RecoveryEngine";
import { LiveWeatherWidget } from "@/components/LiveWeatherWidget";
import { DashboardCloudBackground } from "@/components/DashboardCloudBackground";

import {
  TripSnapshot,
  ImpactAnalysis,
  RecoveryPlan,
  RiskAlert,
} from "@/types";
import {
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  Calendar,
  Compass,
  Lock,
  Plane,
  Train,
  Car,
  Building,
  Award,
  ArrowRight,
  UserCheck,
  User,
  Sliders,
  ShieldCheck,
  Navigation,
  Phone,
  CloudRain,
  Radio,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function formatTripDates(start?: string, end?: string): string {
  if (!start && !end) return "Flexible Dates";
  if (!start) return end ? formatSingleDate(end) : "Flexible";
  if (!end) return formatSingleDate(start);

  const d1 = new Date(start);
  const d2 = new Date(end);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    const cleanStart = start.includes("T") ? start.split("T")[0] : start;
    const cleanEnd = end.includes("T") ? end.split("T")[0] : end;
    return `${cleanStart} – ${cleanEnd}`;
  }

  const sMonth = d1.toLocaleDateString("en-US", { month: "short" });
  const eMonth = d2.toLocaleDateString("en-US", { month: "short" });
  const sDay = d1.getDate();
  const eDay = d2.getDate();
  const sYear = d1.getFullYear();
  const eYear = d2.getFullYear();

  if (sYear === eYear && sMonth === eMonth) {
    return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
  } else if (sYear === eYear) {
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  } else {
    return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
  }
}

function formatSingleDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTripId = searchParams.get("tripId");
  const paymentSuccess = searchParams.get("paymentSuccess") === "true";
  const planParam = searchParams.get("plan");
  const amountParam = searchParams.get("amount");

  const { user, isAuthenticated, isLoaded } = useAuth();

  // Auth Protection Effect: unauthenticated users cannot access dashboard features or simulations
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      if (typeof window !== "undefined") {
        const fullPath = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
      }
    }
  }, [isLoaded, isAuthenticated, router]);

  const getInitialTripId = (): string => {
    if (rawTripId) return rawTripId;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("remode_active_trip_id");
        if (stored && stored !== "trip-denver-2026") return stored;
      } catch {}
    }
    return "";
  };

  const [tripId, setTripId] = useState<string>(getInitialTripId);

  // Keep tripId in sync with search params and localStorage
  useEffect(() => {
    if (rawTripId) {
      setTripId(rawTripId);
      try {
        localStorage.setItem("remode_active_trip_id", rawTripId);
      } catch (e) {
        console.warn("Storage notice:", e);
      }
    } else {
      try {
        const storedTrip = localStorage.getItem("remode_active_trip_id");
        if (storedTrip && storedTrip !== "trip-denver-2026") {
          setTripId(storedTrip);
        }
      } catch (e) {
        console.warn("Storage notice:", e);
      }
    }
  }, [rawTripId]);

  const getInitialTrip = (): TripSnapshot | null => {
    if (typeof window !== "undefined") {
      try {
        const storedTripId = rawTripId || localStorage.getItem("remode_active_trip_id");
        if (storedTripId) {
          const cached = localStorage.getItem(`remode_cached_trip_${storedTripId}`);
          if (cached) return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  };

  const [trip, setTrip] = useState<TripSnapshot | null>(getInitialTrip);
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [selectedPlanForConfirm, setSelectedPlanForConfirm] =
    useState<RecoveryPlan | null>(null);
  const [focusedPlan, setFocusedPlan] = useState<RecoveryPlan | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [undoToast, setUndoToast] = useState<{
    show: boolean;
    planName: string;
    countdown: number;
  } | null>(null);
  const [showTakeoff, setShowTakeoff] = useState(false);
  const [simModeTab, setSimModeTab] = useState<
    "WEATHER_TWIN" | "SOCIAL_SIGNALS" | "BENCHMARKS"
  >("WEATHER_TWIN");
  const [simulatedImpact, setSimulatedImpact] =
    useState<SimulatedWeatherImpact | null>(null);
  const [isSimHubOpen, setIsSimHubOpen] = useState(false);
  const simulatedImpactState = simulatedImpact;
  const setSimulatedImpactState = (val: any) => setSimulatedImpact(val);

  // Automatically expand simulation hub if there is an active disruption to resolve
  useEffect(() => {
    if (trip?.activeDisruption) {
      setIsSimHubOpen(true);
    }
  }, [trip?.activeDisruption]);

  const loadTripData = async () => {
    try {
      let targetId = rawTripId;
      if (!targetId && typeof window !== "undefined") {
        const stored = localStorage.getItem("remode_active_trip_id");
        if (stored && stored !== "trip-denver-2026") targetId = stored;
      }
      if (!targetId) {
        targetId = tripId && tripId !== "trip-denver-2026" ? tripId : "";
      }

      // If still no user trip ID, load the newest user trip from the database
      let activeId = targetId;
      if (!activeId) {
        try {
          const allTripsRes = await fetch("/api/trips");
          if (allTripsRes.ok) {
            const allTrips = await allTripsRes.json();
            if (Array.isArray(allTrips) && allTrips.length > 0) {
              const userTrip = allTrips.find((t: any) => t.id !== "trip-denver-2026") || allTrips[0];
              activeId = userTrip.id;
            }
          }
        } catch {}
      }

      if (!activeId) activeId = "trip-denver-2026";

      // Sync state and preserve in URL so browser refresh always retains this trip
      setTripId(activeId);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("remode_active_trip_id", activeId);
          const currentUrl = new URL(window.location.href);
          if (currentUrl.searchParams.get("tripId") !== activeId) {
            currentUrl.searchParams.set("tripId", activeId);
            window.history.replaceState(null, "", currentUrl.toString());
          }
        } catch {}
      }

      // 1. Fetch trip data and immediately render without blocking on alerts
      const res = await fetch(`/api/trips/${activeId}`);
      if (!res.ok) return;
      const data: TripSnapshot = await res.json();
      setTrip(data);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`remode_cached_trip_${activeId}`, JSON.stringify(data));
        } catch {}
      }

      // Proactive zero-latency client calculation for risk alerts
      if (data.items && Array.isArray(data.items)) {
        const clientAlerts = data.items
          .filter((item) => item.bufferMinutes < 30)
          .map((item) => ({
            id: `alert-${item.id}`,
            itemId: item.id,
            severity: item.priority === "CRITICAL" ? "CRITICAL" : "MEDIUM",
            title: `Buffer Warning: ${item.title}`,
            message: `Scheduled buffer is only ${item.bufferMinutes} minutes before the next connection.`,
            currentBufferMinutes: item.bufferMinutes,
            suggestedAction:
              item.priority === "CRITICAL"
                ? "Recommend pre-authorizing Priority Airport Cab to safeguard arrival."
                : "Review transit alternatives if minor delays occur.",
          }));
        setRiskAlerts(clientAlerts as RiskAlert[]);
      }

      if (data.activeDisruption) {
        loadRecoveryData(activeId);
      } else {
        setImpact(null);
        setPlans([]);
      }

      // 2. Fetch risk alerts asynchronously in background (non-blocking)
      fetch(`/api/trips/${activeId}/risk-alerts`)
        .then((r) => (r.ok ? r.json() : []))
        .then((alertsData) => {
          if (Array.isArray(alertsData) && alertsData.length > 0) {
            setRiskAlerts(alertsData);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn("Notice: trip data query warning:", err);
    }
  };

  const loadRecoveryData = async (overrideId?: string) => {
    try {
      const targetId = overrideId || tripId || trip?.id;
      if (!targetId) return;
      const [impRes, plRes] = await Promise.all([
        fetch(`/api/trips/${targetId}/impact`),
        fetch(`/api/trips/${targetId}/recovery-plans`),
      ]);
      if (impRes.ok) {
        const impData = await impRes.json().catch(() => null);
        if (impData && !impData.error && impData.feasibility) {
          setImpact(impData);
        } else {
          setImpact(null);
        }
      } else {
        setImpact(null);
      }
      if (plRes.ok) {
        const plData = await plRes.json().catch(() => []);
        if (Array.isArray(plData)) {
          setPlans(plData);
        } else {
          setPlans([]);
        }
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.warn("Recovery data query notice:", err);
      setImpact(null);
      setPlans([]);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId, paymentSuccess]);

  // Undo countdown timer
  useEffect(() => {
    if (!undoToast?.show) return;
    if (undoToast.countdown <= 0) {
      setUndoToast(null);
      return;
    }
    const timer = setTimeout(() => {
      setUndoToast((prev) => (prev ? { ...prev, countdown: prev.countdown - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  const handleClearDisruption = async () => {
    setIsLoading(true);

    // 1. OPTIMISTIC IMMEDIATE RESET IN UI:
    // Instantly removes the active selection, clears active badges, and dismisses impact & recovery
    setTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeDisruption: null,
        items: (prev.items || []).map((it) => ({
          ...it,
          status: "NORMAL",
        })),
      };
    });
    setImpact(null);
    setPlans([]);
    setFocusedPlan(null);
    setSelectedPlanForConfirm(null);
    setUndoToast(null);

    // 2. Call backend in background to sync database / TripStore
    try {
      const targetTripId = trip?.id || tripId;
      const res = await fetch(`/api/trips/${targetTripId}/disruptions`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.trip) {
          setTrip({
            ...data.trip,
            activeDisruption: null,
            items: (data.trip.items || []).map((it: any) => ({
              ...it,
              status: it.status === "AFFECTED" || it.status === "AT_RISK" ? "NORMAL" : it.status || "NORMAL",
            })),
          });
        }
      }

      try {
        const alertsRes = await fetch(`/api/trips/${targetTripId}/risk-alerts`);
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setRiskAlerts(alertsData);
        }
      } catch {
        // Silently continue if alerts fetch fails during quick reset
      }
    } catch (err) {
      console.warn("Failed to clear disruption:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = async (scenarioId: number) => {
    // If the clicked scenario is already active, UNCHECK / TOGGLE IT OFF / RESET IT
    const isCurrentlyActive =
      trip?.activeDisruption &&
      (Number(trip.activeDisruption.scenarioId) === Number(scenarioId) ||
        trip.activeDisruption.id === `sc-${scenarioId}` ||
        (trip.activeDisruption.id && trip.activeDisruption.id.includes(`sc-${scenarioId}`)));

    if (isCurrentlyActive) {
      await handleClearDisruption();
      return;
    }

    setIsLoading(true);
    try {
      const activeTripPhone =
        (trip as any)?.traveler?.phone ||
        (typeof window !== "undefined" ? localStorage.getItem("remode_active_trip_phone") : null) ||
        user?.phone;

      const targetTripId = trip?.id || tripId;
      const res = await fetch(`/api/trips/${targetTripId}/disruptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, phoneNumber: activeTripPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        console.warn("Disruption simulation response warning:", data?.error || res.statusText);
        return;
      }
      if (data.trip) {
        setTrip({
          ...data.trip,
          activeDisruption: data.trip.activeDisruption
            ? { ...data.trip.activeDisruption }
            : null,
          items: [...(data.trip.items || [])],
        });
      }
      if (data.impact && data.impact.feasibility) {
        setImpact(data.impact);
      }
      if (Array.isArray(data.plans) && data.plans.length > 0) {
        setPlans(data.plans);
        setFocusedPlan(data.plans[0]);
      } else {
        loadRecoveryData();
      }

      // Smoothly scroll down to Impact Analysis so the user sees the immediate simulation results
      setTimeout(() => {
        const impactSection = document.getElementById("impact");
        if (impactSection) {
          impactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } catch (err) {
      console.warn("Failed to inject scenario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);

    // Optimistically reset trip state in UI immediately
    setTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeDisruption: null,
        items: (prev.items || []).map((it) => ({ ...it, status: "NORMAL" })),
      };
    });
    setImpact(null);
    setPlans([]);
    setFocusedPlan(null);
    setSelectedPlanForConfirm(null);
    setUndoToast(null);

    try {
      const targetId = trip?.id || tripId;
      const res = await fetch(`/api/trips/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) {
          setTrip(data);
        }
      }
      const alertsRes = await fetch(`/api/trips/${targetId}/risk-alerts`);
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json().catch(() => []);
        setRiskAlerts(alertsData);
      }
    } catch (err) {
      console.warn("Notice: trip reset warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlan = async (planId: string, planToApply?: RecoveryPlan) => {
    setIsLoading(true);
    try {
      const activeTripPhone =
        (trip as any)?.traveler?.phone ||
        (typeof window !== "undefined" ? localStorage.getItem("remode_active_trip_phone") : null) ||
        user?.phone;

      const chosen =
        planToApply || plans.find((p) => p.id === planId) || selectedPlanForConfirm;
      const targetId = trip?.id || tripId;
      const res = await fetch(`/api/trips/${targetId}/recovery-plans/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          plan: chosen,
          confirmed: true,
          phoneNumber: activeTripPhone,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to apply recovery plan");
      }
      const data = await res.json();
      setTrip(data.trip);
      setImpact(null);
      setPlans([]);
      setSelectedPlanForConfirm(null);

      // Trigger 7-second grace period undo toast
      setUndoToast({
        show: true,
        planName: chosen?.label || "Selected Plan",
        countdown: 7,
      });

      const alertsRes = await fetch(`/api/trips/${targetId}/risk-alerts`);
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setRiskAlerts(alertsData);
      }
      return data;
    } catch (err) {
      console.warn("Notice: apply plan warning:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async () => {
    setIsLoading(true);
    try {
      const targetId = trip?.id || tripId;
      const res = await fetch(`/api/trips/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "undo" }),
      });
      const data = await res.json();
      setTrip(data);
      setUndoToast(null);
      loadRecoveryData();
    } catch (err) {
      console.warn("Notice: undo warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth background gradient matching the input page aesthetic
  let bgClass = "bg-gradient-to-b from-[#E7F2FC] via-[#EFF6FC] to-[#F8FAFC]"; // Calm Sky
  if (impact?.feasibility === "IMPOSSIBLE") {
    bgClass = "bg-gradient-to-b from-[#FDE8E8] via-[#FFF1F1] to-[#F8FAFC]"; // Coral red tint for hard blocks
  } else if (trip?.activeDisruption) {
    bgClass = "bg-gradient-to-b from-[#FEF3D6] via-[#FFF9EC] to-[#F8FAFC]"; // Caution Amber tint
  } else if (trip?.history && trip.history.length > 0) {
    bgClass = "bg-gradient-to-b from-[#E6FBF7] via-[#F0FDF9] to-[#F8FAFC]"; // Teal tint for resolved recovery
  }

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-8 shadow-[0_24px_60px_rgba(10,61,115,0.12)] text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF5FF] border border-[#1C6FD9]/30 flex items-center justify-center text-[#1C6FD9] mb-4 shadow-sm animate-pulse">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1C6FD9] bg-[#EAF5FF] px-2.5 py-1 rounded-full border border-[#74BCFB]/30 mb-2">
              Protected Feature
            </span>
            <h2 className="font-display font-black text-2xl text-[#0F1B2B] mb-2">
              Authentication Required
            </h2>
            <p className="text-xs text-[#4A5B70] font-medium mb-6 leading-relaxed">
              Please sign in with your traveler account to access the disruption simulation and journey dashboard.
            </p>
            <div className="w-6 h-6 border-2 border-[#1C6FD9] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  const dashboardStatus =
    impact?.feasibility === "IMPOSSIBLE"
      ? "IMPOSSIBLE"
      : trip?.activeDisruption
      ? "AT_RISK"
      : trip?.history && trip.history.length > 0
      ? "RECOVERED"
      : "NORMAL";

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-[#1C6FD9] selection:text-white">
      {/* Dynamic Themed Cloud Background Layer with Origami Planes & Ambient Mood Tint */}
      <DashboardCloudBackground status={dashboardStatus} />

      {showTakeoff && (
        <AirplaneLightRevealOverlay
          forcePlay={true}
          onComplete={() => setShowTakeoff(false)}
        />
      )}
      <div className="relative z-30">
        <Navbar onOpenCopilot={() => setIsCopilotOpen(true)} />
      </div>

      {/* Undo Grace Period Toast (Section 5.5 & 9) */}
      {undoToast && undoToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-2xl text-[#0F1B2B] border border-emerald-300/80 shadow-[0_16px_50px_rgba(10,61,115,0.18)] rounded-2xl p-4 flex items-center gap-3.5 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-emerald-500/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-sans font-extrabold text-sm text-[#0F1B2B] tracking-tight">
              Itinerary Updated Successfully!
            </p>
            <p className="text-xs text-[#4A5B70] font-medium">
              Applied <strong className="text-[#0F1B2B]">{undoToast.planName}</strong> • Undo available for {undoToast.countdown}s
            </p>
          </div>
          <button
            onClick={handleUndo}
            className="px-3.5 py-1.5 bg-[#0F1B2B] hover:bg-[#1C6FD9] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Payment & Rebooking Success Banner */}
        {paymentSuccess && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-white/95 to-[#EAF5FF]/90 backdrop-blur-2xl border border-emerald-400/40 rounded-3xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(16,185,129,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-[#2CD9B8] text-white flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Disruption Solved & Confirmed
                  </span>
                  {planParam && (
                    <span className="text-xs font-bold text-[#1C6FD9]">
                      • {planParam}
                    </span>
                  )}
                </div>
                <h2 className="font-sans font-extrabold text-xl text-[#0F1B2B] mt-1 tracking-tight">
                  Updated Journey Active on Dashboard
                </h2>
                <p className="text-xs text-[#4A5B70] mt-0.5 leading-relaxed font-medium">
                  {amountParam
                    ? `Payment & refund settlement of ₹${amountParam} processed. Your replacement bookings and timings have replaced the disrupted segments below.`
                    : "Your replacement itinerary has been securely locked and synchronized with live radar."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                router.replace(`/dashboard?tripId=${tripId}`);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F1B2B] shadow-xs hover:shadow-sm transition-all shrink-0 cursor-pointer self-stretch sm:self-auto text-center"
            >
              Dismiss Notice
            </button>
          </div>
        )}

        {/* Active Traveler & Complete Itinerary Sequence Summary */}
        {!trip ? (
          <div className="bg-gradient-to-br from-white/96 via-[#FAFCFF]/95 to-[#F0F6FE]/90 backdrop-blur-2xl border border-[#74BCFB]/40 rounded-3xl p-6 sm:p-7 shadow-[0_18px_50px_rgba(10,61,115,0.08)] animate-pulse space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-blue-100/70 rounded-full" />
                <div className="h-8 w-72 bg-slate-200 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-28 bg-slate-100 rounded-2xl" />
                <div className="h-9 w-28 bg-slate-100 rounded-2xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-100/70 rounded-2xl border border-slate-200/40" />
              ))}
            </div>
          </div>
        ) : (
          (() => {
          const totalLegs = trip.items.length;

          const getModeIcon = (type: string) => {
            switch (type) {
              case "FLIGHT":
                return <Plane className="w-3.5 h-3.5 text-[#1C6FD9]" />;
              case "TRAIN":
                return <Train className="w-3.5 h-3.5 text-[#B45309]" />;
              case "TRANSFER":
              case "TAXI":
              case "CAR":
              case "BUS":
                return <Car className="w-3.5 h-3.5 text-[#047857]" />;
              case "HOTEL":
                return <Building className="w-3.5 h-3.5 text-[#7E22CE]" />;
              case "EVENT":
              case "ACTIVITY":
                return <Award className="w-3.5 h-3.5 text-[#D97706]" />;
              default:
                return <MapPin className="w-3.5 h-3.5 text-[#1C6FD9]" />;
            }
          };

          const getModeBadgeStyle = (type: string) => {
            switch (type) {
              case "FLIGHT":
                return "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40";
              case "TRAIN":
                return "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]";
              case "TRANSFER":
              case "TAXI":
              case "CAR":
              case "BUS":
                return "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]";
              case "HOTEL":
                return "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]";
              case "EVENT":
              case "ACTIVITY":
                return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
              default:
                return "bg-gray-100 text-gray-700 border-gray-200";
            }
          };

          const getNormalCardStyle = (type: string) => {
            switch (type) {
              case "FLIGHT":
                return "bg-gradient-to-br from-sky-50/80 via-white to-sky-50/40 border-sky-200/90 hover:border-sky-400 shadow-[0_4px_16px_rgba(28,111,217,0.06)]";
              case "TRAIN":
                return "bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-amber-200/90 hover:border-amber-400 shadow-[0_4px_16px_rgba(217,119,6,0.06)]";
              case "TRANSFER":
              case "TAXI":
              case "CAR":
              case "BUS":
                return "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 hover:border-emerald-400 shadow-[0_4px_16px_rgba(4,120,87,0.06)]";
              case "HOTEL":
                return "bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 border-purple-200/90 hover:border-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.06)]";
              default:
                return "bg-gradient-to-br from-[#F8FBFF] via-white to-[#F0F6FC] border-[#74BCFB]/40 hover:border-[#1C6FD9]/60 shadow-[0_4px_16px_rgba(10,61,115,0.05)]";
            }
          };

          return (
            <div className="bg-gradient-to-br from-white/96 via-[#FAFCFF]/95 to-[#F0F6FE]/90 backdrop-blur-2xl border border-[#74BCFB]/40 rounded-3xl p-6 sm:p-7 shadow-[0_18px_50px_rgba(10,61,115,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] space-y-6">
              {/* Traveler & Journey Headline */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FF] border border-[#74BCFB]/40 shadow-2xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1C6FD9] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1C6FD9]"></span>
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#1C6FD9]">
                        Active Itinerary &bull; AI Twin Guard
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#0F1B2B] shadow-2xs">
                      <User className="w-3.5 h-3.5 text-[#1C6FD9]" />
                      <span>{trip.traveler?.name || "Confirmed Traveler"}</span>
                      {trip.traveler?.phone && (
                        <span className="text-[#4A5B70] font-mono text-[11px]">
                          ({trip.traveler.phone})
                        </span>
                      )}
                    </span>
                  </div>

                  <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0F1B2B] tracking-tight">
                    {trip.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold text-[#4A5B70]">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[#F0F6FC] to-[#EAF5FF] px-3.5 py-2 rounded-2xl border border-[#74BCFB]/40 shadow-xs shrink-0 whitespace-nowrap">
                    <MapPin className="w-4 h-4 text-[#1C6FD9]" />
                    <span className="font-extrabold text-[#0F1B2B] text-sm">
                      {trip.source || "Delhi"}
                    </span>
                    <span className="text-[#1C6FD9] font-black">&rarr;</span>
                    <span className="font-extrabold text-[#0F1B2B] text-sm">
                      {trip.destination || "Jaipur"}
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-xs font-bold text-[#0F1B2B] shrink-0 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-[#1C6FD9]" />
                    {formatTripDates(trip.startDate, trip.endDate)}
                  </span>

                  <span className="flex items-center gap-1.5 bg-[#EAF5FF] text-[#1C6FD9] font-black px-3.5 py-2 rounded-2xl border border-[#74BCFB]/50 shadow-xs shrink-0 whitespace-nowrap">
                    <Layers className="w-3.5 h-3.5" />
                    {totalLegs} Configured Legs
                  </span>
                </div>
              </div>

              {/* Real-time Corridor Weather Telemetry */}
              <div className="pt-1">
                <LiveWeatherWidget
                  source={trip.source || "Delhi"}
                  destination={trip.destination || "Jaipur"}
                  onOpenSandbox={() => {
                    setIsSimHubOpen(true);
                    setSimModeTab("WEATHER_TWIN");
                    setTimeout(() => {
                      document.getElementById("simulation-hub")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                />
              </div>

              {/* Complete Itinerary Sequence Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1C6FD9]" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F1B2B]">
                      Complete Journey Itinerary Sequence ({totalLegs} Consecutive Nodes)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSimHubOpen((prev) => !prev);
                        if (!isSimHubOpen) {
                          setTimeout(() => {
                            document.getElementById("simulation-hub")?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#74BCFB]/40 text-[#1C6FD9] hover:bg-[#EAF5FF] font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                    >
                      <Sliders className="w-3 h-3 text-[#1C6FD9]" />
                      <span>{isSimHubOpen ? "Hide Disruption Simulator" : "⚡ Simulate Disruption / Sandbox"}</span>
                    </button>
                    <span className="text-[11px] text-[#4A5B70] font-medium hidden sm:inline">
                      Sequential chronological schedule & transfer buffers
                    </span>
                  </div>
                </div>

                {/* Complete Itinerary Sequence List / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {trip.items.map((item, index) => {
                    const isCritical = item.priority === "CRITICAL";
                    const isLast = index === trip.items.length - 1;
                    const isRecovered =
                      item.status === "RECOVERED" ||
                      (item.notes && item.notes.includes("✓ Confirmed Replacement"));
                    const isCancelled = item.status === "CANCELLED";
                    const isAffected = item.status === "AFFECTED";
                    const isAtRisk = item.status === "AT_RISK";

                    return (
                      <div
                        key={item.id || index}
                        className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                          isRecovered
                            ? "bg-gradient-to-b from-[#F0FDF9] to-[#E6FBF7] border-[#2CD9B8] ring-2 ring-[#2CD9B8]/40 shadow-[0_4px_16px_rgba(44,217,184,0.15)]"
                            : isCancelled || isAffected
                            ? "bg-gradient-to-b from-[#FFF5F5] to-[#FEE2E2] border-red-300 ring-2 ring-red-400/30 shadow-[0_4px_14px_rgba(239,68,68,0.08)]"
                            : isAtRisk
                            ? "bg-gradient-to-b from-[#FFFDF0] to-[#FEF3C7] border-amber-300 ring-1 ring-amber-400/30"
                            : isCritical
                            ? "bg-gradient-to-b from-[#FFFDF8] to-[#FFF8EC] border-[#FDE68A] shadow-[0_4px_14px_rgba(217,119,6,0.08)] ring-1 ring-[#FDE68A]"
                            : getNormalCardStyle(item.type)
                        }`}
                      >
                        <div>
                          {/* Top Row: Leg Number & Transit Mode Badge */}
                          <div className="flex items-center justify-between gap-1.5 mb-2.5">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#4A5B70]">
                              Leg {index + 1}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isRecovered ? (
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white border border-emerald-700 flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Rebooked
                                </span>
                              ) : isCancelled ? (
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white border border-red-700 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Cancelled
                                </span>
                              ) : isAffected ? (
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white border border-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Disrupted
                                </span>
                              ) : isAtRisk ? (
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white border border-amber-600">
                                  At Risk
                                </span>
                              ) : isCritical ? (
                                <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                                  Critical
                                </span>
                              ) : null}

                              <span
                                className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${getModeBadgeStyle(
                                  item.type
                                )}`}
                              >
                                {getModeIcon(item.type)}
                                <span>{item.type}</span>
                              </span>
                            </div>
                          </div>

                          {/* Leg Title */}
                          <h3 className="font-sans font-bold text-sm text-[#0F1B2B] leading-snug line-clamp-2 mb-1">
                            {item.title}
                          </h3>

                          {/* Provider & Reference */}
                          {(item.provider || item.referenceNumber) && (
                            <p className="text-[11px] text-[#4A5B70] font-medium truncate mb-2">
                              {item.provider}
                              {item.referenceNumber && (
                                <span className="font-mono text-[10px] ml-1 text-gray-500 font-bold">
                                  ({item.referenceNumber})
                                </span>
                              )}
                            </p>
                          )}

                          {/* Recovered Note if present */}
                          {isRecovered && item.notes && (
                            <div className="mb-2 p-1.5 rounded-xl bg-white/90 border border-emerald-200 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">Confirmed Alternative Rebooked & 100% Refund Credited</span>
                            </div>
                          )}

                          {/* Route Origin -> Destination */}
                          <div className="text-[11px] text-[#0F1B2B] font-semibold flex items-center gap-1.5 mb-2 bg-white/70 p-2 rounded-xl border border-gray-100">
                            <MapPin className="w-3 h-3 text-[#1C6FD9] shrink-0" />
                            <span className="truncate">
                              {item.departureLocation || trip.source}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">
                              {item.arrivalLocation || item.location || trip.destination}
                            </span>
                          </div>
                        </div>

                        {/* Timetable & Buffer Footer */}
                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-[#4A5B70] mt-1 font-mono">
                          <span className="flex items-center gap-1 font-bold text-[#0F1B2B]">
                            <Clock className="w-3 h-3 text-[#1C6FD9]" />
                            {item.startTime} – {item.endTime}
                          </span>
                          {item.bufferMinutes > 0 ? (
                            <span className="text-[10px] font-bold text-[#1C6FD9] bg-[#EAF5FF] px-2 py-0.5 rounded-md border border-[#74BCFB]/30">
                              +{item.bufferMinutes}m buffer
                            </span>
                          ) : !isLast ? (
                            <span className="text-[10px] text-gray-400">Direct transfer</span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#047857] bg-[#E6FBF7] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                              Final Node ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })())}

        {/* Proactive Risk Radar */}
        {riskAlerts.length > 0 && !trip?.activeDisruption && (
          <RiskAlertsBanner alerts={riskAlerts} />
        )}

        {/* Section 1: Itinerary Timeline & Dependency Graph with Real-Time Route Map (The Primary Core Experience) */}
        <section id="itinerary">
          <ItineraryView
            items={trip?.items || []}
            activeDisruptedItemIds={impact?.directImpact || []}
            downstreamItemIds={impact?.downstreamImpact || []}
            tripSource={trip?.source || "Delhi"}
            tripDestination={trip?.destination || "Jaipur"}
            activeDisruption={trip?.activeDisruption}
            selectedRecoveryPlan={focusedPlan || selectedPlanForConfirm || (plans.length > 0 ? plans[0] : null)}
            simulatedImpact={simulatedImpact}
          />
        </section>

        {/* Section 2: Impact Analysis (shows when disruption active) */}
        {impact && trip?.activeDisruption && (
          <section id="impact">
            <ImpactAnalysisView
              impact={impact}
              disruption={trip.activeDisruption}
              onClearDisruption={handleClearDisruption}
            />
          </section>
        )}

        {/* Section 3: Recovery Options Comparison (shows when disruption active) */}
        {plans.length > 0 && (
          <section id="recovery">
            <RecoveryComparisonView
              plans={plans}
              onSelectPlan={(plan) => {
                setFocusedPlan(plan);
                setSelectedPlanForConfirm(plan);
              }}
              onFocusPlan={(plan) => setFocusedPlan(plan)}
              focusedPlanId={focusedPlan?.id}
              isLoading={isLoading}
            />
          </section>
        )}

        {/* Section 4: AI Operational Twin & Disruption Simulator (Collapsible sandbox when normal/recovered) */}
        <section id="simulation-hub" className="space-y-4">
          {!isSimHubOpen && !trip?.activeDisruption ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white/96 via-[#F6FAFF]/95 to-[#EEF5FD]/90 backdrop-blur-2xl border border-[#74BCFB]/60 shadow-[0_14px_45px_rgba(28,111,217,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ring-1 ring-[#74BCFB]/25">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EAF5FF] to-[#D4E8FC] border border-[#74BCFB]/50 flex items-center justify-center text-[#1C6FD9] shadow-xs shrink-0">
                  <Sliders className="w-5 h-5 text-[#1C6FD9]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1C6FD9] bg-[#EAF5FF] px-2.5 py-0.5 rounded-full border border-[#74BCFB]/40">
                      Resilience Sandbox
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Trip nominal &amp; protected
                    </span>
                  </div>
                  <h3 className="font-sans font-extrabold text-base sm:text-lg text-[#0F1B2B] mt-1 tracking-tight">
                    Disruption Simulation &amp; Weather Digital Twin
                  </h3>
                  <p className="text-xs text-[#4A5B70] font-medium mt-0.5">
                    Stress-test this itinerary against live Indian micro-weather phenomena, cloudbursts, and carrier cancelations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSimHubOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1C6FD9] via-[#2563EB] to-[#4F46E5] hover:from-[#1558B0] hover:to-[#3730A3] text-white font-extrabold text-xs shadow-[0_6px_20px_rgba(28,111,217,0.35)] hover:shadow-[0_10px_26px_rgba(28,111,217,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shrink-0 cursor-pointer self-stretch sm:self-auto justify-center uppercase tracking-wider"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Disruption Sandbox</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/60">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#74BCFB]/40 mb-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C6FD9] animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C6FD9]">
                      AI Operational Twin Hub
                    </span>
                  </div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-[#0F1B2B] tracking-tight">
                    Disruption Simulation &amp; Weather Digital Twin
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Tab Switcher */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-xl border border-[#74BCFB]/40 rounded-2xl shadow-[0_4px_20px_rgba(10,61,115,0.06)] text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSimModeTab("WEATHER_TWIN")}
                      className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        simModeTab === "WEATHER_TWIN"
                          ? "bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] text-white shadow-[0_2px_10px_rgba(28,111,217,0.35)]"
                          : "text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-[#EAF5FF]/60"
                      }`}
                    >
                      <CloudRain className="w-3.5 h-3.5" />
                      <span>Weather Twin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimModeTab("SOCIAL_SIGNALS")}
                      className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        simModeTab === "SOCIAL_SIGNALS"
                          ? "bg-gradient-to-r from-[#1C6FD9] to-[#2563EB] text-white shadow-[0_2px_10px_rgba(28,111,217,0.35)]"
                          : "text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-[#EAF5FF]/60"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Public Signals</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimModeTab("BENCHMARKS")}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        simModeTab === "BENCHMARKS"
                          ? "bg-[#1C6FD9] text-white shadow-[0_2px_8px_rgba(28,111,217,0.3)]"
                          : "text-[#4A5B70] hover:text-[#0F1B2B] hover:bg-[#EAF5FF]/60"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Benchmarks</span>
                    </button>
                  </div>

                  {!trip?.activeDisruption && (
                    <button
                      type="button"
                      onClick={() => setIsSimHubOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-[#4A5B70] hover:text-[#0F1B2B] text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Collapse Sandbox
                    </button>
                  )}
                </div>
              </div>

              {/* Active Tab Panel */}
              {simModeTab === "WEATHER_TWIN" && trip && (
                <div className="space-y-6">
                  <LiveWeatherCard
                    defaultCity={trip.source || "Mumbai"}
                    destinationCity={trip.destination || "New Delhi"}
                  />
                  <DigitalTwinWhatIfSimulator
                    trip={trip}
                    onSimulatedImpactChange={setSimulatedImpact}
                  />
                  <WeatherSimulationSandbox
                    trip={trip}
                    onSimulatedImpactChange={(sim) =>
                      setSimulatedImpactState(
                        sim?.impactResult
                          ? { isSimulated: true, ...sim.impactResult }
                          : null
                      )
                    }
                  />
                </div>
              )}

              {simModeTab === "SOCIAL_SIGNALS" && trip && (
                <SocialSignalsTicker location={trip.source || trip.destination || "Mumbai"} />
              )}

              {simModeTab === "BENCHMARKS" && (
                <ScenarioPicker
                  activeDisruption={trip?.activeDisruption}
                  onSelectScenario={handleSelectScenario}
                  onClearDisruption={handleClearDisruption}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

        </section>
      </main>

      {/* Confirmation & Payment Gateway Modal */}
      <ConfirmApplyModal
        plan={selectedPlanForConfirm}
        isOpen={!!selectedPlanForConfirm}
        onConfirm={(plan) => handleApplyPlan(plan.id, plan)}
        onClose={() => setSelectedPlanForConfirm(null)}
        isLoading={isLoading}
        tripId={tripId}
      />

      {/* Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        tripId={tripId}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EAF5FF] flex items-center justify-center p-8">
          <div className="p-8 text-center max-w-sm rounded-3xl bg-white/95 backdrop-blur-xl border border-[#74BCFB]/30 shadow-[0_12px_40px_rgba(10,61,115,0.08)]">
            <Compass className="w-10 h-10 text-[#1C6FD9] animate-spin mx-auto mb-4" />
            <h3 className="font-sans font-extrabold text-lg text-[#0F1B2B]">
              Loading Itinerary Graph...
            </h3>
            <p className="text-xs text-[#4A5B70] mt-1 font-medium">
              Synchronizing nodes and connection buffers
            </p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
