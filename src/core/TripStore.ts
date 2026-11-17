import type {
  TripSnapshot,
  DisruptionEvent,
  ImpactAnalysis,
  RecoveryPlan,
  RiskAlert,
  ItineraryItem,
  ItemType,
} from "../types/index.ts";
import { INITIAL_TRIP_SNAPSHOT, DEMO_SCENARIOS, INITIAL_TRIP_ITEMS } from "./demoData.ts";
import { HIMACHAL_TRIP_SNAPSHOT } from "./dataset/himachalTourData.ts";
import { BENCHMARK_SCENARIOS } from "./dataset/disruptionBenchmarks.ts";
import { RecoveryEngine } from "./RecoveryEngine.ts";
import { TripGraph } from "./TripGraph.ts";

export class TripStore {
  private static instance: TripStore;
  private trips: Map<string, TripSnapshot> = new Map();
  private baseItems: Map<string, ItineraryItem[]> = new Map();
  private engine = new RecoveryEngine();

  private constructor() {
    this.trips.set(
      INITIAL_TRIP_SNAPSHOT.id,
      JSON.parse(JSON.stringify(INITIAL_TRIP_SNAPSHOT))
    );
    this.baseItems.set(
      INITIAL_TRIP_SNAPSHOT.id,
      JSON.parse(JSON.stringify(INITIAL_TRIP_ITEMS))
    );
    this.trips.set(
      HIMACHAL_TRIP_SNAPSHOT.id,
      JSON.parse(JSON.stringify(HIMACHAL_TRIP_SNAPSHOT))
    );
    this.baseItems.set(
      HIMACHAL_TRIP_SNAPSHOT.id,
      JSON.parse(JSON.stringify(HIMACHAL_TRIP_SNAPSHOT.items))
    );
  }

  public static getInstance(): TripStore {
    const globalRef = globalThis as unknown as { __tripStore?: TripStore };
    if (!globalRef.__tripStore) {
      globalRef.__tripStore = new TripStore();
    }
    const currentHimachal = globalRef.__tripStore.trips.get(HIMACHAL_TRIP_SNAPSHOT.id);
    if (!currentHimachal || currentHimachal.items.length !== HIMACHAL_TRIP_SNAPSHOT.items.length) {
      globalRef.__tripStore.trips.set(
        HIMACHAL_TRIP_SNAPSHOT.id,
        JSON.parse(JSON.stringify(HIMACHAL_TRIP_SNAPSHOT))
      );
    }
    return globalRef.__tripStore;
  }

  public getAllTrips(): TripSnapshot[] {
    return Array.from(this.trips.values());
  }

  public createTrip(params: {
    id: string;
    title: string;
    source?: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    traveler?: {
      name?: string;
      phone?: string;
      priorityPreference?: any;
    };
    userPhone?: string;
    items?: ItineraryItem[];
  }): TripSnapshot {
    const travelerPhone = params.traveler?.phone || params.userPhone;
    const initialItems = params.items && params.items.length > 0 ? params.items : INITIAL_TRIP_ITEMS;
    this.baseItems.set(params.id, JSON.parse(JSON.stringify(initialItems)));
    const newTrip: TripSnapshot = {
      id: params.id,
      title: params.title,
      source: params.source || "New York (JFK)",
      destination: params.destination,
      startDate: params.startDate || "2026-10-12",
      endDate: params.endDate || "2026-10-14",
      traveler: {
        name: params.traveler?.name || "Traveler",
        phone: travelerPhone || undefined,
        priorityPreference: params.traveler?.priorityPreference || "SPEED",
      },
      items: JSON.parse(JSON.stringify(initialItems)),
      activeDisruption: null,
      history: [],
    };
    (newTrip as any).userPhone = travelerPhone;
    this.trips.set(params.id, newTrip);
    return newTrip;
  }

  public getTrip(id: string): TripSnapshot | undefined {
    const trip = this.trips.get(id);
    if (!trip) return undefined;

    // Self-healing / synchronization pass:
    // If any item was marked RECOVERED with a plan note, ensure its title, type, and provider match the recovery plan!
    trip.items = trip.items.map((item) => {
      if (item.status === "RECOVERED") {
        const notesLower = (item.notes || "").toLowerCase();
        if (notesLower.includes("direct-flight") || notesLower.includes("flight")) {
          if (item.type !== "FLIGHT" || item.title.toLowerCase().includes("train") || item.title.toLowerCase().includes("vande")) {
            const cleanSrc = trip.source || item.departureLocation || "Origin";
            const cleanDst = trip.destination || item.arrivalLocation || "Destination";
            return {
              ...item,
              type: "FLIGHT",
              title: "Direct Domestic Flight (IndiGo / Air India Express)",
              provider: "IndiGo Airlines / Air India Direct",
              referenceNumber: `6E-${Math.floor(1000 + Math.random() * 9000)} (PNR: REC-${Math.floor(100000 + Math.random() * 900000)})`,
              departureLocation: `${cleanSrc} Airport Terminal 1`,
              arrivalLocation: `${cleanDst} Airport Terminal 2`,
              location: `${cleanDst} Airport Arrivals Gate`,
              cost: 5200,
              startTime: "12:15",
              endTime: "13:30",
              notes: "✓ Confirmed Replacement: Direct Domestic Flight rebooked & secured. Disrupted booking 100% refund credited.",
            };
          }
        } else if (notesLower.includes("highway-cab") || notesLower.includes("express-cab")) {
          if (item.type !== "TRANSFER") {
            const cleanSrc = trip.source || item.departureLocation || "Origin";
            const cleanDst = trip.destination || item.arrivalLocation || "Destination";
            return {
              ...item,
              type: "TRANSFER",
              title: "Dedicated Highway Innova Crysta Chauffeur Cab",
              provider: "Intercity Highway Chauffeur Fleet",
              referenceNumber: `CAB-REC-${Math.floor(10000 + Math.random() * 90000)}`,
              departureLocation: `${cleanSrc} Expressway Hub`,
              arrivalLocation: `${cleanDst} Hotel Drop-off`,
              location: `Direct Hotel Drop-off (${cleanDst})`,
              cost: 5800,
              startTime: "09:30",
              endTime: "14:45",
              notes: "✓ Confirmed Replacement: Dedicated Highway Innova Crysta Cab rebooked & secured.",
            };
          }
        } else if (notesLower.includes("volvo") || notesLower.includes("bus")) {
          if (item.type !== "BUS") {
            const cleanSrc = trip.source || item.departureLocation || "Origin";
            const cleanDst = trip.destination || item.arrivalLocation || "Destination";
            return {
              ...item,
              type: "BUS",
              title: "Premium Volvo Multi-Axle AC Sleeper Coach",
              provider: "KSRTC / Super Luxury Volvo Fleet",
              referenceNumber: `VOLVO-REC-${Math.floor(10000 + Math.random() * 90000)}`,
              departureLocation: `${cleanSrc} Intercity Bus Terminal`,
              arrivalLocation: `${cleanDst} Central Bus Station`,
              location: `${cleanDst} Bus Bay 4`,
              cost: 1150,
              startTime: "08:30",
              endTime: "15:15",
              notes: "✓ Confirmed Replacement: Premium Volvo AC Sleeper Coach rebooked & secured.",
            };
          }
        }
      }
      return item;
    });

    return trip;
  }

  public resetTrip(id: string): TripSnapshot {
    const base =
      this.baseItems.get(id) ||
      (id === HIMACHAL_TRIP_SNAPSHOT.id ? HIMACHAL_TRIP_SNAPSHOT.items : INITIAL_TRIP_ITEMS);

    const existing = this.trips.get(id);
    if (existing) {
      const resetTrip: TripSnapshot = {
        ...existing,
        activeDisruption: null,
        history: [],
        traveler: existing.traveler || {
          name: "Dr. Aarav Sharma",
          priorityPreference: "SPEED",
        },
        items: JSON.parse(JSON.stringify(base)).map((it: ItineraryItem) => ({
          ...it,
          status: "NORMAL",
        })),
      };
      this.trips.set(id, resetTrip);
      return resetTrip;
    }

    const fresh: TripSnapshot = JSON.parse(
      JSON.stringify({
        ...INITIAL_TRIP_SNAPSHOT,
        id,
        items: JSON.parse(JSON.stringify(base)),
        activeDisruption: null,
        history: [],
      })
    );
    this.trips.set(id, fresh);
    return fresh;
  }

  public async injectDisruption(tripId: string, scenarioId: number): Promise<{
    trip: TripSnapshot;
    disruption: DisruptionEvent;
    impact: ImpactAnalysis;
    plans: RecoveryPlan[];
  }> {
    // Cleanly reset items back to baseline before applying this scenario disruption
    const base =
      this.baseItems.get(tripId) ||
      (tripId === HIMACHAL_TRIP_SNAPSHOT.id ? HIMACHAL_TRIP_SNAPSHOT.items : INITIAL_TRIP_ITEMS);
    const existing = this.trips.get(tripId) || this.resetTrip(tripId);

    const trip: TripSnapshot = {
      ...existing,
      activeDisruption: null,
      items: JSON.parse(JSON.stringify(base)).map((it: ItineraryItem) => ({
        ...it,
        status: "NORMAL",
      })),
    };

    // Prioritize 12 Canonical Indian Disruption Benchmarks (DS_001 to DS_012)
    const benchmark = BENCHMARK_SCENARIOS.find((b) => b.numericId === scenarioId);
    let scenario: DisruptionEvent;

    if (benchmark) {
      scenario = {
        id: `sc-${benchmark.numericId}`,
        tripId,
        scenarioId: benchmark.numericId as any,
        type: benchmark.disruptionType as any,
        title: `Scenario ${benchmark.numericId} (${benchmark.scenarioId}): ${benchmark.disruptionType.replace(/_/g, " ")}`,
        description: `${benchmark.typicalCause}. Downstream impact: ${benchmark.downstreamImpact}`,
        affectedItemIds: [],
        delayMinutes: benchmark.typicalDelayMin || (benchmark.disruptionType.includes("CANCEL") ? 0 : 60),
        reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } else {
      const legacyDemo = DEMO_SCENARIOS.find((s) => s.scenarioId === scenarioId);
      if (!legacyDemo) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }
      scenario = { ...legacyDemo, tripId };
    }

    // Modal-aware mapping of affected items to match the disruption type exactly
    let affectedItemIds: string[] = [];
    const trains = trip.items.filter((i) => i.type === "TRAIN");
    const flights = trip.items.filter((i) => i.type === "FLIGHT");
    const buses = trip.items.filter((i) => i.type === "BUS");
    const transfers = trip.items.filter((i) => i.type === "TRANSFER" || i.type === "TAXI");
    const hotels = trip.items.filter((i) => i.type === "HOTEL");
    const activities = trip.items.filter((i) => i.type === "ACTIVITY" || i.type === "EVENT");
    const allTransit = [...trains, ...flights, ...buses, ...transfers];

    switch (scenario.type) {
      case "TRAIN_CANCELLED":
      case "TRAIN_DELAY": {
        if (trains.length > 0) {
          affectedItemIds = [trains[0].id];
        } else if (allTransit.length > 0) {
          // Adapt primary transit to train for simulation realism
          allTransit[0].type = "TRAIN";
          allTransit[0].provider = "Indian Railways / IRCTC";
          allTransit[0].title = `IRCTC Vande Bharat Express (${allTransit[0].departureLocation} -> ${allTransit[0].arrivalLocation})`;
          affectedItemIds = [allTransit[0].id];
        } else {
          // Synthesize inbound train leg
          const newTrain: ItineraryItem = {
            id: `leg-trn-${Date.now()}`,
            tripId,
            type: "TRAIN",
            title: `Vande Bharat / Shatabdi Express (${trip.destination} Inbound)`,
            provider: "Indian Railways / IRCTC",
            referenceNumber: "IRCTC-VB-20670",
            startTime: "06:15",
            endTime: "13:45",
            departureLocation: `${trip.source || "Railway Junction"} Platform 1`,
            arrivalLocation: `${trip.destination} Central`,
            location: "Platform 1",
            status: "NORMAL",
            priority: "HIGH",
            isFlexible: true,
            cancellationPolicy: [{ thresholdHours: 4, refundPercent: 100 }],
            cost: 1850,
            currency: "INR",
            dependencies: [],
            bufferMinutes: 90,
          };
          trip.items = [newTrain, ...trip.items];
          affectedItemIds = [newTrain.id];
        }
        break;
      }

      case "FLIGHT_DELAY":
      case "FLIGHT_CANCELLED":
      case "FLIGHT_CANCELLATION": {
        if (flights.length > 0) {
          affectedItemIds = [flights[0].id];
        } else if (allTransit.length > 0) {
          allTransit[0].type = "FLIGHT";
          allTransit[0].provider = "IndiGo Airlines";
          allTransit[0].title = `IndiGo Flight (${allTransit[0].departureLocation} -> ${allTransit[0].arrivalLocation})`;
          affectedItemIds = [allTransit[0].id];
        } else {
          const newFlight: ItineraryItem = {
            id: `leg-flt-${Date.now()}`,
            tripId,
            type: "FLIGHT",
            title: `IndiGo Flight (${trip.destination} Inbound)`,
            provider: "IndiGo Airlines",
            referenceNumber: "6E-5521",
            startTime: "08:30",
            endTime: "10:15",
            departureLocation: `${trip.source || "Origin"} Airport`,
            arrivalLocation: `${trip.destination} Airport`,
            location: "Arrivals Gate 4",
            status: "NORMAL",
            priority: "HIGH",
            isFlexible: false,
            cancellationPolicy: [
              { thresholdHours: 24, refundPercent: 100 },
              { thresholdHours: 2, refundPercent: 50 },
            ],
            cost: 4500,
            currency: "INR",
            dependencies: [],
            bufferMinutes: 75,
          };
          trip.items = [newFlight, ...trip.items];
          affectedItemIds = [newFlight.id];
        }
        break;
      }

      case "BUS_DELAY":
      case "BUS_CANCELLED": {
        if (buses.length > 0) {
          affectedItemIds = [buses[0].id];
        } else if (transfers.length > 0) {
          transfers[0].type = "BUS";
          transfers[0].provider = "KSRTC / Volvo AC Sleeper";
          transfers[0].title = `Volvo Multi-Axle AC Sleeper (${transfers[0].departureLocation} -> ${transfers[0].arrivalLocation})`;
          affectedItemIds = [transfers[0].id];
        } else if (allTransit.length > 0) {
          allTransit[0].type = "BUS";
          allTransit[0].provider = "KSRTC / Volvo AC Sleeper";
          allTransit[0].title = `Volvo Multi-Axle AC Sleeper (${allTransit[0].departureLocation} -> ${allTransit[0].arrivalLocation})`;
          affectedItemIds = [allTransit[0].id];
        } else {
          const newBus: ItineraryItem = {
            id: `leg-bus-${Date.now()}`,
            tripId,
            type: "BUS",
            title: `Volvo Multi-Axle AC Sleeper (${trip.destination} Highway)`,
            provider: "KSRTC / RSRTC Super Luxury",
            referenceNumber: "VOLVO-SL-401",
            startTime: "21:30",
            endTime: "07:00",
            departureLocation: `${trip.source || "Central"} Bus Terminal`,
            arrivalLocation: `${trip.destination} Bus Stand`,
            location: "Central Bus Bay",
            status: "NORMAL",
            priority: "MEDIUM",
            isFlexible: true,
            cancellationPolicy: [{ thresholdHours: 4, refundPercent: 90 }],
            cost: 1350,
            currency: "INR",
            dependencies: [],
            bufferMinutes: 60,
          };
          trip.items = [newBus, ...trip.items];
          affectedItemIds = [newBus.id];
        }
        break;
      }

      case "MISSED_CONNECTION": {
        if (transfers.length > 0) {
          affectedItemIds = [transfers[0].id];
        } else if (allTransit.length > 1) {
          affectedItemIds = [allTransit[1].id];
        } else if (allTransit.length > 0) {
          affectedItemIds = [allTransit[0].id];
        } else {
          affectedItemIds = [trip.items[0]?.id || "item-1"];
        }
        break;
      }

      case "HOTEL_CANCELLED":
      case "HOTEL_UNAVAILABLE": {
        if (hotels.length > 0) {
          affectedItemIds = [hotels[0].id];
        } else {
          const newHotel: ItineraryItem = {
            id: `leg-htl-${Date.now()}`,
            tripId,
            type: "HOTEL",
            title: `${trip.destination} 5-Star Luxury Executive Stay`,
            provider: "Luxury Hospitality Group",
            referenceNumber: "HTL-LUX-01",
            startTime: "15:30",
            endTime: "16:15",
            departureLocation: `${trip.destination} City Center`,
            arrivalLocation: `${trip.destination} City Center`,
            location: "City Center",
            status: "NORMAL",
            priority: "MEDIUM",
            isFlexible: true,
            cancellationPolicy: [{ thresholdHours: 24, refundPercent: 100 }],
            cost: 9500,
            currency: "INR",
            dependencies: [],
            bufferMinutes: 180,
          };
          trip.items.push(newHotel);
          affectedItemIds = [newHotel.id];
        }
        break;
      }

      case "TRANSFER_FAILURE":
      case "TRANSFER_FAILED": {
        if (transfers.length > 0) {
          affectedItemIds = [transfers[0].id];
        } else if (buses.length > 0) {
          affectedItemIds = [buses[0].id];
        } else {
          affectedItemIds = [trip.items[0]?.id || "item-1"];
        }
        break;
      }

      case "ACTIVITY_CANCELLATION":
      case "ACTIVITY_CANCELLED": {
        if (activities.length > 0) {
          affectedItemIds = [activities[0].id];
        } else {
          const newAct: ItineraryItem = {
            id: `leg-act-${Date.now()}`,
            tripId,
            type: "ACTIVITY",
            title: `${trip.destination} Guided Heritage Fort & City Palace Excursion`,
            provider: "Heritage Cultural Tours",
            referenceNumber: "ACT-TOUR-01",
            startTime: "16:00",
            endTime: "19:00",
            departureLocation: `${trip.destination} Historical Center`,
            arrivalLocation: `${trip.destination} Historical Center`,
            location: "Palace Gate",
            status: "NORMAL",
            priority: "LOW",
            isFlexible: true,
            cancellationPolicy: [{ thresholdHours: 6, refundPercent: 100 }],
            cost: 850,
            currency: "INR",
            dependencies: [],
            bufferMinutes: 60,
          };
          trip.items.push(newAct);
          affectedItemIds = [newAct.id];
        }
        break;
      }

      case "WEATHER_DISRUPTION": {
        if (allTransit.length > 0) {
          affectedItemIds = [allTransit[0].id];
        } else {
          affectedItemIds = [trip.items[0]?.id || "item-1"];
        }
        break;
      }

      case "TRAVELER_CHANGE":
      default: {
        affectedItemIds = [trip.items[0]?.id || "item-1"];
        break;
      }
    }

    const disruption: DisruptionEvent = {
      ...scenario,
      affectedItemIds,
      reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    trip.activeDisruption = disruption;

    const impact = this.engine.analyzeImpact(trip.items, disruption);
    const directSet = new Set(impact.directImpact);
    const downstreamSet = new Set(impact.downstreamImpact);

    trip.items = trip.items.map((item) => {
      if (directSet.has(item.id)) {
        return {
          ...item,
          status:
            disruption.type.includes("CANCEL") ||
            disruption.type === "TRANSFER_FAILURE" ||
            disruption.type === "TRANSFER_FAILED"
              ? "CANCELLED"
              : "AFFECTED",
        };
      }
      if (downstreamSet.has(item.id)) {
        return {
          ...item,
          status: "AT_RISK",
        };
      }
      return { ...item, status: "NORMAL" };
    });

    const plans = await this.engine.generateRecoveryPlans(trip.items, disruption, impact);

    const updatedTrip: TripSnapshot = {
      ...trip,
      activeDisruption: disruption,
      items: trip.items,
    };
    this.trips.set(tripId, updatedTrip);

    return {
      trip: updatedTrip,
      disruption,
      impact,
      plans,
    };
  }

  public async getRecoveryData(tripId: string): Promise<{
    impact: ImpactAnalysis;
    plans: RecoveryPlan[];
  }> {
    const trip = this.trips.get(tripId);
    if (!trip || !trip.activeDisruption) {
      throw new Error("No active disruption on this trip");
    }

    const impact = this.engine.analyzeImpact(trip.items, trip.activeDisruption);
    const plans = await this.engine.generateRecoveryPlans(
      trip.items,
      trip.activeDisruption,
      impact
    );

    return { impact, plans };
  }

  public applyRecoveryPlan(
    tripId: string,
    planId: string,
    planData?: RecoveryPlan
  ): { trip: TripSnapshot; appliedPlan: RecoveryPlan } {
    const trip = this.trips.get(tripId);
    if (!trip || !trip.activeDisruption) {
      throw new Error("Trip or active disruption not found");
    }

    trip.history.push({
      timestamp: new Date().toISOString(),
      action: `Apply Recovery Plan: ${planId}`,
      items: JSON.parse(JSON.stringify(trip.items)),
    });

    const affectedItemIds = new Set(trip.activeDisruption.affectedItemIds);

    trip.items = trip.items.map((item) => {
      if (affectedItemIds.has(item.id)) {
        const action =
          planData?.actions?.find((a) => a.targetItemId === item.id) ||
          planData?.actions?.[0];

        const label = planData?.label || planId || "";
        const labelLower = label.toLowerCase();
        const idLower = (planData?.id || planId).toLowerCase();

        let newType: ItemType = item.type;
        let newTitle = item.title;
        let newProvider = action?.newProvider || item.provider;
        let newRef = item.referenceNumber;
        let newCost = planData?.additionalCost || action?.newCost || item.cost;
        let newStartTime = item.startTime;
        let newEndTime = item.endTime;
        let newDepLoc = item.departureLocation;
        let newArrLoc = item.arrivalLocation;
        let newLoc = item.location;

        const cleanSrc = trip.source || item.departureLocation || "Origin";
        const cleanDst = trip.destination || item.arrivalLocation || "Destination";

        // Modality detection (FLIGHT, CAB, BUS, TRAIN, HOTEL, ACTIVITY)
        if (
          idLower.includes("flight") ||
          labelLower.includes("airways") ||
          labelLower.includes("flight") ||
          labelLower.includes("indigo") ||
          labelLower.includes("air india")
        ) {
          newType = "FLIGHT";
          newTitle = `Direct Domestic Flight (IndiGo / Air India Express)`;
          newProvider = action?.newProvider || "IndiGo Airlines / Air India Direct";
          newRef = `6E-${Math.floor(1000 + Math.random() * 9000)} (PNR: REC-${Math.floor(100000 + Math.random() * 900000)})`;
          newDepLoc = `${cleanSrc} Airport Terminal 1`;
          newArrLoc = `${cleanDst} Airport Terminal 2`;
          newLoc = `${cleanDst} Airport Arrivals Gate`;
          if (planData?.arrivalTime) {
            newEndTime = planData.arrivalTime.replace(/[^0-9:]/g, "").slice(0, 5);
            const [h, m] = newEndTime.split(":").map(Number);
            const totalMins = (h || 14) * 60 + (m || 0) - 75;
            const depH = Math.max(0, Math.floor(totalMins / 60));
            const depM = Math.max(0, totalMins % 60);
            newStartTime = `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`;
          }
        } else if (
          idLower.includes("cab") ||
          idLower.includes("innova") ||
          labelLower.includes("innova") ||
          labelLower.includes("chauffeur") ||
          labelLower.includes("cab") ||
          (labelLower.includes("roadways") && !labelLower.includes("bus"))
        ) {
          newType = "TRANSFER";
          newTitle = `Dedicated Highway Innova Crysta Chauffeur Cab`;
          newProvider = action?.newProvider || "Intercity Highway Chauffeur Fleet";
          newRef = `CAB-REC-${Math.floor(10000 + Math.random() * 90000)}`;
          newDepLoc = `${cleanSrc} Expressway Hub`;
          newArrLoc = `${cleanDst} Hotel Drop-off`;
          newLoc = `Direct Hotel Drop-off (${cleanDst})`;
          if (planData?.arrivalTime) {
            newEndTime = planData.arrivalTime.replace(/[^0-9:]/g, "").slice(0, 5);
            const [h, m] = newEndTime.split(":").map(Number);
            const totalMins = (h || 15) * 60 + (m || 0) - 270;
            const depH = Math.max(5, Math.floor(totalMins / 60));
            const depM = Math.max(0, totalMins % 60);
            newStartTime = `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`;
          }
        } else if (
          idLower.includes("bus") ||
          idLower.includes("volvo") ||
          labelLower.includes("volvo") ||
          labelLower.includes("bus") ||
          labelLower.includes("sleeper")
        ) {
          newType = "BUS";
          newTitle = `Premium Volvo Multi-Axle AC Sleeper Coach`;
          newProvider = action?.newProvider || "KSRTC / Super Luxury Volvo Fleet";
          newRef = `VOLVO-REC-${Math.floor(10000 + Math.random() * 90000)}`;
          newDepLoc = `${cleanSrc} Intercity Bus Terminal`;
          newArrLoc = `${cleanDst} Central Bus Station`;
          newLoc = `${cleanDst} Bus Bay 4`;
          if (planData?.arrivalTime) {
            newEndTime = planData.arrivalTime.replace(/[^0-9:]/g, "").slice(0, 5);
            const [h, m] = newEndTime.split(":").map(Number);
            const totalMins = (h || 16) * 60 + (m || 0) - 360;
            const depH = Math.max(4, Math.floor(totalMins / 60));
            const depM = Math.max(0, totalMins % 60);
            newStartTime = `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`;
          }
        } else if (
          idLower.includes("train") ||
          labelLower.includes("vande bharat") ||
          labelLower.includes("shatabdi") ||
          labelLower.includes("train") ||
          labelLower.includes("railways")
        ) {
          newType = "TRAIN";
          newTitle = `Vande Bharat / Shatabdi Express (20703 CC Executive)`;
          newProvider = action?.newProvider || "Indian Railways / IRCTC Vande Bharat";
          newRef = `IRCTC-REC-${Math.floor(100000 + Math.random() * 900000)}`;
          newDepLoc = `${cleanSrc} Junction Platform 1`;
          newArrLoc = `${cleanDst} Central Platform 1`;
          newLoc = `Platform 1`;
          if (planData?.arrivalTime) {
            newEndTime = planData.arrivalTime.replace(/[^0-9:]/g, "").slice(0, 5);
            const [h, m] = newEndTime.split(":").map(Number);
            const totalMins = (h || 14) * 60 + (m || 0) - 300;
            const depH = Math.max(5, Math.floor(totalMins / 60));
            const depM = Math.max(0, totalMins % 60);
            newStartTime = `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`;
          }
        } else if (
          idLower.includes("hotel") ||
          labelLower.includes("hotel") ||
          labelLower.includes("stay") ||
          labelLower.includes("suite")
        ) {
          newType = "HOTEL";
          newTitle = `Confirmed 5-Star Boutique Executive Stay`;
          newProvider = action?.newProvider || "Luxury Hospitality Partner";
          newRef = `HTL-CONF-${Math.floor(10000 + Math.random() * 90000)}`;
          newLoc = `${cleanDst} City Center`;
        } else if (
          idLower.includes("act") ||
          labelLower.includes("tour") ||
          labelLower.includes("activity") ||
          labelLower.includes("excursion")
        ) {
          newType = "ACTIVITY";
          newTitle = `Verified Alternative City Excursion`;
          newProvider = action?.newProvider || "City Culture Partners";
          newRef = `ACT-CONF-${Math.floor(10000 + Math.random() * 90000)}`;
        }

        // Custom clean label override if label provided
        if (planData?.label) {
          const parts = planData.label.split("—");
          if (parts[1]) {
            const parsed = parts[1]
              .replace(/\(Railways\)|\(Roadways\)|\(Airways\)|\(Hotel\)|\(Activity\)/gi, "")
              .replace(/^Alternative Premium Train:\s*/i, "")
              .replace(/^Option [A-D]:?\s*/i, "")
              .trim();
            if (parsed.length > 5) {
              newTitle = parsed;
            }
          }
        }

        return {
          ...item,
          title: newTitle,
          provider: newProvider,
          type: newType,
          cost: newCost,
          referenceNumber: newRef,
          startTime: newStartTime,
          endTime: newEndTime,
          departureLocation: newDepLoc,
          arrivalLocation: newArrLoc,
          location: newLoc,
          status: "RECOVERED",
          notes: `✓ Confirmed Replacement: ${newTitle} rebooked & secured. Disrupted booking 100% refund credited.`,
        };
      }

      if (item.status === "AT_RISK") {
        return {
          ...item,
          status: "NORMAL",
        };
      }

      return item;
    });

    trip.activeDisruption = null;

    const returnPlan: RecoveryPlan = planData || {
      id: planId,
      tripId,
      label: "Applied Recovery",
      planType: "FASTEST",
      rank: 1,
      additionalCost: 0,
      refundAmount: 0,
      netAdditionalCost: 0,
      arrivalTime: "Recovered",
      bufferMinutes: 45,
      bufferRisk: "LOW",
      bookingsChanged: 1,
      activitiesLost: 0,
      distanceKm: 0,
      criticalEventProtected: "YES",
      feasibility: "RECOVERABLE",
      explanation: "Plan applied successfully to confirmed itinerary.",
      tradeOffSummary: "Schedule secured and critical meetings preserved.",
      luggageHandled: true,
      actions: [],
      scores: [],
    };

    return {
      trip,
      appliedPlan: returnPlan,
    };
  }

  public undoLastApply(tripId: string): TripSnapshot {
    const trip = this.trips.get(tripId);
    if (!trip || trip.history.length === 0) {
      throw new Error("No previous state to restore");
    }

    const last = trip.history.pop()!;
    trip.items = last.items;
    return trip;
  }

  public getProactiveRiskAlerts(tripId: string): RiskAlert[] {
    const trip = this.trips.get(tripId);
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
  }
}
