import { assessWeatherRisk, computeTransitWeatherDelay } from "./weatherApi.ts";
import type { ItemType } from "../types";

export interface NugenEvaluationResult {
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  delayMinutes: number;
  status: "ON_TIME" | "DELAYED" | "SEVERELY DELAYED" | "CANCELLED" | "MISSED_CONNECTION";
  reasoning: string;
  recoveryAction: string;
  source: "nugen_aligned_model" | "local_rules";
}

export interface NugenEvaluationInput {
  mode: "FLIGHT" | "TRAIN" | "ROAD";
  weather: {
    temperature?: number;
    windSpeed?: number;
    rainfall?: number;
    visibility?: number;
    condition?: string;
  };
  routeContext?: {
    from: string;
    to: string;
    scheduledDeparture?: string;
    connectionBufferMinutes?: number;
  };
}

/**
 * Local deterministic domain rules fallback (from ReMode physics & RecoveryEngine)
 * Used whenever Nugen API is unavailable, times out, or returns invalid payload.
 */
export function evaluateLocalRules(input: any): NugenEvaluationResult {
  const mode = input?.mode || "FLIGHT";
  const weather = input?.weather || {};
  const routeContext = input?.routeContext || {};
  const temp = weather.temperature ?? 28;
  const wind = weather.windSpeed ?? 15;
  const rain = weather.rainfall ?? 0;
  const vis = weather.visibility ?? 10000;
  const cond =
    weather.condition ??
    (rain >= 40
      ? "Thunderstorm"
      : rain >= 20
      ? "Heavy Rain"
      : wind >= 50
      ? "Gale"
      : "Partly Cloudy");

  const riskAssessment = assessWeatherRisk({
    temperature: temp,
    windSpeed: wind,
    rainfall: rain,
    visibility: vis,
    condition: cond,
  });

  let itemType: ItemType = "FLIGHT";
  if (mode === "TRAIN") itemType = "TRAIN";
  else if (mode === "ROAD") itemType = "TAXI";

  const mockCondition = {
    city: routeContext?.from || "Corridor Hub",
    country: "IN",
    coordinates: { lat: 19.076, lon: 72.8777 },
    temperature: temp,
    feelsLike: temp,
    tempMin: temp - 2,
    tempMax: temp + 2,
    humidity: 75,
    pressure: 1010,
    windSpeed: wind,
    windDeg: 180,
    rainfall: rain,
    visibility: vis,
    condition: cond,
    description: cond.toLowerCase(),
    icon: "10d",
    timestamp: Date.now(),
    source: "SIMULATION" as const,
    riskAssessment,
  };

  const delayResult = computeTransitWeatherDelay(itemType, mockCondition);
  const delayMinutes = delayResult.delayMinutes;
  const riskLevel = delayResult.risk;

  // Determine transit operational status
  let status: NugenEvaluationResult["status"] = "ON_TIME";
  if (delayMinutes === 0) {
    status = "ON_TIME";
  } else if (delayMinutes < 60) {
    status = "DELAYED";
  } else if (delayMinutes < 120) {
    status = "SEVERELY DELAYED";
  } else {
    status = "CANCELLED";
  }

  // Detailed domain-specific reasoning
  let reasoning = delayResult.reason;
  if (!reasoning || reasoning.startsWith("Nominal")) {
    reasoning = `Meteorological conditions (${cond}, Wind: ${wind} km/h, Rain: ${rain} mm/h) are within safe nominal thresholds for ${mode} transit.`;
  }

  // Actionable recovery recommendation
  let recoveryAction = "All transit operations running within nominal schedule buffer.";
  if (status === "CANCELLED") {
    recoveryAction =
      "🚨 Mandatory ground stop active. Execute automated DGCA/IRCTC refund claim and reroute passenger via priority ground alternative.";
  } else if (status === "SEVERELY DELAYED") {
    recoveryAction =
      `⚠️ High schedule drift (+${delayMinutes}m). Pre-activate flexible ground alternative and alert downstream hotel/transfer services.`;
  } else if (status === "DELAYED") {
    recoveryAction =
      `🌧️ Moderate weather delay (+${delayMinutes}m). Monitor corridor Doppler radar reflectivity and preserve 30m connection buffer.`;
  }

  return {
    riskLevel,
    delayMinutes,
    status,
    reasoning,
    recoveryAction,
    source: "local_rules",
  };
}

/**
 * Sends disruption evaluation inference requests to Nugen's OpenAI-compatible endpoint
 * with automatic fallback to ReMode domain rules on network or schema error.
 */
export async function evaluateWithNugen(
  requestData: any
): Promise<NugenEvaluationResult> {
  const apiKey = process.env.NUGEN_API_KEY;
  const modelId = process.env.NUGEN_MODEL_ID || "nugen-intelligence-v1";
  const primaryUrl =
    process.env.NUGEN_BASE_URL || "https://api.nugen.in/api/v3/chat/completions";
  const inferenceUrl = "https://api.nugen.in/api/v3/inference/chat/completions";

  // Check if API key is configured
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_nugen_api_key_here") {
    console.warn("[NugenService] Missing NUGEN_API_KEY. Using local domain rules fallback.");
    return evaluateLocalRules(requestData);
  }

  const systemPrompt =
    'You are the ReMode Weather-Driven Disruption Engine. Evaluate transit weather impacts according to domain rules. Return ONLY a valid JSON object matching: {"riskLevel": "LOW"|"MODERATE"|"HIGH"|"CRITICAL", "delayMinutes": number, "status": "ON_TIME"|"DELAYED"|"SEVERELY DELAYED"|"CANCELLED"|"MISSED_CONNECTION", "reasoning": string, "recoveryAction": string}.';

  const userPrompt =
    typeof requestData === "string"
      ? requestData
      : JSON.stringify(requestData, null, 2);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let res = await fetch(primaryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    // If chat/completions route returns 404, retry with documented inference/chat/completions route
    if (res.status === 404 && primaryUrl.endsWith("/chat/completions") && !primaryUrl.includes("/inference/")) {
      res = await fetch(inferenceUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
        }),
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `[NugenService] API responded with HTTP ${res.status}. Falling back to local domain rules.`
      );
      return evaluateLocalRules(requestData);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("[NugenService] Empty response content from Nugen. Falling back to local rules.");
      return evaluateLocalRules(requestData);
    }

    // Strip code fences if returned (e.g. ```json ... ```)
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);

    if (
      parsed.riskLevel &&
      typeof parsed.delayMinutes === "number" &&
      parsed.status &&
      parsed.reasoning &&
      parsed.recoveryAction
    ) {
      return {
        riskLevel: parsed.riskLevel,
        delayMinutes: parsed.delayMinutes,
        status: parsed.status,
        reasoning: parsed.reasoning,
        recoveryAction: parsed.recoveryAction,
        source: "nugen_aligned_model",
      };
    } else {
      console.warn(
        "[NugenService] Incomplete JSON schema returned from Nugen. Falling back to local rules."
      );
      return evaluateLocalRules(requestData);
    }
  } catch (err: any) {
    console.warn(
      `[NugenService] Inference error (${err.message || err}). Falling back to local rules.`
    );
    return evaluateLocalRules(requestData);
  }
}

// Backward-compatible alias for existing imports
export const evaluateDisruptionWithNugen = evaluateWithNugen;
