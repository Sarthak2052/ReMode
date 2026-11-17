import type {
  Coordinates,
  GeocodedLocation,
  RoadRoute,
  RouteStep,
  DistanceMatrixEntry,
} from "./GroundTransportTypes.ts";
import type {
  IGroundTransportProvider,
  RouteOptions,
} from "./GroundTransportProvider.ts";

// Known Indian transport hub coordinates
const KNOWN_HUBS: Record<string, GeocodedLocation> = {
  "del-t3": {
    placeId: "del-t3",
    name: "Indira Gandhi International Airport (DEL T3)",
    formattedAddress: "Terminal 3, IGI Airport, New Delhi, Delhi 110037",
    coordinates: { lat: 28.5562, lng: 77.1000 },
    types: ["airport", "transit_station"],
  },
  "del-t1": {
    placeId: "del-t1",
    name: "Indira Gandhi International Airport (DEL T1)",
    formattedAddress: "Terminal 1D, IGI Airport, New Delhi, Delhi 110037",
    coordinates: { lat: 28.5687, lng: 77.1121 },
    types: ["airport", "transit_station"],
  },
  ndls: {
    placeId: "ndls",
    name: "New Delhi Railway Station (NDLS)",
    formattedAddress: "Bhavbhuti Marg, Ratan Lal Market, Kamla Market, Ajmeri Gate, New Delhi 110006",
    coordinates: { lat: 28.6415, lng: 77.2207 },
    types: ["train_station", "transit_station"],
  },
  "bom-t2": {
    placeId: "bom-t2",
    name: "Chhatrapati Shivaji Maharaj International Airport (BOM T2)",
    formattedAddress: "Terminal 2, Navpada, Sahar Village, Andheri East, Mumbai, Maharashtra 400099",
    coordinates: { lat: 19.0896, lng: 72.8656 },
    types: ["airport", "transit_station"],
  },
  "ixz-airport": {
    placeId: "ixz-airport",
    name: "Veer Savarkar International Airport (IXZ)",
    formattedAddress: "Lamba Line, Port Blair, Andaman and Nicobar Islands 744103",
    coordinates: { lat: 11.6412, lng: 92.7297 },
    types: ["airport", "transit_station"],
  },
  "haddo-jetty": {
    placeId: "haddo-jetty",
    name: "Haddo Wharf & Ferry Jetty",
    formattedAddress: "Haddo, Port Blair, Andaman and Nicobar Islands 744102",
    coordinates: { lat: 11.6811, lng: 92.7245 },
    types: ["ferry_terminal", "transit_station"],
  },
  "lko-station": {
    placeId: "lko-station",
    name: "Lucknow Charbagh Railway Station (LKO)",
    formattedAddress: "Kanpur Rd, Charbagh, Lucknow, Uttar Pradesh 226004",
    coordinates: { lat: 26.8322, lng: 80.9208 },
    types: ["train_station", "transit_station"],
  },
  "jaipur-jn": {
    placeId: "jaipur-jn",
    name: "Jaipur Junction Railway Station (JP)",
    formattedAddress: "Gopalbari, Jaipur, Rajasthan 302006",
    coordinates: { lat: 26.9196, lng: 75.7878 },
    types: ["train_station", "transit_station"],
  },
  "taj-amer": {
    placeId: "taj-amer",
    name: "Taj Amer",
    formattedAddress: "Kukas, Jaipur, Rajasthan 302028",
    coordinates: { lat: 27.0347, lng: 75.9189 },
    types: ["lodging", "hotel"],
  },
};

function calculateHaversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveCoords(target: string | Coordinates): Coordinates {
  if (typeof target !== "string") return target;
  const normalizedTarget = normalizeKey(target);
  for (const [k, v] of Object.entries(KNOWN_HUBS)) {
    const normalizedKey = normalizeKey(k);
    const normalizedName = normalizeKey(v.name);
    if (
      normalizedTarget.includes(normalizedKey) ||
      normalizedKey.includes(normalizedTarget) ||
      normalizedName.includes(normalizedTarget)
    ) {
      return v.coordinates;
    }
  }
  // Default fallback (Delhi)
  return { lat: 28.6139, lng: 77.2090 };
}

function resolveLocation(target: string | Coordinates): GeocodedLocation {
  if (typeof target === "string") {
    const normalizedTarget = normalizeKey(target);
    for (const [k, v] of Object.entries(KNOWN_HUBS)) {
      const normalizedKey = normalizeKey(k);
      const normalizedName = normalizeKey(v.name);
      if (
        normalizedTarget.includes(normalizedKey) ||
        normalizedKey.includes(normalizedTarget) ||
        normalizedName.includes(normalizedTarget)
      ) {
        return v;
      }
    }
    return {
      placeId: `mock-${Date.now()}`,
      name: target,
      formattedAddress: `${target}, India`,
      coordinates: resolveCoords(target),
    };
  }
  return {
    placeId: `coords-${target.lat.toFixed(4)}-${target.lng.toFixed(4)}`,
    name: `Location (${target.lat.toFixed(4)}, ${target.lng.toFixed(4)})`,
    formattedAddress: `Lat: ${target.lat}, Lng: ${target.lng}, India`,
    coordinates: target,
  };
}

export class MockGroundTransportProvider implements IGroundTransportProvider {
  readonly name = "MockGroundTransportProvider";

  async searchPlaces(query: string, locationBias?: Coordinates): Promise<GeocodedLocation[]> {
    const q = query.toLowerCase();
    const matches = Object.values(KNOWN_HUBS).filter(
      (hub) =>
        hub.name.toLowerCase().includes(q) ||
        hub.formattedAddress.toLowerCase().includes(q)
    );

    if (matches.length > 0) return matches;

    return [
      {
        placeId: `search-${Date.now()}`,
        name: query,
        formattedAddress: `${query}, India`,
        coordinates: locationBias || { lat: 28.6139, lng: 77.2090 },
      },
    ];
  }

  async geocode(address: string): Promise<GeocodedLocation | null> {
    return resolveLocation(address);
  }

  async reverseGeocode(coords: Coordinates): Promise<GeocodedLocation | null> {
    for (const hub of Object.values(KNOWN_HUBS)) {
      const dist = calculateHaversineDistanceKm(coords, hub.coordinates);
      if (dist < 2.0) return hub;
    }
    return resolveLocation(coords);
  }

  async calculateRoadRoute(
    origin: string | Coordinates,
    destination: string | Coordinates,
    options?: RouteOptions
  ): Promise<RoadRoute> {
    const originLoc = resolveLocation(origin);
    const destLoc = resolveLocation(destination);

    const straightDistKm = calculateHaversineDistanceKm(
      originLoc.coordinates,
      destLoc.coordinates
    );

    // Realistic road curvature multiplier (1.25x - 1.4x of as-the-crow-flies)
    const roadDistKm = Math.max(1.5, straightDistKm * 1.35);
    const distanceMeters = Math.round(roadDistKm * 1000);

    // Realistic Indian city/highway driving speed (30-45 km/h in city, 70-80 km/h highway)
    const avgSpeedKmH = roadDistKm > 50 ? 65 : 32;
    const baseDurationMinutes = Math.round((roadDistKm / avgSpeedKmH) * 60);

    const trafficMultiplier = options?.trafficAware ? 1.25 : 1.0;
    const durationSeconds = Math.round(baseDurationMinutes * 60);
    const durationWithTrafficSeconds = Math.round(durationSeconds * trafficMultiplier);

    // Generate 5 intermediate waypoints for geometry
    const coordinates: Coordinates[] = [];
    const stepsCount = 5;
    for (let i = 0; i <= stepsCount; i++) {
      const fraction = i / stepsCount;
      coordinates.push({
        lat: originLoc.coordinates.lat + (destLoc.coordinates.lat - originLoc.coordinates.lat) * fraction,
        lng: originLoc.coordinates.lng + (destLoc.coordinates.lng - originLoc.coordinates.lng) * fraction,
      });
    }

    const steps: RouteStep[] = [
      {
        instruction: `Head out from ${originLoc.name} toward main highway`,
        distanceMeters: Math.round(distanceMeters * 0.2),
        durationSeconds: Math.round(durationSeconds * 0.2),
        startLocation: coordinates[0],
        endLocation: coordinates[1],
        roadName: "Arterial Road",
      },
      {
        instruction: `Continue straight along express corridor`,
        distanceMeters: Math.round(distanceMeters * 0.6),
        durationSeconds: Math.round(durationSeconds * 0.6),
        startLocation: coordinates[1],
        endLocation: coordinates[4],
        roadName: "Expressway / National Highway",
      },
      {
        instruction: `Take exit ramp toward ${destLoc.name}`,
        distanceMeters: Math.round(distanceMeters * 0.2),
        durationSeconds: Math.round(durationSeconds * 0.2),
        startLocation: coordinates[4],
        endLocation: coordinates[5],
        roadName: "Terminal Access Road",
      },
    ];

    // Estimated Indian cab fares (₹18-24/km + base fare)
    const minCost = Math.round(Math.max(150, roadDistKm * 18 + 50));
    const maxCost = Math.round(Math.max(220, roadDistKm * 24 + 100));

    return {
      id: `road-route-${Date.now()}`,
      provider: "Mock Ground Provider (Deterministic Indian Corridors)",
      origin: originLoc,
      destination: destLoc,
      distanceMeters,
      durationSeconds,
      durationWithTrafficSeconds,
      coordinates,
      steps,
      congestionLevel: roadDistKm > 30 ? "MODERATE" : "LOW",
      tollDetails: {
        hasTolls: roadDistKm > 40,
        estimatedTollCost: roadDistKm > 40 ? 120 : 0,
        currency: "INR",
      },
      estimatedCost: {
        min: minCost,
        max: maxCost,
        currency: "INR",
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  async getDistanceMatrix(
    origins: (string | Coordinates)[],
    destinations: (string | Coordinates)[]
  ): Promise<DistanceMatrixEntry[][]> {
    const matrix: DistanceMatrixEntry[][] = [];

    for (let i = 0; i < origins.length; i++) {
      const row: DistanceMatrixEntry[] = [];
      const originCoords = resolveCoords(origins[i]);

      for (let j = 0; j < destinations.length; j++) {
        const destCoords = resolveCoords(destinations[j]);
        const straightDistKm = calculateHaversineDistanceKm(originCoords, destCoords);
        const roadDistKm = straightDistKm * 1.35;
        const durationSeconds = Math.round((roadDistKm / 40) * 3600);

        row.push({
          originIndex: i,
          destinationIndex: j,
          distanceMeters: Math.round(roadDistKm * 1000),
          durationSeconds,
          status: "OK",
        });
      }
      matrix.push(row);
    }

    return matrix;
  }
}
