export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodedLocation {
  placeId?: string;
  name: string;
  formattedAddress: string;
  coordinates: Coordinates;
  types?: string[];
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  startLocation: Coordinates;
  endLocation: Coordinates;
  roadName?: string;
  mode?: string;
}

export interface RoadRoute {
  id: string;
  provider: string; // "Ola Maps" | "Mock Ground Provider" | "BluSmart" | "Local Taxi"
  origin: GeocodedLocation;
  destination: GeocodedLocation;
  distanceMeters: number;
  durationSeconds: number;
  durationWithTrafficSeconds?: number;
  geometryPolyline?: string;
  coordinates: Coordinates[];
  steps?: RouteStep[];
  congestionLevel?: "LOW" | "MODERATE" | "HEAVY" | "SEVERE";
  tollDetails?: {
    hasTolls: boolean;
    estimatedTollCost?: number;
    currency?: string;
  };
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  calculatedAt: string;
}

export interface DistanceMatrixEntry {
  originIndex: number;
  destinationIndex: number;
  distanceMeters: number;
  durationSeconds: number;
  status: "OK" | "NOT_FOUND" | "ZERO_RESULTS";
}
