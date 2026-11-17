import {
  evaluateWithNugen,
  NugenEvaluationInput,
  NugenEvaluationResult,
} from "@/lib/nugenService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body: NugenEvaluationInput = await request.json();

    if (!body || !body.mode) {
      return Response.json(
        { error: "Missing required parameter: 'mode' ('FLIGHT' | 'TRAIN' | 'ROAD')" },
        { status: 400 }
      );
    }

    // 1. Pass body to evaluateWithNugen(body)
    const result: NugenEvaluationResult = await evaluateWithNugen(body);

    // 2. Cascading Rule Check:
    // If incoming body.routeContext?.connectionBufferMinutes is defined and falls below 30 minutes
    // due to the AI's delayMinutes, strictly override the status to MISSED_CONNECTION.
    const buffer = body.routeContext?.connectionBufferMinutes;
    if (typeof buffer === "number") {
      const remainingBuffer = buffer - (result.delayMinutes || 0);
      if (remainingBuffer < 30) {
        result.status = "MISSED_CONNECTION";
        const breachNotice =
          `🚨 Cascading Connection Breach: Weather delay (+${result.delayMinutes}m) erodes scheduled buffer (${buffer}m) down to ${remainingBuffer}m (below 30m safe minimum). ` +
          `Downstream connection severed. ReMode autonomous re-routing triggered: Auto-reserve priority multimodal fallback leg.`;

        result.recoveryAction = `${breachNotice}\n\n${result.recoveryAction}`;
      }
    }

    // 3. Return the result using Response.json(result, { status: 200 })
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[NugenEvaluateRoute] Evaluation error:", error);
    return Response.json(
      { error: error?.message || "Failed to process simulation evaluation" },
      { status: 500 }
    );
  }
}

/**
 * GET handler: Enables opening the URL directly in the browser to confirm
 * the API endpoint is active, view documentation, and run a live demo assessment.
 */
export async function GET() {
  const sampleRequest: NugenEvaluationInput = {
    mode: "FLIGHT",
    weather: {
      temperature: 28,
      windSpeed: 35,
      rainfall: 25,
      visibility: 2500,
      condition: "Rain",
    },
    routeContext: {
      from: "Mumbai (BOM)",
      to: "Bengaluru (BLR)",
      scheduledDeparture: "10:00",
      connectionBufferMinutes: 45,
    },
  };

  const sampleAssessment = await evaluateWithNugen(sampleRequest);

  return Response.json(
    {
      service: "ReMode Nugen Domain-Aligned AI Disruption Engine",
      status: "ACTIVE_AND_OPERATIONAL",
      hackCelestialCompliance: {
        stage1_base_model: "qwen-v2p5-0p5b-instruct",
        stage2_nugen_alignment_corpus: [
          "remode_domain_rules.txt (ID: document_01m3g38xsfw68j4m)",
          "nugen_training_dataset2.json (ID: document_01m3g3hr4yj68gpa)",
          "benchmark.jsonl.txt (ID: document_01m3g49d1g6d1bge)"
        ],
        stage3_domain_specific_model: process.env.NUGEN_MODEL_ID || "alignment_01m3g6j4jr03s88t",
        stage4_project_integration: "ReMode Multimodal Weather Disruption Digital Twin Sandbox",
        pipeline: "Base AI Model (Qwen 2.5 0.5B Instruct) → Nugen Alignment/Customization (remode_domain_rules.txt) → Domain-Specific Model (alignment_01m3g6j4jr03s88t) → ReMode Digital Twin Integration"
      },
      method: "POST",
      endpoint: "/api/simulation/nugen-evaluate",
      usage: "Send a POST request with JSON body containing mode, weather, and routeContext.",
      demoEvaluation: sampleAssessment,
      schema: {
        mode: "'FLIGHT' | 'TRAIN' | 'ROAD'",
        weather: {
          temperature: "number (Celsius)",
          windSpeed: "number (km/h)",
          rainfall: "number (mm/hr)",
          visibility: "number (meters)",
          condition: "string",
        },
        routeContext: {
          from: "string (departure station/airport)",
          to: "string (arrival station/airport)",
          scheduledDeparture: "string (e.g. '10:00')",
          connectionBufferMinutes: "number (e.g. 45)",
        },
      },
    },
    { status: 200 }
  );
}
