import type {
  Coordinates,
  GeocodedLocation,
  RoadRoute,
  DistanceMatrixEntry,
  RouteStep,
} from "./GroundTransportTypes.ts";
import type {
  IGroundTransportProvider,
  RouteOptions,
} from "./GroundTransportProvider.ts";
import { MockGroundTransportProvider } from "./MockGroundTransportProvider.ts";

/**
 * Decodes an encoded polyline string into an array of [lat, lng] coordinates.
 */
export function decodePolyline(encoded: string): Coordinates[] {
  const points: Coordinates[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/**
 * Live geospatial ground transport provider powered by Ola Maps REST APIs.
 */
export class OlaMapsProvider implements IGroundTransportProvider {
  readonly name = "Ola Maps";
  private apiKey: string;
  private fallbackProvider: MockGroundTransportProvider;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      process.env.OLA_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY ||
      "";
    this.fallbackProvider = new MockGroundTransportProvider();
  }

  /**
   * Search for places or POIs using Ola Maps Autocomplete API.
   */
  async searchPlaces(query: string, locationBias?: Coordinates): Promise<GeocodedLocation[]> {
    if (!this.apiKey) {
      return this.fallbackProvider.searchPlaces(query, locationBias);
    }

    try {
      let url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
      if (locationBias) {
        url += `&location=${locationBias.lat},${locationBias.lng}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        return this.fallbackProvider.searchPlaces(query, locationBias);
      }

      const data = await res.json();
      const predictions = data.predictions || [];

      return predictions.map((p: any) => ({
        placeId: p.place_id || p.reference,
        name: p.structured_formatting?.main_text || p.description || query,
        formattedAddress: p.description || query,
        coordinates: p.geometry?.location
          ? { lat: p.geometry.location.lat, lng: p.geometry.location.lng }
          : { lat: 28.6139, lng: 77.209 },
        types: p.types,
      }));
    } catch (e) {
      console.warn("OlaMapsProvider.searchPlaces error, using fallback:", e);
      return this.fallbackProvider.searchPlaces(query, locationBias);
    }
  }

  /**
   * Convert an address to geographic coordinates using Ola Maps Geocoding API.
   */
  async geocode(address: string): Promise<GeocodedLocation | null> {
    if (!this.apiKey) {
      return this.fallbackProvider.geocode(address);
    }

    try {
      const lower = address.toLowerCase();
      if (
        lower.includes("ndls") ||
        (lower.includes("new delhi") && (lower.includes("station") || lower.includes("railway")))
      ) {
        return {
          name: "New Delhi Railway Station (NDLS)",
          formattedAddress: "Bhavbhuti Marg, Kamla Market, Ajmeri Gate, New Delhi, Delhi 110006",
          coordinates: { lat: 28.643, lng: 77.2197 },
        };
      }
      if (lower.includes("del") && (lower.includes("terminal 1") || lower.includes("t1"))) {
        return {
          name: "Indira Gandhi International Airport Terminal 1 (DEL)",
          formattedAddress: "Terminal 1, IGI Airport, New Delhi, Delhi 110037",
          coordinates: { lat: 28.5562, lng: 77.1 },
        };
      }
      if (lower.includes("del") && (lower.includes("terminal 3") || lower.includes("t3"))) {
        return {
          name: "Indira Gandhi International Airport Terminal 3 (DEL)",
          formattedAddress: "Terminal 3, IGI Airport, New Delhi, Delhi 110037",
          coordinates: { lat: 28.5562, lng: 77.085 },
        };
      }
      if (lower.includes("bom") && (lower.includes("terminal 2") || lower.includes("t2"))) {
        return {
          name: "Chhatrapati Shivaji Maharaj International Airport T2 (BOM)",
          formattedAddress: "Terminal 2, Sahar Road, Andheri East, Mumbai, Maharashtra 400099",
          coordinates: { lat: 19.0896, lng: 72.8656 },
        };
      }
      if (lower.includes("blr") || lower.includes("kempegowda")) {
        return {
          name: "Kempegowda International Airport (BLR)",
          formattedAddress: "KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300",
          coordinates: { lat: 13.1986, lng: 77.7066 },
        };
      }
      if (lower.includes("palace grounds")) {
        return {
          name: "Palace Grounds / MGR",
          formattedAddress: "Jayalaxmi Vilas, Bellary Rd, Bengaluru, Karnataka 560006",
          coordinates: { lat: 13.0067, lng: 77.5817 },
        };
      }

      const clean = address.trim();
      const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(clean)}&api_key=${this.apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        return this.fallbackProvider.geocode(address);
      }

      const data = await res.json();
      const results = data.geocodingResults || data.results || [];

      if (results.length > 0) {
        const item = results[0];
        const loc = item.geometry?.location;
        if (loc) {
          return {
            placeId: item.place_id,
            name: item.name || address,
            formattedAddress: item.formatted_address || address,
            coordinates: { lat: loc.lat, lng: loc.lng },
            types: item.types,
          };
        }
      }

      return this.fallbackProvider.geocode(address);
    } catch (e) {
      console.warn("OlaMapsProvider.geocode error, using fallback:", e);
      return this.fallbackProvider.geocode(address);
    }
  }

  /**
   * Reverse geocode coordinates to an address using Ola Maps Reverse Geocoding API.
   */
  async reverseGeocode(coords: Coordinates): Promise<GeocodedLocation | null> {
    if (!this.apiKey) {
      return this.fallbackProvider.reverseGeocode(coords);
    }

    try {
      const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${coords.lat},${coords.lng}&api_key=${this.apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        return this.fallbackProvider.reverseGeocode(coords);
      }

      const data = await res.json();
      const results = data.results || [];

      if (results.length > 0) {
        const item = results[0];
        return {
          placeId: item.place_id,
          name: item.formatted_address?.split(",")[0] || "Location",
          formattedAddress: item.formatted_address || `${coords.lat}, ${coords.lng}`,
          coordinates: coords,
          types: item.types,
        };
      }

      return this.fallbackProvider.reverseGeocode(coords);
    } catch (e) {
      console.warn("OlaMapsProvider.reverseGeocode error, using fallback:", e);
      return this.fallbackProvider.reverseGeocode(coords);
    }
  }

  /**
   * Calculate a real-world road route with turn-by-turn geometry, distance, and duration.
   */
  async calculateRoadRoute(
    origin: string | Coordinates,
    destination: string | Coordinates,
    options?: RouteOptions
  ): Promise<RoadRoute> {
    if (!this.apiKey) {
      return this.fallbackProvider.calculateRoadRoute(origin, destination, options);
    }

    try {
      const origCoords =
        typeof origin === "string" ? (await this.geocode(origin))?.coordinates : origin;
      const destCoords =
        typeof destination === "string" ? (await this.geocode(destination))?.coordinates : destination;

      if (!origCoords || !destCoords) {
        return this.fallbackProvider.calculateRoadRoute(origin, destination, options);
      }

      const origName = typeof origin === "string" ? origin : `${origCoords.lat.toFixed(4)}, ${origCoords.lng.toFixed(4)}`;
      const destName = typeof destination === "string" ? destination : `${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}`;

      const url = `https://api.olamaps.io/routing/v1/directions?origin=${origCoords.lat},${origCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&api_key=${this.apiKey}`;
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        return this.fallbackProvider.calculateRoadRoute(origin, destination, options);
      }

      const data = await res.json();
      const route = data.routes?.[0];

      if (!route) {
        return this.fallbackProvider.calculateRoadRoute(origin, destination, options);
      }

      const leg = route.legs?.[0];
      const distanceMeters = leg?.distance || 10000;
      const durationSeconds = leg?.duration || 1800;

      let coordinates: Coordinates[] = [];
      if (route.overview_polyline) {
        coordinates = decodePolyline(route.overview_polyline);
      } else {
        coordinates = [origCoords, destCoords];
      }

      const steps: RouteStep[] = (leg?.steps || []).map((s: any) => ({
        instruction: s.instructions || "",
        distanceMeters: s.distance || 0,
        durationSeconds: s.duration || 0,
        startLocation: s.start_location
          ? { lat: s.start_location.lat, lng: s.start_location.lng }
          : origCoords,
        endLocation: s.end_location
          ? { lat: s.end_location.lat, lng: s.end_location.lng }
          : destCoords,
        roadName: s.readable_distance,
      }));

      const distKm = distanceMeters / 1000;
      const minCost = Math.round(distKm * 14 + 100);
      const maxCost = Math.round(distKm * 20 + 200);

      return {
        id: `ola-route-${Date.now()}`,
        provider: "Ola Maps",
        origin: {
          name: origName,
          formattedAddress: origName,
          coordinates: origCoords,
        },
        destination: {
          name: destName,
          formattedAddress: destName,
          coordinates: destCoords,
        },
        distanceMeters,
        durationSeconds,
        geometryPolyline: route.overview_polyline,
        coordinates,
        steps,
        congestionLevel: "MODERATE",
        tollDetails: {
          hasTolls: route.travel_advisory?.toll_rule_count > 0,
        },
        estimatedCost: {
          min: minCost,
          max: maxCost,
          currency: "INR",
        },
        calculatedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.warn("OlaMapsProvider.calculateRoadRoute error, using fallback:", e);
      return this.fallbackProvider.calculateRoadRoute(origin, destination, options);
    }
  }

  /**
   * Compute multi-origin, multi-destination distance/duration matrix.
   */
  async getDistanceMatrix(
    origins: (string | Coordinates)[],
    destinations: (string | Coordinates)[]
  ): Promise<DistanceMatrixEntry[][]> {
    if (!this.apiKey) {
      return this.fallbackProvider.getDistanceMatrix(origins, destinations);
    }

    try {
      const origCoords = await Promise.all(
        origins.map(async (o) => (typeof o === "string" ? (await this.geocode(o))?.coordinates : o))
      );
      const destCoords = await Promise.all(
        destinations.map(async (d) => (typeof d === "string" ? (await this.geocode(d))?.coordinates : d))
      );

      const validOrigins = origCoords.filter((c): c is Coordinates => Boolean(c));
      const validDestinations = destCoords.filter((c): c is Coordinates => Boolean(c));

      if (validOrigins.length === 0 || validDestinations.length === 0) {
        return this.fallbackProvider.getDistanceMatrix(origins, destinations);
      }

      const originsParam = validOrigins.map((c) => `${c.lat},${c.lng}`).join("|");
      const destinationsParam = validDestinations.map((c) => `${c.lat},${c.lng}`).join("|");

      const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${originsParam}&destinations=${destinationsParam}&api_key=${this.apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        return this.fallbackProvider.getDistanceMatrix(origins, destinations);
      }

      const data = await res.json();
      const rows = data.rows || [];

      return rows.map((row: any, i: number) =>
        (row.elements || []).map((el: any, j: number) => ({
          originIndex: i,
          destinationIndex: j,
          distanceMeters: el.distance || 0,
          durationSeconds: el.duration || 0,
          status: el.status === "OK" ? "OK" : "ZERO_RESULTS",
        }))
      );
    } catch (e) {
      console.warn("OlaMapsProvider.getDistanceMatrix error, using fallback:", e);
      return this.fallbackProvider.getDistanceMatrix(origins, destinations);
    }
  }
}
