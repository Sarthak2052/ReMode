import { NextRequest, NextResponse } from "next/server";
import { estimateWeatherImpact } from "@/core/weather/estimateWeatherImpact";
import { fetchWeatherNews } from "@/core/social/fetchWeatherNews";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      rainfallMm = 0,
      tempC = 27,
      stormDurationHrs = 1,
      tripId,
      city,
    } = body || {};

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required for Digital Twin simulation." },
        { status: 400 }
      );
    }

    // 1. Run in-memory Digital Twin What-If simulation (zero mutations to real TripStore)
    const simulatedImpact = await estimateWeatherImpact({
      bookingId,
      rainfallMm: Number(rainfallMm) || 0,
      tempC: Number(tempC) || 27,
      stormDurationHrs: Number(stormDurationHrs) || 1,
      tripId,
    });

    // 2. Fetch real localized Google News RSS headlines for the simulated corridor
    const newsCity = city || "Mumbai";
    const headlines = await fetchWeatherNews(newsCity, 3);

    return NextResponse.json({
      success: true,
      impact: simulatedImpact,
      headlines,
    });
  } catch (error: any) {
    console.error("[DigitalTwinSimulateRoute] Error during simulation:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during simulation" },
      { status: 500 }
    );
  }
}
