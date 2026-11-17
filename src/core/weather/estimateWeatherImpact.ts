import { TripStore } from "../TripStore.ts";
import { RecoveryEngine, type SimulatedWeatherImpact } from "../RecoveryEngine.ts";
import type { TripSnapshot, ItineraryItem, Feasibility } from "../../types/index.ts";

export interface EstimateWeatherImpactInput {
  bookingId: string;
  rainfallMm: number;
  tempC: number;
  stormDurationHrs: number;
  tripId?: string;
  trip?: TripSnapshot;
}

export type WeatherImpactInput = EstimateWeatherImpactInput;
export type WeatherImpactResult = SimulatedWeatherImpact;
export type { SimulatedWeatherImpact };

/**
 * Digital Twin What-If Weather Impact Estimator
 *
 * Requirements:
 * 1. Clones booking/trip state in memory — NEVER writes to real Trip/Booking in TripStore.
 * 2. Reuses existing dependsOn graph traversal via RecoveryEngine & TripGraph to propagate
 *    delay & buffer erosion to connected downstream bookings.
 * 3. Calls geminiAgent (via nugenClient) to output probability + explanation.
 * 4. Returns simulated impact WITHOUT creating a real Disruption row.
 */
export async function estimateWeatherImpact(
  input: EstimateWeatherImpactInput
): Promise<SimulatedWeatherImpact> {
  const { bookingId, rainfallMm, tempC, stormDurationHrs, tripId, trip } = input;

  const tripStore = TripStore.getInstance();
  let targetTrip: TripSnapshot | undefined = trip;

  if (!targetTrip && tripId) {
    targetTrip = tripStore.getTrip(tripId);
  }

  if (!targetTrip) {
    // Search across all trips to locate the trip containing this booking
    const allTrips = tripStore.getAllTrips();
    targetTrip = allTrips.find((t) =>
      t.items.some((it) => it.id === bookingId)
    );
  }

  if (!targetTrip) {
    // Default to primary demo trip
    targetTrip = tripStore.getTrip("trip-denver-2026") || tripStore.getAllTrips()[0];
  }

  if (!targetTrip) {
    throw new Error(
      `No trip found matching booking ID "${bookingId}" or trip ID "${tripId}".`
    );
  }

  // Strictly clone trip in memory so real TripStore remains 100% immutable
  const clonedTrip: TripSnapshot = JSON.parse(JSON.stringify(targetTrip));

  const engine = new RecoveryEngine();
  const simulatedImpact = await engine.simulateWeatherImpact(clonedTrip, {
    bookingId,
    rainfallMm,
    tempC,
    stormDurationHrs,
  });

  return simulatedImpact;
}
