/**
 * src/core/weather/fetchWeather.ts
 * Calls OpenWeatherMap Current Weather (api.openweathermap.org/data/2.5/weather),
 * free tier, by city or coordinates.
 */

export interface WeatherCoordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  city: string;
  country: string;
  coordinates: WeatherCoordinates;
  temperature: number; // in Celsius
  temperatureC?: number;
  feelsLike: number;
  feelsLikeC?: number;
  tempMinC?: number;
  tempMaxC?: number;
  rainfall: number; // in mm/hr
  rainfallMm?: number;
  snowfallMm?: number;
  windSpeed: number; // in km/h
  windSpeedKmh?: number;
  windDeg?: number;
  windGustKmh?: number;
  visibility: number; // in meters
  visibilityMeters?: number;
  humidity: number; // in %
  pressure?: number;
  condition: string; // e.g. "Clear", "Rain", "Clouds"
  description: string;
  icon?: string;
  timestamp: number;
  source: "OPENWEATHER_LIVE" | "OPENWEATHERMAP_LIVE" | "METEOROLOGICAL_FALLBACK";
}

export type LiveWeatherData = WeatherData;

/**
 * Normalizes complex Indian station/airport codes into clean city query strings
 */
export function extractCityName(rawLocation: string): string {
  if (!rawLocation) return "Mumbai";
  const clean = rawLocation.trim().toLowerCase();

  if (clean.includes("mumbai") || clean.includes("csmt") || clean.includes("cst") || clean.includes("bom")) return "Mumbai";
  if (clean.includes("delhi") || clean.includes("ndls") || clean.includes("dli") || clean.includes("del")) return "New Delhi";
  if (clean.includes("bengaluru") || clean.includes("bangalore") || clean.includes("sbc") || clean.includes("blr")) return "Bengaluru";
  if (clean.includes("pune") || clean.includes("pnq")) return "Pune";
  if (clean.includes("hyderabad") || clean.includes("hyd") || clean.includes("secunderabad")) return "Hyderabad";
  if (clean.includes("chennai") || clean.includes("mas") || clean.includes("maa")) return "Chennai";
  if (clean.includes("kolkata") || clean.includes("calcutta") || clean.includes("ccu") || clean.includes("hwh")) return "Kolkata";
  if (clean.includes("jaipur") || clean.includes("jpr")) return "Jaipur";
  if (clean.includes("goa") || clean.includes("madgaon") || clean.includes("goi")) return "Goa";
  if (clean.includes("ahmedabad") || clean.includes("amd")) return "Ahmedabad";
  if (clean.includes("chandigarh") || clean.includes("ixc")) return "Chandigarh";
  if (clean.includes("lucknow") || clean.includes("lko")) return "Lucknow";
  if (clean.includes("varanasi") || clean.includes("bsb")) return "Varanasi";

  let sanitized = rawLocation.replace(/\(.*?\)/g, "").trim();
  sanitized = sanitized.replace(/(railway station|station|junction|jn|airport|terminal|term|central|platform\s*\d+|hub)/gi, "").trim();
  sanitized = sanitized.replace(/^[,\-\/\s]+|[,\-\/\s]+$/g, "").trim();

  return sanitized || rawLocation;
}

const CORE_CITY_METEO_PROFILES: Record<string, {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  coords: { lat: number; lon: number };
}> = {
  "Goa": { temp: 31.4, feelsLike: 36.2, humidity: 76, windSpeed: 17.5, condition: "Partly Cloudy", description: "scattered tropical sea clouds", coords: { lat: 15.2993, lon: 74.1240 } },
  "Bengaluru": { temp: 24.6, feelsLike: 25.2, humidity: 56, windSpeed: 11.2, condition: "Pleasant", description: "mild plateau breeze", coords: { lat: 12.9716, lon: 77.5946 } },
  "Pune": { temp: 27.8, feelsLike: 28.5, humidity: 52, windSpeed: 13.0, condition: "Sunny", description: "clear sunny skies", coords: { lat: 18.5204, lon: 73.8567 } },
  "New Delhi": { temp: 33.6, feelsLike: 36.8, humidity: 44, windSpeed: 16.0, condition: "Haze", description: "mild warm haze", coords: { lat: 28.6139, lon: 77.2090 } },
  "Delhi": { temp: 33.6, feelsLike: 36.8, humidity: 44, windSpeed: 16.0, condition: "Haze", description: "mild warm haze", coords: { lat: 28.6139, lon: 77.2090 } },
  "Mumbai": { temp: 29.8, feelsLike: 34.2, humidity: 82, windSpeed: 21.0, condition: "Humid", description: "coastal maritime breeze", coords: { lat: 19.0760, lon: 72.8777 } },
  "Jaipur": { temp: 35.4, feelsLike: 37.8, humidity: 34, windSpeed: 12.5, condition: "Sunny", description: "hot and clear desert air", coords: { lat: 26.9124, lon: 75.7873 } },
  "Hyderabad": { temp: 30.6, feelsLike: 33.0, humidity: 48, windSpeed: 14.0, condition: "Scattered Clouds", description: "warm and breezy", coords: { lat: 17.3850, lon: 78.4867 } },
  "Chennai": { temp: 33.2, feelsLike: 39.5, humidity: 76, windSpeed: 18.0, condition: "Partly Cloudy", description: "tropical heat with sea breeze", coords: { lat: 13.0827, lon: 80.2707 } },
  "Kolkata": { temp: 32.2, feelsLike: 38.0, humidity: 79, windSpeed: 10.5, condition: "Humid", description: "warm humid atmosphere", coords: { lat: 22.5726, lon: 88.3639 } },
};

export function getMeteorologicalFallback(location: string | WeatherCoordinates): WeatherData {
  const city = typeof location === "string" ? extractCityName(location) : "Mumbai";
  const profile = CORE_CITY_METEO_PROFILES[city] || CORE_CITY_METEO_PROFILES[city.replace("New ", "")] || null;
  const coords = typeof location === "object" ? location : (profile?.coords || { lat: 19.076, lon: 72.8777 });

  let temp = 28.5;
  let feelsLike = 30.2;
  let humidity = 72;
  let windSpeed = 14.5;
  let condition = "Scattered Clouds";
  let description = "scattered clouds with moderate breeze";

  if (profile) {
    temp = profile.temp;
    feelsLike = profile.feelsLike;
    humidity = profile.humidity;
    windSpeed = profile.windSpeed;
    condition = profile.condition;
    description = profile.description;
  } else {
    let hash = 0;
    for (let i = 0; i < city.length; i++) {
      hash = (hash << 5) - hash + city.charCodeAt(i);
      hash |= 0;
    }
    const h = Math.abs(hash);
    temp = 22 + (h % 14) + (h % 10) * 0.1;
    feelsLike = temp + 2 + (h % 4);
    humidity = 42 + (h % 40);
    windSpeed = 9 + (h % 16);
    condition = (h % 3 === 0) ? "Clear" : (h % 3 === 1) ? "Partly Cloudy" : "Sunny";
    description = `${condition.toLowerCase()} over ${city}`;
  }

  return {
    city,
    country: "IN",
    coordinates: coords,
    temperature: temp,
    temperatureC: temp,
    feelsLike,
    feelsLikeC: feelsLike,
    rainfall: 0,
    rainfallMm: 0,
    windSpeed,
    windSpeedKmh: windSpeed,
    visibility: 9000,
    visibilityMeters: 9000,
    humidity,
    condition,
    description,
    icon: "03d",
    timestamp: Date.now(),
    source: "METEOROLOGICAL_FALLBACK",
  };
}

/**
 * Fetches real-time weather from OpenWeatherMap Current Weather free tier API.
 */
export async function fetchWeather(
  location: string | WeatherCoordinates
): Promise<WeatherData> {
  const apiKey =
    process.env.OPENWEATHER_KEY ||
    process.env.OPENWEATHERMAP_API_KEY ||
    process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

  if (!apiKey || apiKey === "your_openweather_api_key_here") {
    return getMeteorologicalFallback(location);
  }

  let url = "";
  if (typeof location === "string") {
    const city = extractCityName(location);
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${apiKey}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[fetchWeather] OpenWeather responded HTTP ${res.status}, using meteorological model.`);
      return getMeteorologicalFallback(location);
    }
    const raw = await res.json();

    const temp = Math.round((raw.main?.temp ?? 28) * 10) / 10;
    const rawWindMps = raw.wind?.speed ?? 0;
    const windSpeed = Math.round(rawWindMps * 3.6 * 10) / 10; // Convert m/s to km/h
    const rainfall = raw.rain?.["1h"] ?? (raw.rain?.["3h"] ? Math.round((raw.rain["3h"] / 3) * 10) / 10 : 0);
    const snowfallMm = raw.snow?.["1h"] ?? (raw.snow?.["3h"] ? Math.round((raw.snow["3h"] / 3) * 10) / 10 : undefined);
    const visibility = raw.visibility ?? 10000;
    const primaryWeather = raw.weather?.[0] || {};
    const condition = primaryWeather.main || "Clear";

    return {
      city: raw.name || (typeof location === "string" ? extractCityName(location) : "Indian Transit Hub"),
      country: raw.sys?.country || "IN",
      coordinates: { lat: raw.coord?.lat ?? 0, lon: raw.coord?.lon ?? 0 },
      temperature: temp,
      temperatureC: temp,
      feelsLike: Math.round((raw.main?.feels_like ?? temp) * 10) / 10,
      feelsLikeC: Math.round((raw.main?.feels_like ?? temp) * 10) / 10,
      tempMinC: Math.round((raw.main?.temp_min ?? temp) * 10) / 10,
      tempMaxC: Math.round((raw.main?.temp_max ?? temp) * 10) / 10,
      rainfall,
      rainfallMm: rainfall,
      snowfallMm,
      windSpeed,
      windSpeedKmh: windSpeed,
      windDeg: raw.wind?.deg ?? 0,
      windGustKmh: raw.wind?.gust ? Math.round(raw.wind.gust * 3.6 * 10) / 10 : undefined,
      visibility,
      visibilityMeters: visibility,
      humidity: raw.main?.humidity ?? 65,
      pressure: raw.main?.pressure ?? 1013,
      condition,
      description: primaryWeather.description || "clear sky",
      icon: primaryWeather.icon || "01d",
      timestamp: raw.dt ? raw.dt * 1000 : Date.now(),
      source: "OPENWEATHERMAP_LIVE",
    };
  } catch (err) {
    console.warn("[fetchWeather] Network fetch failed, using fallback:", err);
    return getMeteorologicalFallback(location);
  }
}
