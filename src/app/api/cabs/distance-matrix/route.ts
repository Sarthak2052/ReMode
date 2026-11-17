import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Fallback Haversine distance and duration calculation
 * Used if Ola Maps API is rate-limited or unreachable
 */
function calculateFallbackDistanceMatrix(originStr: string, destinationStr: string) {
  const [lat1, lon1] = originStr.split(",").map(Number);
  const [lat2, lon2] = destinationStr.split(",").map(Number);

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return { distance: 5000, duration: 600, status: "OK", source: "fallback_estimated" };
  }

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const haversineMeters = Math.round(R * c);

  // Road factor (~1.3x Euclidean distance on Indian roads)
  const roadDistanceMeters = Math.round(haversineMeters * 1.3);

  // Average city cab speed in India: ~30 km/h (8.33 m/s)
  const durationSeconds = Math.max(60, Math.round(roadDistanceMeters / 8.33));

  return {
    distance: roadDistanceMeters,
    duration: durationSeconds,
    status: "OK",
    source: "fallback_estimated",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const vehicleTypeParam = (
      searchParams.get("vehicleType") ||
      searchParams.get("mode") ||
      "cab"
    ).toLowerCase();

    if (!origin || !destination) {
      return NextResponse.json(
        {
          error: "Missing required query parameters: 'origin' (lat,lng) and 'destination' (lat,lng)",
          example: "/api/cabs/distance-matrix?origin=19.076,72.8777&destination=18.5204,73.8567&vehicleType=volvo",
        },
        { status: 400 }
      );
    }

    const isVolvo =
      vehicleTypeParam.includes("volvo") ||
      vehicleTypeParam.includes("bus") ||
      vehicleTypeParam.includes("coach");
    const isExcursion =
      vehicleTypeParam.includes("excursion") ||
      vehicleTypeParam.includes("cruiser") ||
      vehicleTypeParam.includes("tempo") ||
      vehicleTypeParam.includes("tour");

    const apiKey =
      process.env.OLA_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      console.warn("[DistanceMatrixAPI] No OLA_MAPS_API_KEY found, using estimated matrix.");
      const fallback = calculateFallbackDistanceMatrix(origin, destination);
      const factor = isVolvo ? 1.2 : isExcursion ? 1.1 : 1.0;
      return NextResponse.json(
        {
          ...fallback,
          duration: Math.round(fallback.duration * factor),
          vehicleType: isVolvo ? "VOLVO_BUS" : isExcursion ? "EXCURSION_CRUISER" : "CAB",
          vehicleName: isVolvo
            ? "Volvo 9600 Multi-Axle Luxury Sleeper"
            : isExcursion
            ? "Force Urbania Excursion Cruiser"
            : "Ola Prime Sedan",
        },
        { status: 200 }
      );
    }

    const url = `https://api.olamaps.io/routing/v1/distanceMatrix?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&api_key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Request-Id": "remode-live-tracking",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `[DistanceMatrixAPI] Ola Maps API responded with HTTP ${res.status}. Using fallback estimate.`
      );
      const fallback = calculateFallbackDistanceMatrix(origin, destination);
      const factor = isVolvo ? 1.2 : isExcursion ? 1.1 : 1.0;
      return NextResponse.json(
        {
          ...fallback,
          duration: Math.round(fallback.duration * factor),
          vehicleType: isVolvo ? "VOLVO_BUS" : isExcursion ? "EXCURSION_CRUISER" : "CAB",
          vehicleName: isVolvo
            ? "Volvo 9600 Multi-Axle Luxury Sleeper"
            : isExcursion
            ? "Force Urbania Excursion Cruiser"
            : "Ola Prime Sedan",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || typeof element.duration !== "number") {
      console.warn(
        "[DistanceMatrixAPI] Invalid elements schema from Ola Maps. Using fallback estimate."
      );
      const fallback = calculateFallbackDistanceMatrix(origin, destination);
      const factor = isVolvo ? 1.2 : isExcursion ? 1.1 : 1.0;
      return NextResponse.json(
        {
          ...fallback,
          duration: Math.round(fallback.duration * factor),
          vehicleType: isVolvo ? "VOLVO_BUS" : isExcursion ? "EXCURSION_CRUISER" : "CAB",
          vehicleName: isVolvo
            ? "Volvo 9600 Multi-Axle Luxury Sleeper"
            : isExcursion
            ? "Force Urbania Excursion Cruiser"
            : "Ola Prime Sedan",
        },
        { status: 200 }
      );
    }

    // Heavy multi-axle Volvo buses and Excursion cruisers navigate Indian highways
    // with commercial vehicle speed governors (80 km/h) and mandatory passenger dwell times
    const durationFactor = isVolvo ? 1.2 : isExcursion ? 1.1 : 1.0;
    const finalDuration = Math.round(element.duration * durationFactor);

    return NextResponse.json(
      {
        distance: element.distance, // in meters
        duration: finalDuration, // in seconds (calibrated for vehicle type)
        rawCarDuration: element.duration,
        vehicleType: isVolvo ? "VOLVO_BUS" : isExcursion ? "EXCURSION_CRUISER" : "CAB",
        vehicleName: isVolvo
          ? "Volvo 9600 Multi-Axle Luxury Sleeper"
          : isExcursion
          ? "Force Urbania Excursion Cruiser"
          : "Ola Prime Sedan",
        status: element.status || "OK",
        source: "ola_maps_distance_matrix",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[DistanceMatrixAPI] Error fetching Ola distance matrix:", error);

    // Ensure client simulation never crashes
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin") || "19.076,72.8777";
    const destination = searchParams.get("destination") || "19.080,72.8800";
    const fallback = calculateFallbackDistanceMatrix(origin, destination);

    return NextResponse.json(fallback, { status: 200 });
  }
}
