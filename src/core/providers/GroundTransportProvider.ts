import type {
  Coordinates,
  GeocodedLocation,
  RoadRoute,
  DistanceMatrixEntry,
} from "./GroundTransportTypes.ts";

export interface RouteOptions {
  mode?: "driving" | "two_wheeler";
  departureTime?: Date;
  trafficAware?: boolean;
  avoidTolls?: boolean;
}

/**
 * Core interface for geospatial ground transport providers.
 * Decouples ReMode's recovery logic from any single external API (e.g. Ola Maps vs Mock).
 */
export interface IGroundTransportProvider {
  readonly name: string;

  /**
   * Search for places or POIs with optional location bias.
   */
  searchPlaces(query: string, locationBias?: Coordinates): Promise<GeocodedLocation[]>;

  /**
   * Convert an address or place name to geographic coordinates.
   */
  geocode(address: string): Promise<GeocodedLocation | null>;

  /**
   * Convert coordinates to a structured address.
   */
  reverseGeocode(coords: Coordinates): Promise<GeocodedLocation | null>;

  /**
   * Calculate a real-world road route with distance, duration, and geometry.
   */
  calculateRoadRoute(
    origin: string | Coordinates,
    destination: string | Coordinates,
    options?: RouteOptions
  ): Promise<RoadRoute>;

  /**
   * Compute multi-origin, multi-destination distance/duration matrix.
   */
  getDistanceMatrix(
    origins: (string | Coordinates)[],
    destinations: (string | Coordinates)[]
  ): Promise<DistanceMatrixEntry[][]>;
}
