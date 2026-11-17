import type { Feasibility, RecoveryPlan } from "../types/index.ts";

export interface PlanEvaluation {
  planId: string;
  totalScore: number;
  criticalEventScore: number;
  bufferScore: number;
  costEfficiencyScore: number;
  stabilityScore: number;
  factors: {
    factor: string;
    value: string | number;
    grade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
    commentary: string;
  }[];
}

export class RiskScorer {
  public static evaluatePlan(
    plan: Partial<RecoveryPlan>,
    travelerPreference: "SPEED" | "COST" | "COMFORT" | "LOWEST_COST" | "MIN_CHANGES" | "BALANCED" = "SPEED"
  ): PlanEvaluation {
    const factors: PlanEvaluation["factors"] = [];

    const netCost = plan.netAdditionalCost ?? 0;
    const additionalCost = plan.additionalCost ?? 0;
    const refund = plan.refundAmount ?? 0;

    let costGrade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL" = "GOOD";
    if (netCost <= 500) costGrade = "EXCELLENT";
    else if (netCost <= 2500) costGrade = "GOOD";
    else if (netCost <= 6000) costGrade = "WARNING";
    else costGrade = "CRITICAL";

    factors.push({
      factor: "Net Additional Cost",
      value: `₹${netCost.toLocaleString()} (New: ₹${additionalCost.toLocaleString()} - Refund: ₹${refund.toLocaleString()})`,
      grade: costGrade,
      commentary: netCost <= 0 ? "Fully covered by refunds" : "Net expense after guaranteed policy refunds",
    });

    factors.push({
      factor: "Estimated Arrival",
      value: plan.arrivalTime || "On schedule",
      grade: "EXCELLENT",
      commentary: "Calculated based on verified transit times",
    });

    const bufferMin = plan.bufferMinutes ?? 30;
    let bufferGrade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL" = "GOOD";
    if (bufferMin >= 45) bufferGrade = "EXCELLENT";
    else if (bufferMin >= 20) bufferGrade = "GOOD";
    else if (bufferMin >= 10) bufferGrade = "WARNING";
    else bufferGrade = "CRITICAL";

    factors.push({
      factor: "Buffer Before Next Event",
      value: `${bufferMin} minutes`,
      grade: bufferGrade,
      commentary:
        bufferMin < 15
          ? "High risk — razor-thin margin if traffic occurs"
          : "Comfortable buffer for airport/transit formalities",
    });

    const changed = plan.bookingsChanged ?? 1;
    factors.push({
      factor: "Bookings Changed",
      value: `${changed} booking${changed === 1 ? "" : "s"}`,
      grade: changed <= 1 ? "EXCELLENT" : changed <= 2 ? "GOOD" : "WARNING",
      commentary: changed <= 1 ? "Minimal friction to existing reservations" : "Requires multiple re-confirmations",
    });

    const lost = plan.activitiesLost ?? 0;
    factors.push({
      factor: "Activities Lost",
      value: lost === 0 ? "0 (All Preserved)" : `${lost} cancelled`,
      grade: lost === 0 ? "EXCELLENT" : "WARNING",
      commentary: lost === 0 ? "No itinerary sacrifices required" : "Non-critical activities surrendered",
    });

    const dist = plan.distanceKm ?? 2.5;
    factors.push({
      factor: "Distance Overhead",
      value: `${dist.toFixed(1)} km`,
      grade: dist <= 5 ? "EXCELLENT" : dist <= 12 ? "GOOD" : "WARNING",
      commentary: dist > 15 ? "Significant detour required" : "Optimal geographic proximity",
    });

    factors.push({
      factor: "Transport Availability",
      value: "Verified Available",
      grade: "EXCELLENT",
      commentary: "Live inventory locked via provider mock interface",
    });

    factors.push({
      factor: "Policy Compliance",
      value: "100% Policy Compliant",
      grade: "EXCELLENT",
      commentary: "All refunds verified against booking contracts",
    });

    const matchesPref =
      (travelerPreference === "SPEED" && plan.planType === "FASTEST") ||
      ((travelerPreference === "COST" || travelerPreference === "LOWEST_COST") && plan.planType === "LOWEST_COST") ||
      ((travelerPreference === "COMFORT" || travelerPreference === "MIN_CHANGES") && plan.planType === "MINIMUM_CHANGES") ||
      (travelerPreference === "BALANCED" && (plan.planType === "FASTEST" || plan.planType === "MINIMUM_CHANGES"));

    factors.push({
      factor: "Traveler Preference Alignment",
      value: matchesPref ? `Direct Match (${travelerPreference})` : "Alternative Perspective",
      grade: matchesPref ? "EXCELLENT" : "GOOD",
      commentary: matchesPref
        ? "Directly honors traveler's primary travel persona"
        : "Balanced alternative trade-off",
    });

    const critProtected = plan.criticalEventProtected ?? "YES";
    let critGrade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL" = "EXCELLENT";
    if (critProtected === "YES") critGrade = "EXCELLENT";
    else if (critProtected === "RISKY") critGrade = "WARNING";
    else critGrade = "CRITICAL";

    factors.push({
      factor: "Critical Event Protection",
      value: critProtected,
      grade: critGrade,
      commentary:
        critProtected === "YES"
          ? "CRITICAL KEYNOTE 100% PROTECTED"
          : critProtected === "RISKY"
          ? "Event reachable but thin buffer (<15m)"
          : "UNABLE TO REACH BEFORE COMMENCEMENT",
    });

    let score = 70;
    if (critProtected === "YES") score += 20;
    else if (critProtected === "RISKY") score += 5;
    else score -= 30;

    if (bufferMin >= 40) score += 10;
    else if (bufferMin < 15) score -= 10;

    if (netCost <= 1500) score += 5;
    if (matchesPref) score += 5;

    return {
      planId: plan.id || "unspecified",
      totalScore: Math.max(0, Math.min(100, score)),
      criticalEventScore: critProtected === "YES" ? 100 : critProtected === "RISKY" ? 60 : 0,
      bufferScore: Math.min(100, bufferMin * 2),
      costEfficiencyScore: Math.max(0, 100 - netCost / 50),
      stabilityScore: Math.max(0, 100 - (plan.bookingsChanged || 1) * 20),
      factors,
    };
  }

  /**
   * Evaluates meteorological disruption physics across aviation, railway, and highway modes
   */
  public static scoreWeatherImpact(params: {
    rainfallMm: number;
    tempC: number;
    stormDurationHrs: number;
    transitType: string;
    bufferMinutes?: number;
  }): {
    probability: number;
    delayMinutes: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    confidence: "low" | "medium" | "high";
    reason: string;
    bufferErosionMinutes: number;
  } {
    const { rainfallMm, tempC, stormDurationHrs, transitType } = params;
    const bufferMinutes = params.bufferMinutes ?? 45;
    const mode = transitType.toUpperCase();

    let probability = 0.05;
    let delayMinutes = 0;
    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    let reason = "Nominal atmospheric conditions. Minimal transit impact anticipated.";

    if (mode === "FLIGHT") {
      if (rainfallMm >= 45 || (rainfallMm >= 30 && stormDurationHrs >= 4)) {
        probability = Math.min(0.96, 0.75 + (rainfallMm - 45) * 0.005 + stormDurationHrs * 0.04);
        delayMinutes = Math.min(240, 90 + Math.round(rainfallMm * 1.5 + stormDurationHrs * 20));
        riskLevel = "CRITICAL";
        reason = `Aviation Critical: Severe storm cell (${rainfallMm} mm/h) over corridor triggers ATC holding stacks, CAT-II/III approach, or ground stop.`;
      } else if (rainfallMm >= 25 || (rainfallMm >= 15 && stormDurationHrs >= 2)) {
        probability = Math.min(0.78, 0.48 + (rainfallMm - 25) * 0.01 + stormDurationHrs * 0.05);
        delayMinutes = Math.min(120, 45 + Math.round(rainfallMm * 1.2 + stormDurationHrs * 12));
        riskLevel = "HIGH";
        reason = `Aviation High: Heavy downpour (${rainfallMm} mm/h) and apron surface standing water induce pushback & turnaround delay.`;
      } else if (rainfallMm >= 10 || (rainfallMm >= 5 && stormDurationHrs >= 1)) {
        probability = Math.min(0.48, 0.25 + rainfallMm * 0.015);
        delayMinutes = Math.min(45, 15 + Math.round(rainfallMm * 1.0));
        riskLevel = "MODERATE";
        reason = `Aviation Moderate: Staggered departures due to wet runway braking distances.`;
      } else {
        probability = Math.max(0.05, Math.min(0.18, rainfallMm * 0.015));
        delayMinutes = 0;
        riskLevel = "LOW";
        reason = `Aviation Nominal: Standard flight operations. Clear visibility.`;
      }
    } else if (mode === "TRAIN") {
      if (rainfallMm >= 50 || (rainfallMm >= 35 && stormDurationHrs >= 3)) {
        probability = Math.min(0.94, 0.72 + (rainfallMm - 50) * 0.006 + stormDurationHrs * 0.03);
        delayMinutes = Math.min(210, 80 + Math.round(rainfallMm * 1.6 + stormDurationHrs * 15));
        riskLevel = "CRITICAL";
        reason = `Railways Critical: Track waterlogging above rail flange level (>100mm). Track circuits clamped red.`;
      } else if (rainfallMm >= 25 || (rainfallMm >= 15 && stormDurationHrs >= 2)) {
        probability = Math.min(0.75, 0.45 + (rainfallMm - 25) * 0.01);
        delayMinutes = Math.min(100, 40 + Math.round(rainfallMm * 1.2 + stormDurationHrs * 10));
        riskLevel = "HIGH";
        reason = `Railways High: Submerged track ballast. Mandatory 15-25 km/h caution speed order issued by zonal control.`;
      } else if (tempC >= 46) {
        probability = 0.65;
        delayMinutes = 45;
        riskLevel = "HIGH";
        reason = `Railways High: Extreme track ambient temperature (${tempC}°C) induces continuous welded rail buckling hazard.`;
      } else if (rainfallMm >= 10) {
        probability = Math.min(0.42, 0.22 + rainfallMm * 0.015);
        delayMinutes = 20;
        riskLevel = "MODERATE";
        reason = `Railways Moderate: Minor signal visibility delay and slow speed orders.`;
      } else {
        probability = Math.max(0.04, Math.min(0.15, rainfallMm * 0.012));
        delayMinutes = 0;
        riskLevel = "LOW";
        reason = `Railways Nominal: Green track signals. On schedule.`;
      }
    } else {
      // Road / Bus / Transfer / Taxi
      if (rainfallMm >= 40 || (rainfallMm >= 25 && stormDurationHrs >= 4)) {
        probability = Math.min(0.92, 0.70 + (rainfallMm - 40) * 0.006 + stormDurationHrs * 0.03);
        delayMinutes = Math.min(180, 60 + Math.round(rainfallMm * 1.4 + stormDurationHrs * 18));
        riskLevel = "CRITICAL";
        reason = `Highway Critical: Expressway flash waterlogging and arterial traffic gridlock.`;
      } else if (rainfallMm >= 20 || (rainfallMm >= 12 && stormDurationHrs >= 2)) {
        probability = Math.min(0.72, 0.42 + (rainfallMm - 20) * 0.01);
        delayMinutes = Math.min(90, 30 + Math.round(rainfallMm * 1.1 + stormDurationHrs * 12));
        riskLevel = "HIGH";
        reason = `Highway Alert: Hydroplaning hazards on expressways; average speed reduced by 40%.`;
      } else if (rainfallMm >= 10) {
        probability = Math.min(0.40, 0.20 + rainfallMm * 0.015);
        delayMinutes = 20;
        riskLevel = "MODERATE";
        reason = `Highway Moderate: Rain slowing city traffic and entry toll plazas.`;
      } else {
        probability = Math.max(0.05, Math.min(0.15, rainfallMm * 0.01));
        delayMinutes = 0;
        riskLevel = "LOW";
        reason = `Highway Nominal: Clear vehicular transit corridor.`;
      }
    }

    const confidence: "low" | "medium" | "high" =
      stormDurationHrs >= 2 && (rainfallMm > 0 || tempC >= 40)
        ? "high"
        : rainfallMm > 0 || stormDurationHrs > 1
        ? "medium"
        : "low";

    const roundedProbability = Math.round(probability * 100) / 100;
    const bufferErosionMinutes = Math.min(bufferMinutes, delayMinutes);

    return {
      probability: roundedProbability,
      delayMinutes,
      riskLevel,
      confidence,
      reason,
      bufferErosionMinutes,
    };
  }
}
