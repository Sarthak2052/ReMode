import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather, fetchWeatherForecast } from "@/lib/weatherApi";

export const dynamic = "force-dynamic";

// In-memory weather cache (60-second TTL) for responsive city updates
const weatherCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || searchParams.get("location") || "Mumbai";
    const mode = searchParams.get("mode") || "current"; // 'current' or 'forecast'
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    let locationParam: string | { lat: number; lon: number } = city;
    let cacheKey = `${mode}:${city.toLowerCase().trim()}`;
    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        locationParam = { lat, lon };
        cacheKey = `${mode}:${lat.toFixed(2)},${lon.toFixed(2)}`;
      }
    }

    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=300" },
      });
    }

    if (mode === "forecast") {
      const forecast = await fetchWeatherForecast(locationParam);
      const responseData = {
        success: forecast !== null,
        count: forecast ? forecast.length : 0,
        forecast,
      };
      if (forecast) {
        weatherCache.set(cacheKey, { data: responseData, expiresAt: Date.now() + CACHE_TTL_MS });
      }
      return NextResponse.json(responseData, {
        headers: { "Cache-Control": "public, s-maxage=300" },
      });
    }

    const weather = await fetchCurrentWeather(locationParam);
    const responseData = { success: weather !== null, weather };
    if (weather) {
      weatherCache.set(cacheKey, { data: responseData, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  } catch (error: any) {
    console.error("Error in weather API route:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
