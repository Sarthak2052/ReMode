import type {
  TripSnapshot,
  ItineraryItem,
  DisruptionEvent,
  RecoveryPlan,
  ItemType,
  ItemStatus,
  Priority,
  RecoveryPriorityPreference,
} from "@/types";
import type {
  Trip,
  ItineraryItem as PrismaItem,
  Disruption as PrismaDisruption,
  RecoveryPlan as PrismaPlan,
} from "@prisma/client";

function formatTimeString(date: Date | string | null | undefined): string {
  if (!date) return "00:00";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return "00:00";
  }
}

export function mapPrismaItemToItineraryItem(item: PrismaItem): ItineraryItem {
  const metadata = (item.metadata as Record<string, any>) || {};
  const cancellationPolicy = Array.isArray(item.cancellationPolicy)
    ? (item.cancellationPolicy as any)
    : [{ thresholdHours: 4, refundPercent: 100 }];

  // Normalize item status
  let status: ItemStatus = "NORMAL";
  const s = (item.status || "").toUpperCase();
  if (s === "CONFIRMED" || s === "NORMAL") status = "NORMAL";
  else if (s === "DELAYED" || s === "AFFECTED") status = "AFFECTED";
  else if (s === "CANCELLED") status = "CANCELLED";
  else if (s === "AT_RISK") status = "AT_RISK";
  else if (s === "REBOOKED" || s === "RECOVERED") status = "RECOVERED";
  else if (s === "RESCHEDULED") status = "RESCHEDULED";
  else if (s === "MISSED") status = "MISSED";

  // Normalize item type
  let type: ItemType = "FLIGHT";
  const t = (item.type || "").toUpperCase();
  if (t === "CAB" || t === "TAXI" || t === "TRANSFER" || t === "FERRY") type = "TRANSFER";
  else if (t === "TRAIN") type = "TRAIN";
  else if (t === "BUS") type = "BUS";
  else if (t === "HOTEL") type = "HOTEL";
  else if (t === "ACTIVITY" || t === "EVENT") type = "ACTIVITY";
  else type = "FLIGHT";

  return {
    id: item.id,
    tripId: item.tripId,
    type,
    title:
      metadata.title ||
      `${item.provider} ${item.type} (${item.source} -> ${item.destination})`,
    provider: item.provider,
    referenceNumber: item.referenceNumber || "",
    startTime: metadata.startTime || formatTimeString(item.departureTime),
    endTime: metadata.endTime || formatTimeString(item.arrivalTime),
    departureLocation: item.source,
    arrivalLocation: item.destination,
    location: item.destination,
    status,
    priority:
      (metadata.priority as Priority) ||
      (type === "FLIGHT" || type === "HOTEL" ? "HIGH" : "MEDIUM"),
    isFlexible: metadata.isFlexible ?? false,
    cancellationPolicy,
    refundPolicyNotes:
      typeof item.cancellationPolicy === "object" && item.cancellationPolicy !== null
        ? (item.cancellationPolicy as any).dgcaRights || (item.cancellationPolicy as any).rules
        : undefined,
    cost: item.cost,
    currency: item.currency || "INR",
    dependencies: item.dependsOn || [],
    bufferMinutes: metadata.bufferMinutes ?? 60,
    metadata,
  };
}

import { BENCHMARK_SCENARIOS } from "@/core/dataset/disruptionBenchmarks";

export function mapPrismaDisruptionToEvent(d: PrismaDisruption): DisruptionEvent {
  let scenarioId: any = 1;
  if (d.source && d.source.startsWith("BENCHMARK_")) {
    const parsed = parseInt(d.source.replace("BENCHMARK_", ""), 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
      scenarioId = parsed;
    }
  } else {
    const matched = BENCHMARK_SCENARIOS.find((b) => b.disruptionType === d.type);
    if (matched) {
      scenarioId = matched.numericId;
    }
  }

  return {
    id: d.id,
    tripId: d.tripId,
    scenarioId,
    type: d.type as any,
    title: d.description ? d.description.split(".")[0] : `${d.type} Alert`,
    description: d.description,
    affectedItemIds:
      d.impactedItemIds.length > 0 ? [d.itemId, ...d.impactedItemIds] : [d.itemId],
    delayMinutes: d.delayMinutes,
    reportedAt: new Date(d.detectedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function mapPrismaPlanToRecoveryPlan(p: PrismaPlan): RecoveryPlan {
  let actions: any[] = [];
  let liveRecommendation: any = undefined;

  if (Array.isArray(p.actions)) {
    actions = p.actions as any;
    const actionWithLive = actions.find((a) => a.liveMetadata?.availableAlternatives);
    if (actionWithLive) {
      liveRecommendation = {
        isLiveApi: actionWithLive.liveMetadata.isLiveApi,
        mode: actionWithLive.liveMetadata.transportMode,
        corridor: actionWithLive.description,
        headline: `Live ${actionWithLive.liveMetadata.transportMode} Availability`,
        availableAlternatives: actionWithLive.liveMetadata.availableAlternatives,
      };
    }
  } else if (p.actions && typeof p.actions === "object") {
    const raw = p.actions as any;
    actions = Array.isArray(raw.list) ? raw.list : [];
    liveRecommendation = raw.liveRecommendation;
  }

  return {
    id: p.id,
    tripId: p.tripId,
    label: p.title,
    planType: (p.tier as any) || "FASTEST",
    rank: 1,
    additionalCost: p.costDelta > 0 ? p.costDelta : 0,
    refundAmount: p.costDelta < 0 ? Math.abs(p.costDelta) : 0,
    netAdditionalCost: p.costDelta,
    arrivalTime: "15:45",
    bufferMinutes: p.timeDeltaMinutes || 45,
    bufferRisk: p.riskScore > 0.6 ? "HIGH" : p.riskScore > 0.3 ? "MEDIUM" : "LOW",
    bookingsChanged: actions.length,
    activitiesLost: 0,
    distanceKm: 0,
    criticalEventProtected: "YES",
    feasibility: "RECOVERABLE",
    explanation: p.explanation,
    tradeOffSummary: p.description,
    luggageHandled: true,
    actions,
    scores: [
      { factor: "Risk Score", value: (p.riskScore * 100).toFixed(0), grade: "GOOD" },
      { factor: "Convenience", value: (p.convenienceScore * 100).toFixed(0), grade: "EXCELLENT" },
      { factor: "Preservation", value: (p.tripPreservation * 100).toFixed(0), grade: "EXCELLENT" },
    ],
    liveRecommendation,
  };
}

export function mapPrismaTripToSnapshot(
  trip: Trip & {
    items: PrismaItem[];
    disruptions?: PrismaDisruption[];
    history?: { action: string; createdAt: Date; items: any }[];
    user?: { name: string; priorityWeights?: any } | null;
  }
): TripSnapshot {
  const activeDisruption =
    trip.disruptions?.find((d) => d.status === "ACTIVE") || trip.disruptions?.[0];

  return {
    id: trip.id,
    title: trip.title,
    source: trip.source || "Origin",
    destination: trip.destination,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    traveler: {
      name: trip.user?.name || "Manas Kadam",
      priorityPreference: "SPEED" as RecoveryPriorityPreference,
    },
    items: trip.items.map(mapPrismaItemToItineraryItem),
    activeDisruption: activeDisruption ? mapPrismaDisruptionToEvent(activeDisruption) : null,
    history: (trip.history || []).map((h) => ({
      timestamp: h.createdAt.toISOString(),
      action: h.action,
      items: Array.isArray(h.items) ? (h.items as any) : [],
    })),
  };
}
