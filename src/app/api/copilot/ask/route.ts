import { NextRequest, NextResponse } from "next/server";
import { getTripById, getRecoveryData } from "@/lib/tripService";
import { ExplanationEngine } from "@/core/ExplanationEngine";
import { GeminiRecoveryAgent } from "@/core/geminiAgent";
import { antiSpam } from "@/lib/antiSpam";
import { fetchCurrentWeather } from "@/lib/weatherApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tripId = "trip-denver-2026", message = "" } = body;
    const userId =
      body.userId ||
      body.phoneNumber ||
      body.phone ||
      body.email ||
      req.headers.get("x-user-id") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "default-traveler";

    if (message.trim()) {
      const spamCheck = antiSpam.validateAndRecord(userId, message.trim());
      if (!spamCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: spamCheck.error,
            reason: spamCheck.reason,
            reply: `⚠️ ${spamCheck.error}`,
          },
          { status: 429 }
        );
      }
    }

    const trip = await getTripById(tripId);

    // 1. Validate trip
    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // 2. Fetch live real-time weather data for both corridor endpoints as inputs to the AI model
    let sourceWeather = null;
    let destWeather = null;
    let weather = null;
    try {
      const srcName = trip.source || "Mumbai";
      const dstName = trip.destination || "Bengaluru";
      [sourceWeather, destWeather] = await Promise.all([
        fetchCurrentWeather(srcName),
        fetchCurrentWeather(dstName),
      ]);
      weather = destWeather || sourceWeather;
    } catch (e) {
      console.warn("Weather fetch for AI copilot skipped:", e);
    }

    // 3. Load recovery context if an active disruption exists
    let impact = null;
    let plans = null;

    if (trip.activeDisruption) {
      try {
        const recoveryData = await getRecoveryData(tripId);
        impact = recoveryData.impact;
        plans = recoveryData.plans;
      } catch (error) {
        console.error("Error fetching recovery data for Copilot:", error);
      }
    }

    // 4. Run GeminiRecoveryAgent grounded analysis (covers all 12 benchmarks, Himachal rules, multimodal alternatives, and weather telemetry)
    const agentResult = await GeminiRecoveryAgent.analyzeDisruption(
      trip,
      impact,
      plans,
      message,
      { sourceWeather, destWeather }
    );

    // 5. Run ExplanationEngine with Live Weather telemetry input for Gemini reasoning
    let explanation = "";
    try {
      explanation = await ExplanationEngine.explainRecoveryPlans(
        trip,
        impact,
        plans,
        message,
        weather
      );
    } catch (err) {
      explanation = agentResult.groundedAdvice;
    }

    // 5. Pick the most comprehensive grounded reply
    let finalReply = agentResult.groundedAdvice;
    if (
      agentResult.source === "GEMINI_ADK_AGENT" ||
      agentResult.model.includes("ADK") ||
      agentResult.model.includes("Travel Planner")
    ) {
      finalReply = agentResult.groundedAdvice;
    } else if (
      explanation &&
      !explanation.startsWith("Hello! I am your ReMode Travel Copilot. How can I assist") &&
      !explanation.startsWith("### ✈️ Current Itinerary Overview:")
    ) {
      finalReply = explanation;
    }

    // 6. Return unified Copilot response with full metadata
    return NextResponse.json({
      reply: finalReply,
      agentSource: agentResult.source,
      model: agentResult.model,
      benchmarkScenario: agentResult.scenario?.scenarioId || null,
      disruptionType: trip.activeDisruption?.type || agentResult.scenario?.disruptionType || null,
      feasibility: impact?.feasibility || (trip.activeDisruption ? "RECOVERABLE" : "NO_ACTIVE_DISRUPTION"),
      candidatesCount: plans?.length || agentResult.multimodalAlternatives.length,
      multimodalAlternatives: agentResult.multimodalAlternatives,
      refundBreakdown: agentResult.refundBreakdown,
      policyViolationsPrevented: agentResult.policyViolationsPrevented,
      suggestedFollowUps: agentResult.suggestedFollowUps || [],
      toolCallsExecuted: agentResult.toolCallsExecuted || [],
    });
  } catch (error: any) {
    console.error("Copilot API route error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Copilot error",
      },
      { status: 500 }
    );
  }
}