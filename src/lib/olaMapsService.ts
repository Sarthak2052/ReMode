/**
 * Ola Krutrim Maps Routing Service
 * Provides real-time transit and routing calculations for the ReMode recovery engine.
 */

export interface LatLngCoords {
  lat: number;
  lng: number;
}

export type CoordinateInput = string | LatLngCoords | [number, number];

/**
 * Formats coordinate input into a clean "lat,lng" string.
 */
function formatCoordinate(coord: CoordinateInput): string {
  if (typeof coord === "string") {
    return coord.trim();
  }
  if (Array.isArray(coord)) {
    return `${coord[0]},${coord[1]}`;
  }
  if (coord && typeof coord === "object" && "lat" in coord && "lng" in coord) {
    return `${coord.lat},${coord.lng}`;
  }
  throw new Error(`Invalid coordinate format: ${JSON.stringify(coord)}`);
}

/**
 * Retrieves total transit time in minutes between origin and destination using Ola Maps Directions Basic API.
 *
 * Official cURL Reference:
 * curl --location --request POST "https://api.olamaps.io/routing/v1/directions/basic?origin={lat,lng}&destination={lat,lng}&api_key=${your_api_key}" --header "X-Request-Id: {uuid}"
 *
 * @param origin - Starting coordinates ("lat,lng" string, { lat, lng } object, or [lat, lng] array)
 * @param destination - Ending coordinates ("lat,lng" string, { lat, lng } object, or [lat, lng] array)
 * @returns Travel duration in minutes (integer), defaults to 60 if API call fails
 */
export async function getTransitTime(
  origin: CoordinateInput,
  destination: CoordinateInput
): Promise<number> {
  const DEFAULT_FALLBACK_MINUTES = 60;

  try {
    const apiKey =
      process.env.OLA_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        "OlaMapsService: OLA_MAPS_API_KEY is not configured. Falling back to default transit time (60m)."
      );
      return DEFAULT_FALLBACK_MINUTES;
    }

    const formattedOrigin = formatCoordinate(origin);
    const formattedDestination = formatCoordinate(destination);

    const requestId = crypto.randomUUID();
    const url = `https://api.olamaps.io/routing/v1/directions/basic?origin=${formattedOrigin}&destination=${formattedDestination}&api_key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Request-Id": requestId,
      },
    });

    if (!response.ok) {
      console.warn(
        `OlaMapsService: Request failed with status ${response.status} ${response.statusText}`
      );
      return DEFAULT_FALLBACK_MINUTES;
    }

    const data = await response.json();

    // Extract duration from response (Ola Maps provides duration in seconds)
    // Structure: data.routes[0].legs[0].duration (seconds)
    const leg = data.routes?.[0]?.legs?.[0];
    const durationSeconds =
      typeof leg?.duration === "number"
        ? leg.duration
        : typeof data.routes?.[0]?.duration === "number"
        ? data.routes[0].duration
        : null;

    if (durationSeconds !== null && durationSeconds >= 0) {
      // Return total travel duration in minutes as an integer
      return Math.round(durationSeconds / 60);
    }

    console.warn(
      "OlaMapsService: Duration not found in response, falling back to 60m."
    );
    return DEFAULT_FALLBACK_MINUTES;
  } catch (error) {
    console.error(
      "OlaMapsService: Error in getTransitTime, falling back to 60m:",
      error
    );
    return DEFAULT_FALLBACK_MINUTES;
  }
}
