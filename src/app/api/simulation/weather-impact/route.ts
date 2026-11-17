import { NextRequest, NextResponse } from "next/server";
import { estimateWeatherImpact, WeatherImpactInput } from "@/core/weather/estimateWeatherImpact";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WeatherImpactInput;
    const { bookingId, rainfallMm, tempC, stormDurationHrs, tripId, trip } = body;

    if (!bookingId && !trip && !tripId) {
      return NextResponse.json(
        { error: "bookingId, trip, or tripId is required" },
        { status: 400 }
      );
    }

    const result = await estimateWeatherImpact({
      bookingId: bookingId || "it-leg-01",
      rainfallMm: Number(rainfallMm) || 0,
      tempC: Number(tempC) || 28,
      stormDurationHrs: Number(stormDurationHrs) || 1,
      tripId,
      trip,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Error in weather-impact simulation route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
