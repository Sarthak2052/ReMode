import { prisma } from "@/lib/prisma";
import { TripStore } from "@/core/TripStore";
import { RecoveryEngine } from "@/core/RecoveryEngine";
import { BENCHMARK_SCENARIOS } from "@/core/dataset/disruptionBenchmarks";
import { DEMO_SCENARIOS, INITIAL_TRIP_SNAPSHOT } from "@/core/demoData";
import {
  mapPrismaTripToSnapshot,
  mapPrismaItemToItineraryItem,
  mapPrismaDisruptionToEvent,
  mapPrismaPlanToRecoveryPlan,
} from "./tripMapper";
import { getRouteRecommendedTemplate } from "@/core/dataset/routeCatalogs";
import { sendTravelAlert } from "./notificationService";
import type {
  TripSnapshot,
  ItineraryItem,
  DisruptionEvent,
  ImpactAnalysis,
  RecoveryPlan,
  RiskAlert,
} from "@/types";

const engine = new RecoveryEngine();

let dbCheckPromise: Promise<boolean> | null = null;
let dbAvailable: boolean | null = null;
let defaultTripsChecked = false;

interface CachedTrip {
  trip: TripSnapshot;
  cachedAt: number;
}
const tripCache = new Map<string, CachedTrip>();
const TRIP_CACHE_TTL_MS = 20000; // 20 seconds TTL

export function invalidateTripCache(tripId?: string) {
  if (tripId) {
    tripCache.delete(tripId);
  } else {
    tripCache.clear();
  }
}

export async function canUseDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    return false;
  }
  if (dbAvailable !== null) return dbAvailable;
  if (dbCheckPromise) return dbCheckPromise;

  dbCheckPromise = (async () => {
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 4000)
        ),
      ]);
      dbAvailable = true;
      return true;
    } catch (err) {
      console.warn("⚠️ PostgreSQL not reachable, using in-memory TripStore:", (err as any)?.message || err);
      dbAvailable = false;
      setTimeout(() => { dbAvailable = null; }, 10000);
      return false;
    } finally {
      dbCheckPromise = null;
    }
  })();

  return dbCheckPromise;
}

export const isPrismaAvailable = canUseDatabase;

export const DEFAULT_FALLBACK_USER = {
  id: "user-manas-1",
  email: "manas.kadam@example.com",
  name: "Manas Kadam",
  phone: "+91 98200 12345",
  homeAirport: "BOM",
  currency: "INR",
  avoidNightTravel: false,
  carrierLoyalty: ["IndiGo", "Taj Hotels"],
  priorityWeights: { costWeight: 0.3, timeWeight: 0.5, convenienceWeight: 0.2 },
  loyaltyPrograms: { IndiGo: "6E-8829104", "Taj Hotels": "TIC-449102" },
  trips: [],
  notifications: [],
};

/**
 * Ensure default demo trips and initial seed data exist in PostgreSQL
 */
export async function ensureDefaultTrips(): Promise<void> {
  if (defaultTripsChecked) return;
  if (!(await canUseDatabase())) {
    TripStore.getInstance();
    return;
  }

  try {
    const existingCount = await prisma.trip.count();
    defaultTripsChecked = true;
    if (existingCount > 0) return;

    // Create default fallback user
    const user = await prisma.user.upsert({
      where: { email: "manas.kadam@example.com" },
      update: {},
      create: {
        email: "manas.kadam@example.com",
        name: "Manas Kadam",
        phone: "+91 98200 12345",
        homeAirport: "BOM",
        currency: "INR",
        avoidNightTravel: true,
        carrierLoyalty: ["IndiGo", "Taj Hotels"],
        loyaltyPrograms: {
          IndiGo: "6E-8829104",
          "Taj Hotels": "TIC-449102",
        },
        priorityWeights: {
          costWeight: 0.3,
          timeWeight: 0.5,
          convenienceWeight: 0.2,
        },
      },
    });

    // Seed default Denver/Delhi trip
    const trip = await prisma.trip.create({
      data: {
        id: INITIAL_TRIP_SNAPSHOT.id,
        userId: user.id,
        title: INITIAL_TRIP_SNAPSHOT.title,
        source: INITIAL_TRIP_SNAPSHOT.source || "BOM",
        destination: INITIAL_TRIP_SNAPSHOT.destination,
        startDate: new Date(INITIAL_TRIP_SNAPSHOT.startDate || "2026-10-15T04:30:00Z"),
        endDate: new Date(INITIAL_TRIP_SNAPSHOT.endDate || "2026-10-18T18:00:00Z"),
        status: "ACTIVE",
      },
    });

    for (const item of INITIAL_TRIP_SNAPSHOT.items) {
      await prisma.itineraryItem.create({
        data: {
          id: item.id,
          tripId: trip.id,
          type: item.type,
          provider: item.provider,
          referenceNumber: item.referenceNumber,
          source: item.departureLocation,
          destination: item.arrivalLocation,
          departureTime: new Date("2026-10-15T10:00:00Z"),
          arrivalTime: new Date("2026-10-15T12:15:00Z"),
          cost: item.cost,
          currency: item.currency,
          status: item.status === "NORMAL" ? "CONFIRMED" : (item.status as any),
          dependsOn: item.dependencies,
          cancellationPolicy: item.cancellationPolicy as any,
          metadata: {
            title: item.title,
            startTime: item.startTime,
            endTime: item.endTime,
            bufferMinutes: item.bufferMinutes,
            priority: item.priority,
            isFlexible: item.isFlexible,
            ...(item.metadata || {}),
          },
        },
      });
    }

    // Record initial history
    await prisma.tripHistory.create({
      data: {
        tripId: trip.id,
        action: "TRIP_CREATED",
        details: "Initial trip itinerary imported and verified.",
        items: INITIAL_TRIP_SNAPSHOT.items as any,
      },
    });
  } catch (err) {
    console.warn("Failed to seed Prisma, operating with TripStore:", err);
  }
}

/**
 * Fetch all trips from PostgreSQL with history, disruptions, and user
 */
export async function getAllTrips(): Promise<TripSnapshot[]> {
  if (!(await canUseDatabase())) {
    return TripStore.getInstance().getAllTrips();
  }
  try {
    await ensureDefaultTrips();
    const trips = await prisma.trip.findMany({
      include: {
        items: true,
        disruptions: true,
        user: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return trips.map(mapPrismaTripToSnapshot);
  } catch (err) {
    console.warn("getAllTrips error in Prisma, falling back to TripStore:", err);
    return TripStore.getInstance().getAllTrips();
  }
}

/**
 * Fetch a single trip by ID from PostgreSQL or memory
 */
export async function getTripById(tripId: string): Promise<TripSnapshot | null> {
  const cached = tripCache.get(tripId);
  if (cached && Date.now() - cached.cachedAt < TRIP_CACHE_TTL_MS) {
    return cached.trip;
  }

  if (!(await canUseDatabase())) {
    const store = TripStore.getInstance();
    const memTrip = store.getTrip(tripId) || store.getTrip(INITIAL_TRIP_SNAPSHOT.id) || null;
    if (memTrip) {
      tripCache.set(tripId, { trip: memTrip, cachedAt: Date.now() });
    }
    return memTrip;
  }

  try {
    await ensureDefaultTrips();
    let trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        items: true,
        disruptions: true,
        user: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!trip) {
      trip = await prisma.trip.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          disruptions: true,
          user: true,
          history: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    // Self-healing: if a trip exists in DB but has 0 items (e.g. from unique constraint or blank creation), auto-populate recommended legs
    if (trip && trip.items.length === 0) {
      const template = getRouteRecommendedTemplate(
        trip.source || "Delhi",
        trip.destination || "Mumbai",
        trip.title
      );

      const idMap = new Map<string, string>();
      template.forEach((item, idx) => {
        idMap.set(item.id || `leg-${idx}`, `item-${trip!.id}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`);
      });

      for (const item of template) {
        const uniqueId = idMap.get(item.id!) || `item-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const remappedDependsOn = (item.dependencies || []).map((dep) => idMap.get(dep) || dep);
        await prisma.itineraryItem.create({
          data: {
            id: uniqueId,
            tripId: trip.id,
            type: item.type || "FLIGHT",
            provider: item.provider || "Standard Provider",
            referenceNumber: item.referenceNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
            source: item.departureLocation || trip.source || "Origin",
            destination: item.arrivalLocation || trip.destination || "Destination",
            departureTime: new Date(trip.startDate.getTime() + 2 * 3600 * 1000),
            arrivalTime: new Date(trip.startDate.getTime() + 4 * 3600 * 1000),
            cost: item.cost || 0,
            currency: item.currency || "INR",
            status: "CONFIRMED",
            dependsOn: remappedDependsOn,
            cancellationPolicy: (item.cancellationPolicy as any) || [],
            metadata: {
              title: item.title,
              startTime: item.startTime,
              endTime: item.endTime,
              bufferMinutes: item.bufferMinutes,
              priority: item.priority,
              isFlexible: item.isFlexible,
              ...(item.metadata || {}),
            },
          },
        }).catch((e) => console.warn("[getTripById] Self-heal item creation notice:", e));
      }

      trip = await prisma.trip.findUnique({
        where: { id: trip.id },
        include: {
          items: true,
          disruptions: true,
          user: true,
          history: { orderBy: { createdAt: "desc" } },
        },
      });
    }

    const mapped = trip ? mapPrismaTripToSnapshot(trip) : TripStore.getInstance().getTrip(tripId) || null;
    if (mapped) {
      tripCache.set(tripId, { trip: mapped, cachedAt: Date.now() });
      if (mapped.id && mapped.id !== tripId) {
        tripCache.set(mapped.id, { trip: mapped, cachedAt: Date.now() });
      }
    }
    return mapped;
  } catch (err) {
    console.warn("getTripById error in Prisma, falling back to TripStore:", err);
    const store = TripStore.getInstance();
    const memTrip = store.getTrip(tripId) || store.getTrip(INITIAL_TRIP_SNAPSHOT.id) || null;
    if (memTrip) {
      tripCache.set(tripId, { trip: memTrip, cachedAt: Date.now() });
    }
    return memTrip;
  }
}

/**
 * Create a new trip (stores in memory and attempts database persistence)
 */
export async function createTrip(params: {
  id?: string;
  title: string;
  source?: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  traveler?: { name?: string; priorityPreference?: any; phone?: string; email?: string };
  items?: ItineraryItem[];
  userPhone?: string;
  phone?: string;
  userEmail?: string;
  email?: string;
}): Promise<TripSnapshot> {
  const tripId = params.id || `trip-${Date.now()}`;

  const recipientPhone =
    params.userPhone ||
    params.traveler?.phone ||
    params.phone ||
    "8879808016";

  // Always send confirmation alert regardless of database availability
  const confirmMsg =
    `✈️ ReMode Trip Confirmed!\n` +
    `Trip: ${params.title}\n` +
    `Route: ${params.source || "Origin"} ➔ ${params.destination}\n` +
    `Status: Confirmed (${params.items?.length || 1} segments active)\n` +
    `Radar Sentinel: Active — Live WhatsApp alerts will be dispatched here if delays or cancellations arise.`;

  sendTravelAlert({
    phoneNumber: recipientPhone,
    message: confirmMsg,
    channel: "whatsapp",
  }).catch((err) => console.error("[tripService] WhatsApp Trip Confirmation error:", err));

  if (!(await canUseDatabase())) {
    return TripStore.getInstance().createTrip({
      ...params,
      id: tripId,
      traveler: {
        ...params.traveler,
        phone: recipientPhone,
      },
      userPhone: recipientPhone,
    });
  }

  try {
    const userEmail = params.userEmail || params.email || params.traveler?.email || "manas.kadam@example.com";
    const userName = params.traveler?.name || "Traveler";
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        name: userName,
        phone: recipientPhone,
      },
      create: {
        email: userEmail,
        name: userName,
        phone: recipientPhone,
        homeAirport: "BOM",
        currency: "INR",
        avoidNightTravel: false,
        carrierLoyalty: ["IndiGo", "Taj Hotels"],
        priorityWeights: { costWeight: 0.3, timeWeight: 0.5, convenienceWeight: 0.2 },
      },
    });

    const startDate = params.startDate ? new Date(params.startDate) : new Date();
    const endDate = params.endDate
      ? new Date(params.endDate)
      : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    const newTrip = await prisma.trip.create({
      data: {
        id: tripId,
        userId: user.id,
        title: params.title,
        source: params.source || "Origin Airport",
        destination: params.destination,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });

    if (params.items && params.items.length > 0) {
      const idMap = new Map<string, string>();
      params.items.forEach((item, idx) => {
        const uniqueId = `item-${newTrip.id.replace(/[^a-zA-Z0-9]/g, "")}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`;
        if (item.id) {
          idMap.set(item.id, uniqueId);
        }
      });

      for (const item of params.items) {
        const uniqueId = (item.id && idMap.get(item.id)) || `item-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const remappedDependsOn = (item.dependencies || []).map((dep) => idMap.get(dep) || dep);

        await prisma.itineraryItem.create({
          data: {
            id: uniqueId,
            tripId: newTrip.id,
            type: item.type,
            provider: item.provider || "Standard Provider",
            referenceNumber: item.referenceNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
            source: item.departureLocation || params.source || "Origin",
            destination: item.arrivalLocation || params.destination || "Destination",
            departureTime: new Date(startDate.getTime() + 2 * 3600 * 1000),
            arrivalTime: new Date(startDate.getTime() + 4 * 3600 * 1000),
            cost: item.cost || 0,
            currency: item.currency || "INR",
            status: item.status === "NORMAL" ? "CONFIRMED" : (item.status as any) || "CONFIRMED",
            dependsOn: remappedDependsOn,
            cancellationPolicy: (item.cancellationPolicy as any) || [],
            metadata: {
              title: item.title,
              startTime: item.startTime,
              endTime: item.endTime,
              bufferMinutes: item.bufferMinutes,
              priority: item.priority,
              isFlexible: item.isFlexible,
              ...(item.metadata || {}),
            },
          },
        });
      }
    } else {
      const flight = await prisma.itineraryItem.create({
        data: {
          tripId: newTrip.id,
          type: "FLIGHT",
          provider: "IndiGo",
          referenceNumber: `6E-${Math.floor(1000 + Math.random() * 9000)}`,
          source: params.source || "Origin Airport (T1)",
          destination: `${params.destination} Airport (T2)`,
          departureTime: new Date(startDate.getTime() + 2 * 3600 * 1000),
          arrivalTime: new Date(startDate.getTime() + 4 * 3600 * 1000),
          cost: 5400,
          currency: "INR",
          status: "CONFIRMED",
          dependsOn: [],
          metadata: {
            title: `Outbound Flight to ${params.destination}`,
            startTime: "10:00",
            endTime: "12:00",
            bufferMinutes: 60,
            priority: "HIGH",
          },
        },
      });

      const cab = await prisma.itineraryItem.create({
        data: {
          tripId: newTrip.id,
          type: "CAB",
          provider: "BluSmart / Uber",
          referenceNumber: `CAB-${Math.floor(100 + Math.random() * 900)}`,
          source: `${params.destination} Airport (T2)`,
          destination: `${params.destination} Downtown`,
          departureTime: new Date(startDate.getTime() + 4.5 * 3600 * 1000),
          arrivalTime: new Date(startDate.getTime() + 5.5 * 3600 * 1000),
          cost: 650,
          currency: "INR",
          status: "CONFIRMED",
          dependsOn: [flight.id],
          metadata: {
            title: `Airport Chauffeur Transfer`,
            startTime: "12:30",
            endTime: "13:30",
            bufferMinutes: 45,
            priority: "MEDIUM",
          },
        },
      });

      await prisma.itineraryItem.create({
        data: {
          tripId: newTrip.id,
          type: "HOTEL",
          provider: "Taj / Oberoi Grand",
          referenceNumber: `HTL-${Math.floor(10000 + Math.random() * 90000)}`,
          source: `${params.destination} Downtown`,
          destination: `${params.destination} Downtown`,
          departureTime: new Date(startDate.getTime() + 6 * 3600 * 1000),
          arrivalTime: endDate,
          cost: 16000,
          currency: "INR",
          status: "CONFIRMED",
          dependsOn: [cab.id],
          metadata: {
            title: `Luxury Suite Check-in (${params.destination})`,
            startTime: "14:00",
            endTime: "11:00",
            bufferMinutes: 60,
            priority: "HIGH",
          },
        },
      });
    }

    const fullTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
      include: { items: true, disruptions: true, user: true, history: true },
    });

    // Record initial itinerary history
    await prisma.tripHistory.create({
      data: {
        tripId: newTrip.id,
        action: "TRIP_CREATED",
        details: `Trip to ${params.destination} planned with flight, cab transfer, and hotel bookings.`,
        items: fullTrip!.items.map(mapPrismaItemToItineraryItem) as any,
      },
    });

    // Add welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        tripId: newTrip.id,
        type: "TRIP_MONITORING_ACTIVE",
        title: "ReMode Guard Active",
        message: `Your journey "${params.title}" is now actively monitored across all connected travel legs.`,
      },
    });

    invalidateTripCache(tripId);
    return mapPrismaTripToSnapshot(fullTrip!);
  } catch (err) {
    console.warn("Falling back to TripStore for createTrip:", err);
    invalidateTripCache(tripId);
    return TripStore.getInstance().createTrip({
      ...params,
      id: tripId,
      traveler: {
        ...params.traveler,
        phone: recipientPhone,
      },
      userPhone: recipientPhone,
    });
  }
}

/**
 * Inject Disruption: Computes impact & recovery plans, saves history & notifications
 */
export async function injectDisruption(
  tripId: string,
  scenarioId: number,
  userPhone?: string
): Promise<{
  trip: TripSnapshot;
  disruption: DisruptionEvent;
  impact: ImpactAnalysis;
  plans: RecoveryPlan[];
}> {
  let result: {
    trip: TripSnapshot;
    disruption: DisruptionEvent;
    impact: ImpactAnalysis;
    plans: RecoveryPlan[];
  };

  invalidateTripCache(tripId);

  if (!(await canUseDatabase())) {
    result = await TripStore.getInstance().injectDisruption(tripId, scenarioId);
  } else {
    try {
      let dbTrip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { items: true, disruptions: true, user: true, history: true },
      });

      if (!dbTrip) {
        await ensureDefaultTrips();
        dbTrip = await prisma.trip.findFirst({
          include: { items: true, disruptions: true, user: true, history: true },
        });
        if (!dbTrip) {
          result = await TripStore.getInstance().injectDisruption(tripId, scenarioId);
        } else {
          tripId = dbTrip.id;
        }
      }

      const items = dbTrip.items.map(mapPrismaItemToItineraryItem);
      const benchmark = BENCHMARK_SCENARIOS.find((b) => b.numericId === scenarioId);
      const legacyDemo = DEMO_SCENARIOS.find((s) => s.scenarioId === scenarioId);

      const scenarioType = benchmark?.disruptionType || legacyDemo?.type || "FLIGHT_DELAY";
      const delayMinutes = benchmark?.typicalDelayMin || (scenarioType.includes("CANCEL") ? 0 : 60);

      // Modal-aware mapping of affected items to match the disruption benchmark accurately
  const trains = items.filter((i) => i.type === "TRAIN");
  const flights = items.filter((i) => i.type === "FLIGHT");
  const buses = items.filter((i) => i.type === "BUS");
  const transfers = items.filter((i) => i.type === "TRANSFER");
  const hotels = items.filter((i) => i.type === "HOTEL");
  const activities = items.filter((i) => i.type === "ACTIVITY" || i.type === "EVENT");
  const allTransit = [...trains, ...flights, ...buses, ...transfers];

  let affectedItemIds: string[] = [];
  let itemToAdapt: { id: string; type: string; provider: string; title: string } | null = null;

  if (scenarioType.includes("TRAIN")) {
    if (trains.length > 0) {
      affectedItemIds = [trains[0].id];
    } else if (allTransit.length > 0) {
      const target = allTransit[0];
      affectedItemIds = [target.id];
      itemToAdapt = {
        id: target.id,
        type: "TRAIN",
        provider: "Indian Railways / IRCTC",
        title: `IRCTC Vande Bharat Express (${target.departureLocation} -> ${target.arrivalLocation})`,
      };
    }
  } else if (scenarioType.includes("FLIGHT")) {
    if (flights.length > 0) {
      affectedItemIds = [flights[0].id];
    } else if (allTransit.length > 0) {
      const target = allTransit[0];
      affectedItemIds = [target.id];
      itemToAdapt = {
        id: target.id,
        type: "FLIGHT",
        provider: "IndiGo Airlines",
        title: `IndiGo Flight (${target.departureLocation} -> ${target.arrivalLocation})`,
      };
    }
  } else if (scenarioType.includes("BUS")) {
    if (buses.length > 0) {
      affectedItemIds = [buses[0].id];
    } else if (transfers.length > 0) {
      const target = transfers[0];
      affectedItemIds = [target.id];
      itemToAdapt = {
        id: target.id,
        type: "BUS",
        provider: "KSRTC / Volvo AC Sleeper",
        title: `Volvo Multi-Axle AC Sleeper (${target.departureLocation} -> ${target.arrivalLocation})`,
      };
    } else if (allTransit.length > 0) {
      const target = allTransit[0];
      affectedItemIds = [target.id];
      itemToAdapt = {
        id: target.id,
        type: "BUS",
        provider: "KSRTC / Volvo AC Sleeper",
        title: `Volvo Multi-Axle AC Sleeper (${target.departureLocation} -> ${target.arrivalLocation})`,
      };
    }
  } else if (scenarioType === "MISSED_CONNECTION") {
    if (transfers.length > 0) {
      affectedItemIds = [transfers[0].id];
    } else if (allTransit.length > 1) {
      affectedItemIds = [allTransit[1].id];
    } else if (allTransit.length > 0) {
      affectedItemIds = [allTransit[0].id];
    }
  } else if (scenarioType.includes("HOTEL")) {
    if (hotels.length > 0) {
      affectedItemIds = [hotels[0].id];
    }
  } else if (scenarioType.includes("ACTIVITY") || scenarioType.includes("EVENT")) {
    if (activities.length > 0) {
      affectedItemIds = [activities[0].id];
    }
  } else if (scenarioType === "TRANSFER_FAILED" || scenarioType.includes("TRANSFER")) {
    if (transfers.length > 0) {
      affectedItemIds = [transfers[0].id];
    } else if (buses.length > 0) {
      affectedItemIds = [buses[0].id];
    }
  }

  if (affectedItemIds.length === 0 && items.length > 0) {
    affectedItemIds = [items[0].id];
  }

  if (itemToAdapt) {
    const idx = items.findIndex((it) => it.id === itemToAdapt!.id);
    if (idx !== -1) {
      items[idx].type = itemToAdapt.type as any;
      items[idx].provider = itemToAdapt.provider;
      items[idx].title = itemToAdapt.title;
      if (items[idx].metadata) {
        items[idx].metadata = {
          ...items[idx].metadata,
          title: itemToAdapt.title,
        };
      }
    }
  }

  const disruptionEvent: DisruptionEvent = {
    id: `disrupt-${Date.now()}`,
    tripId,
    scenarioId: (scenarioId as any) || 1,
    type: scenarioType as any,
    title: benchmark
      ? `Scenario ${benchmark.numericId}: ${benchmark.disruptionType.replace(/_/g, " ")}`
      : legacyDemo?.title || "Trip Disruption Alert",
    description: benchmark
      ? `${benchmark.typicalCause}. Downstream impact: ${benchmark.downstreamImpact}`
      : legacyDemo?.description || "Critical itinerary delay detected.",
    affectedItemIds,
    delayMinutes,
    reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const impact = engine.analyzeImpact(items, disruptionEvent);
  const rawPlans = await engine.generateRecoveryPlans(items, disruptionEvent, impact);
  const plans = rawPlans.map((p) => ({
    ...p,
    id: p.id.startsWith(tripId) ? p.id : `${tripId}-${p.id}`,
  }));

  await prisma.$transaction(async (tx) => {
    // 0. Update adapted item if needed
    if (itemToAdapt) {
      const origItem = dbTrip!.items.find((it) => it.id === itemToAdapt!.id);
      const meta = (origItem?.metadata as Record<string, any>) || {};
      await tx.itineraryItem.update({
        where: { id: itemToAdapt.id },
        data: {
          type: itemToAdapt.type,
          provider: itemToAdapt.provider,
          metadata: {
            ...meta,
            title: itemToAdapt.title,
          },
        },
      });
    }

    // 1. Resolve previously active disruptions
    await tx.disruption.updateMany({
      where: { tripId, status: "ACTIVE" },
      data: { status: "RESOLVED" },
    });

    // 2. Create active disruption record
    await tx.disruption.create({
      data: {
        id: disruptionEvent.id,
        tripId,
        itemId: affectedItemIds[0] || "unknown",
        type: disruptionEvent.type,
        severity: "CRITICAL",
        source: `BENCHMARK_${scenarioId}`,
        delayMinutes,
        description: disruptionEvent.description,
        impactedItemIds: impact.downstreamImpact,
        status: "ACTIVE",
      },
    });

    await tx.recoveryPlan.deleteMany({
      where: { tripId },
    });

      for (const plan of plans) {
        await tx.recoveryPlan.create({
          data: {
            id: plan.id,
            tripId,
            disruptionId: disruptionEvent.id,
            tier: plan.planType,
            title: plan.label,
            description: plan.tradeOffSummary || plan.explanation,
            costDelta: plan.netAdditionalCost,
            timeDeltaMinutes: plan.bufferMinutes,
            riskScore: plan.bufferRisk === "HIGH" ? 0.8 : plan.bufferRisk === "MEDIUM" ? 0.4 : 0.1,
            convenienceScore: 0.9,
            tripPreservation: 0.95,
            explanation: plan.explanation,
            actions: plan.actions as any,
            status: "PROPOSED",
          },
        });
      }

      const directSet = new Set(impact.directImpact);
      const downstreamSet = new Set(impact.downstreamImpact);

      // 6. Generate Notification for User
    await tx.notification.create({
      data: {
        userId: dbTrip!.userId,
        tripId,
        type: "DISRUPTION_ALERT",
        title: `Disruption Alert: ${disruptionEvent.title}`,
        message: `${disruptionEvent.description} ReMode generated ${plans.length} recovery plan(s).`,
        metadata: {
          disruptionType: disruptionEvent.type,
          delayMinutes,
          plansCount: plans.length,
        },
      },
    });
  });

  const updatedTrip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      items: true,
      disruptions: true,
      user: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

      result = {
        trip: mapPrismaTripToSnapshot(updatedTrip!),
        disruption: disruptionEvent,
        impact,
        plans,
      };
    } catch (err) {
      console.warn("Falling back to TripStore for injectDisruption:", err);
      result = await TripStore.getInstance().injectDisruption(tripId, scenarioId);
    }
  }

  // Trigger real WhatsApp disruption alert
  try {
    const recipientPhone =
      userPhone ||
      (result.trip as any).traveler?.phone ||
      (result.trip as any).userPhone ||
      "8879808016";
    if (result.trip) {
      if (!result.trip.traveler) {
        result.trip.traveler = { name: "Traveler", priorityPreference: "SPEED" };
      }
      result.trip.traveler.phone = recipientPhone;
      (result.trip as any).userPhone = recipientPhone;
    }
    const disruptionMsg =
      `🚨 ReMode Disruption Alert!\n` +
      `Trip: ${result.trip.title}\n` +
      `Incident: ${result.disruption.title}\n` +
      `Details: ${result.disruption.description}\n` +
      `Impact: ${result.impact.directImpact?.length || 1} leg(s) affected, ${result.impact.downstreamImpact?.length || 0} downstream connection(s) at risk.\n` +
      `Recovery: ${result.plans.length} alternative recovery plan(s) generated. Tap your dashboard to review and confirm rebooking.`;

    sendTravelAlert({
      phoneNumber: recipientPhone,
      message: disruptionMsg,
      channel: "whatsapp",
    }).catch((notifyErr) => {
      console.error("[tripService] Failed to dispatch WhatsApp disruption alert:", notifyErr);
    });
  } catch (notifyErr) {
    console.error("[tripService] Failed to queue WhatsApp disruption alert:", notifyErr);
  }

  return result;
}

export interface CustomDisruptionPayload {
  bookingId?: string;
  type: string;
  source?: string;
  delayMinutes?: number;
  description?: string;
}

/**
 * Injects a live carrier disruption alert from external polling services (e.g. AeroDataBox)
 */
export async function injectCustomDisruption(
  tripId: string,
  payload: CustomDisruptionPayload,
  userPhone?: string
): Promise<{
  trip: TripSnapshot;
  disruption: DisruptionEvent;
  impact: ImpactAnalysis;
  plans: RecoveryPlan[];
}> {
  let result: {
    trip: TripSnapshot;
    disruption: DisruptionEvent;
    impact: ImpactAnalysis;
    plans: RecoveryPlan[];
  };

  invalidateTripCache(tripId);

  if (!(await canUseDatabase())) {
    const scenarioId = payload.type?.includes("CANCEL") ? 1 : 2;
    result = await TripStore.getInstance().injectDisruption(tripId, scenarioId);
  } else {
    try {
      let dbTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { items: true, disruptions: true, user: true, history: true },
    });

  if (!dbTrip) {
    await ensureDefaultTrips();
    dbTrip = await prisma.trip.findFirst({
      include: { items: true, disruptions: true, user: true, history: true },
    });
    if (!dbTrip) throw new Error("No trip found in database");
    tripId = dbTrip.id;
  }

  const items = dbTrip.items.map(mapPrismaItemToItineraryItem);

  let affectedItemIds: string[] = [];
  if (payload.bookingId) {
    const matched = items.find((i) => i.id === payload.bookingId);
    if (matched) {
      affectedItemIds = [matched.id];
    }
  }

  if (affectedItemIds.length === 0) {
    const flight = items.find((i) => i.type === "FLIGHT");
    if (flight) affectedItemIds = [flight.id];
    else if (items.length > 0) affectedItemIds = [items[0].id];
  }

  const isCancel = payload.type === "CANCELLATION" || payload.type?.includes("CANCEL");
  const delayMinutes = isCancel ? 0 : Math.max(Number(payload.delayMinutes || 60), 0);
  const disruptionType = isCancel ? "FLIGHT_CANCELLATION" : "FLIGHT_DELAY";

  const disruptionEvent: DisruptionEvent = {
    id: `disrupt-${Date.now()}`,
    tripId,
    scenarioId: 1,
    type: disruptionType as any,
    title: isCancel ? "Flight Cancellation Alert" : `Flight Delay Alert (+${delayMinutes}m)`,
    description:
      payload.description ||
      (isCancel
        ? "Carrier reported flight cancellation"
        : `Carrier reported delay of ${delayMinutes} minutes`),
    affectedItemIds,
    delayMinutes,
    reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const impact = engine.analyzeImpact(items, disruptionEvent);
  const rawPlans = await engine.generateRecoveryPlans(items, disruptionEvent, impact);
  const plans = rawPlans.map((p) => ({
    ...p,
    id: p.id.startsWith(tripId) ? p.id : `${tripId}-${p.id}`,
  }));

  await prisma.$transaction(async (tx) => {
    // 1. Resolve previously active disruptions
    await tx.disruption.updateMany({
      where: { tripId, status: "ACTIVE" },
      data: { status: "RESOLVED" },
    });

    // 2. Create active disruption record
    await tx.disruption.create({
      data: {
        id: disruptionEvent.id,
        tripId,
        itemId: affectedItemIds[0] || "unknown",
        type: disruptionEvent.type,
        severity: "CRITICAL",
        source: payload.source || "CARRIER_ALERT",
        delayMinutes,
        description: disruptionEvent.description,
        impactedItemIds: impact.downstreamImpact,
        status: "ACTIVE",
      },
    });

    // 3. Clear old recovery plans & insert new ones
    await tx.recoveryPlan.deleteMany({
      where: { tripId },
    });

    for (const plan of plans) {
      await tx.recoveryPlan.create({
        data: {
          id: plan.id,
          tripId,
          disruptionId: disruptionEvent.id,
          tier: plan.planType,
          title: plan.label,
          description: plan.tradeOffSummary || plan.explanation,
          costDelta: plan.netAdditionalCost,
          timeDeltaMinutes: plan.bufferMinutes,
          riskScore: plan.bufferRisk === "HIGH" ? 0.8 : plan.bufferRisk === "MEDIUM" ? 0.4 : 0.1,
          convenienceScore: 0.9,
          tripPreservation: 0.95,
          explanation: plan.explanation,
          actions: {
            list: plan.actions,
            liveRecommendation: plan.liveRecommendation,
          } as any,
          status: "PROPOSED",
        },
      });
    }

    // 4. Update status of items
    const directSet = new Set(impact.directImpact);
    const downstreamSet = new Set(impact.downstreamImpact);

    for (const item of dbTrip!.items) {
      if (directSet.has(item.id)) {
        await tx.itineraryItem.update({
          where: { id: item.id },
          data: {
            status: isCancel ? "CANCELLED" : "AFFECTED",
          },
        });
      } else if (downstreamSet.has(item.id)) {
        await tx.itineraryItem.update({
          where: { id: item.id },
          data: { status: "AT_RISK" },
        });
      } else {
        await tx.itineraryItem.update({
          where: { id: item.id },
          data: { status: "CONFIRMED" },
        });
      }
    }

    // 5. Store snapshot in TripHistory
    await tx.tripHistory.create({
      data: {
        tripId,
        action: "LIVE_CARRIER_DISRUPTION_DETECTED",
        details: disruptionEvent.description,
        items: items as any,
      },
    });

    // 6. Generate Notification
    if (dbTrip!.user?.id) {
      await tx.notification.create({
        data: {
          userId: dbTrip!.user.id,
          tripId,
          type: "DISRUPTION_ALERT",
          title: `⚠️ Live Disruption: ${disruptionEvent.title}`,
          message: `${disruptionEvent.description}. ReMode generated ${plans.length} recovery plan options.`,
          read: false,
          metadata: {
            disruptionId: disruptionEvent.id,
            delayMinutes,
            proposedPlansCount: plans.length,
          },
        },
      });
    }
  });

  const updatedTrip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      items: true,
      disruptions: true,
      user: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

      result = {
        trip: mapPrismaTripToSnapshot(updatedTrip!),
        disruption: disruptionEvent,
        impact,
        plans,
      };
    } catch (err) {
      console.warn("Falling back to TripStore for injectCustomDisruption:", err);
      const scenarioId = payload.type?.includes("CANCEL") ? 1 : 2;
      result = await TripStore.getInstance().injectDisruption(tripId, scenarioId);
    }
  }

  // Trigger real WhatsApp disruption alert
  try {
    const recipientPhone =
      userPhone ||
      (result.trip as any).traveler?.phone ||
      (result.trip as any).userPhone ||
      "8879808016";
    if (result.trip) {
      if (!result.trip.traveler) {
        result.trip.traveler = { name: "Traveler", priorityPreference: "SPEED" };
      }
      result.trip.traveler.phone = recipientPhone;
      (result.trip as any).userPhone = recipientPhone;
    }
    const disruptionMsg =
      `🚨 ReMode Disruption Alert!\n` +
      `Trip: ${result.trip.title}\n` +
      `Incident: ${result.disruption.title}\n` +
      `Details: ${result.disruption.description}\n` +
      `Impact: ${result.impact.directImpact?.length || 1} leg(s) affected, ${result.impact.downstreamImpact?.length || 0} downstream connection(s) at risk.\n` +
      `Recovery: ${result.plans.length} alternative recovery plan(s) generated. Tap your dashboard to review and confirm rebooking.`;

    sendTravelAlert({
      phoneNumber: recipientPhone,
      message: disruptionMsg,
      channel: "whatsapp",
    }).catch((notifyErr) => {
      console.error("[tripService] Failed to dispatch WhatsApp disruption alert:", notifyErr);
    });
  } catch (notifyErr) {
    console.error("[tripService] Failed to queue WhatsApp disruption alert:", notifyErr);
  }

  return result;
}

/**
 * Apply Recovery Plan: Atomic update via Prisma $transaction with history & notification
 */
export async function applyRecoveryPlan(
  tripId: string,
  planId: string,
  planData?: RecoveryPlan,
  userPhone?: string
): Promise<{ trip: TripSnapshot; appliedPlan: RecoveryPlan }> {
  let result: { trip: TripSnapshot; appliedPlan: RecoveryPlan };
  invalidateTripCache(tripId);

  if (!(await canUseDatabase())) {
    const storeResult = TripStore.getInstance().applyRecoveryPlan(tripId, planId, planData);
    result = {
      trip: storeResult.trip,
      appliedPlan: storeResult.appliedPlan || planData || ({} as RecoveryPlan),
    };
  } else {
    try {
      result = await prisma.$transaction(async (tx) => {
        // 1. Resolve active disruption
        await tx.disruption.updateMany({
          where: { tripId, status: "ACTIVE" },
          data: { status: "RESOLVED" },
        });

        // 2. Mark recovery plan as APPLIED
        await tx.recoveryPlan.updateMany({
          where: {
            tripId,
            OR: [{ id: planId }, { id: `${tripId}-${planId}` }],
          },
          data: { status: "APPLIED", appliedAt: new Date() },
        });

        // 3. Update trip status to RECOVERED
        await tx.trip.update({
          where: { id: tripId },
          data: { status: "RECOVERED" },
        });

        // 4. Atomically apply actions to itinerary items
        if (planData?.actions && planData.actions.length > 0) {
          for (const action of planData.actions) {
            if (action.actionType === "CANCEL") {
              await tx.itineraryItem.updateMany({
                where: { id: action.targetItemId },
                data: { status: "CANCELLED" },
              });
            } else if (action.actionType === "REBOOK" || action.actionType === "REPLACE") {
              await tx.itineraryItem.updateMany({
                where: { id: action.targetItemId },
                data: {
                  status: "CONFIRMED",
                  provider: action.newProvider || undefined,
                  cost: action.newCost !== undefined ? action.newCost : undefined,
                },
              });
            } else if (action.actionType === "RESCHEDULE") {
              await tx.itineraryItem.updateMany({
                where: { id: action.targetItemId },
                data: {
                  status: "CONFIRMED",
                },
              });
            }
          }
        }

        // 5. Restore remaining AT_RISK or AFFECTED items to CONFIRMED
        await tx.itineraryItem.updateMany({
          where: { tripId, status: { in: ["AFFECTED", "AT_RISK"] } },
          data: { status: "CONFIRMED" },
        });

        // 6. Return fresh updated snapshot
        const fresh = await tx.trip.findUnique({
          where: { id: tripId },
          include: {
            items: true,
            disruptions: true,
            user: true,
            history: { orderBy: { createdAt: "desc" } },
          },
        });

        // 7. Save to TripHistory
        await tx.tripHistory.create({
          data: {
            tripId,
            action: "PLAN_APPLIED",
            details: `Applied recovery plan: ${planData?.label || planId}`,
            items: fresh!.items.map(mapPrismaItemToItineraryItem) as any,
          },
        });

        // 8. Create user notification
        await tx.notification.create({
          data: {
            userId: fresh!.userId,
            tripId,
            type: "REBOOKING_CONFIRMED",
            title: "Itinerary Rebooked Successfully",
            message: `Recovery plan "${planData?.label || planId}" has been confirmed and applied to your itinerary.`,
            metadata: {
              planId,
              netCost: planData?.netAdditionalCost,
            },
          },
        });

        return {
          trip: mapPrismaTripToSnapshot(fresh!),
          appliedPlan: planData || ({} as RecoveryPlan),
        };
      });
    } catch (err) {
      console.warn("Falling back to TripStore for applyRecoveryPlan:", err);
      const storeResult = TripStore.getInstance().applyRecoveryPlan(tripId, planId, planData);
      result = {
        trip: storeResult.trip,
        appliedPlan: storeResult.appliedPlan || planData || ({} as RecoveryPlan),
      };
    }
  }

  // Trigger real WhatsApp recovery alert
  try {
    const recipientPhone =
      userPhone ||
      (result.trip as any).traveler?.phone ||
      (result.trip as any).userPhone ||
      "8879808016";
    const planLabel = result.appliedPlan?.label || planId;
    const netCost = result.appliedPlan?.netAdditionalCost ?? 0;
    const recoveryMsg =
      `✅ ReMode Recovery Plan Applied!\n` +
      `Trip: ${result.trip.title}\n` +
      `Applied Plan: ${planLabel}\n` +
      `Net Cost Delta: ${netCost !== 0 ? `₹${netCost}` : "₹0 (Fully Covered / Refund Claimed)"}\n` +
      `Status: Rebooking applied. All alternative segments confirmed and locked in!`;

    sendTravelAlert({
      phoneNumber: recipientPhone,
      message: recoveryMsg,
      channel: "whatsapp",
    }).catch((notifyErr) => {
      console.error("[tripService] Failed to dispatch WhatsApp recovery alert:", notifyErr);
    });
  } catch (notifyErr) {
    console.error("[tripService] Failed to queue WhatsApp recovery alert:", notifyErr);
  }

  return result;
}

/**
 * Fetch Recovery Data (Impact + Plans)
 */
export async function getRecoveryData(tripId: string): Promise<{
  impact: ImpactAnalysis | null;
  plans: RecoveryPlan[];
}> {
  if (!(await canUseDatabase())) {
    return TripStore.getInstance().getRecoveryData(tripId);
  }

  try {
    const dbTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { items: true, disruptions: true, recoveryPlans: true },
    });

    if (!dbTrip) return TripStore.getInstance().getRecoveryData(tripId);

    const activeDisruption = dbTrip.disruptions.find((d) => d.status === "ACTIVE");
    if (!activeDisruption) return { impact: null, plans: [] };

    const items = dbTrip.items.map(mapPrismaItemToItineraryItem);
    const disruptionEvent = mapPrismaDisruptionToEvent(activeDisruption);

    const impact = engine.analyzeImpact(items, disruptionEvent);
    const plans =
      dbTrip.recoveryPlans.length > 0
        ? dbTrip.recoveryPlans.map(mapPrismaPlanToRecoveryPlan)
        : await engine.generateRecoveryPlans(items, disruptionEvent, impact);

    return { impact, plans };
  } catch (err) {
    console.warn("getRecoveryData in Prisma failed, falling back to TripStore:", err);
    return TripStore.getInstance().getRecoveryData(tripId);
  }
}

/**
 * Get Proactive Risk Alerts
 */
export async function getProactiveRiskAlerts(tripId: string): Promise<RiskAlert[]> {
  if (!(await canUseDatabase())) {
    return TripStore.getInstance().getProactiveRiskAlerts(tripId);
  }
  try {
    const trip = await getTripById(tripId);
    if (!trip) return [];

    const alerts: RiskAlert[] = [];
    for (const item of trip.items) {
      if (item.bufferMinutes < 30) {
        alerts.push({
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
        });
      }
    }

    return alerts;
  } catch (err) {
    console.warn("Falling back to TripStore for getProactiveRiskAlerts:", err);
    return TripStore.getInstance().getProactiveRiskAlerts(tripId);
  }
}

/**
 * Get Trip History timeline from PostgreSQL or memory
 */
export async function getTripHistoryTimeline(tripId: string) {
  const mapHistory = (h: any, idx: number) => ({
    id: h.id || `hist-${idx}`,
    tripId,
    action: h.action,
    details: h.details || h.action,
    items: h.items,
    createdAt: new Date(h.timestamp || Date.now()),
  });

  if (!(await canUseDatabase())) {
    return (TripStore.getInstance().getTrip(tripId)?.history || []).map(mapHistory);
  }

  try {
    return await prisma.tripHistory.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Falling back to TripStore for getTripHistoryTimeline:", err);
    return (TripStore.getInstance().getTrip(tripId)?.history || []).map(mapHistory);
  }
}

/**
 * Get User Profile with Preferences & Loyalty
 */
export async function getUserProfile(email: string = "manas.kadam@example.com") {
  const getFallbackProfile = () => {
    const allTrips = TripStore.getInstance().getAllTrips();
    return {
      ...DEFAULT_FALLBACK_USER,
      email,
      trips: allTrips.map((t) => ({
        id: t.id,
        title: t.title,
        source: t.source,
        destination: t.destination,
        startDate: t.startDate,
        status: t.activeDisruption ? "DISRUPTED" : "ACTIVE",
      })),
      notifications: [
        {
          id: "notif-1",
          type: "TRIP_MONITORING_ACTIVE",
          title: "ReMode Guard Active",
          message: "All trip corridors monitored with real-time disruption engine.",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  };

  if (!(await canUseDatabase())) {
    return getFallbackProfile();
  }

  try {
    await ensureDefaultTrips();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        trips: {
          select: {
            id: true,
            title: true,
            source: true,
            destination: true,
            startDate: true,
            status: true,
          },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return user || getFallbackProfile();
  } catch (err) {
    console.warn("Falling back for getUserProfile:", err);
    return getFallbackProfile();
  }
}

/**
 * Update User Profile & Preferences
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    homeAirport?: string;
    currency?: string;
    avoidNightTravel?: boolean;
    carrierLoyalty?: string[];
    priorityWeights?: any;
    loyaltyPrograms?: any;
  }
) {
  if (!(await canUseDatabase())) {
    return { ...DEFAULT_FALLBACK_USER, ...data, id: userId };
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch (err) {
    console.warn("Falling back for updateUserProfile:", err);
    return { ...DEFAULT_FALLBACK_USER, ...data, id: userId };
  }
}

/**
 * Get User Notifications
 */
export async function getUserNotifications(userId?: string) {
  const fallbackNotifs = [
    {
      id: "notif-1",
      userId: userId || "user-demo-manas",
      type: "TRIP_MONITORING_ACTIVE",
      title: "ReMode Guard Active",
      message: "All trip corridors monitored with real-time disruption engine.",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  if (!(await canUseDatabase())) {
    return fallbackNotifs;
  }

  try {
    await ensureDefaultTrips();
    if (userId) {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (err) {
    console.warn("Falling back for getUserNotifications:", err);
    return fallbackNotifs;
  }
}

/**
 * Reset Trip in PostgreSQL or memory
 */
export async function resetTrip(tripId: string): Promise<TripSnapshot | null> {
  invalidateTripCache(tripId);
  if (!(await canUseDatabase())) {
    return TripStore.getInstance().resetTrip(tripId);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.disruption.deleteMany({ where: { tripId } });
      await tx.recoveryPlan.deleteMany({ where: { tripId } });
      await tx.itineraryItem.updateMany({
        where: { tripId },
        data: { status: "CONFIRMED" },
      });
      await tx.trip.updateMany({
        where: { id: tripId },
        data: { status: "ACTIVE" },
      });

      const resetItems = await tx.itineraryItem.findMany({ where: { tripId } });

      await tx.tripHistory.create({
        data: {
          tripId,
          action: "TRIP_RESET",
          details: "Trip reset to original confirmed state.",
          items: resetItems.map(mapPrismaItemToItineraryItem) as any,
        },
      });
    });

    return getTripById(tripId);
  } catch (err) {
    console.warn("resetTrip error in Prisma, falling back to TripStore:", err);
    return TripStore.getInstance().resetTrip(tripId);
  }
}
