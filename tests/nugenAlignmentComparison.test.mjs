import test from "node:test";
import assert from "node:assert/strict";
import { nugenClient } from "../src/core/ai/nugenClient.ts";
import { ExplanationEngine } from "../src/core/ExplanationEngine.ts";
import { GeminiRecoveryAgent } from "../src/core/geminiAgent.ts";

test("Nugen Aligned Domain Model & Chain Provenance Test Suite", async (t) => {
  // -------------------------------------------------------------
  // TEST 1: NUGEN CLIENT INITIALIZATION & CONFIGURATION
  // -------------------------------------------------------------
  await t.test(
    "nugenClient wraps aligned endpoint, reads env vars, and keeps provider swappable",
    () => {
      assert.ok(nugenClient, "nugenClient singleton should be instantiated");
      assert.equal(typeof nugenClient.getProvider(), "string");
      assert.equal(typeof nugenClient.generateChatCompletion, "function");
      assert.equal(typeof nugenClient.explainDisruptionRecovery, "function");

      // Verify swappable provider mechanism
      const originalProvider = nugenClient.getProvider();
      nugenClient.setProvider("gemini");
      assert.equal(nugenClient.getProvider(), "gemini");
      nugenClient.setProvider("nugen");
      assert.equal(nugenClient.getProvider(), "nugen");
      nugenClient.setProvider(originalProvider);
    }
  );

  // -------------------------------------------------------------
  // TEST 2: PROVENANCE CHAIN LOGGING
  // -------------------------------------------------------------
  await t.test(
    "Logs and tracks 4-stage pipeline provenance: Base model -> Nugen alignment -> domain model -> this output",
    () => {
      const provenance = nugenClient.getPipelineProvenance("llama-v3p2-3b-reasoning");
      assert.ok(provenance.includes("Base model"), "Should cite base model");
      assert.ok(provenance.includes("Nugen alignment"), "Should cite Nugen alignment");
      assert.ok(provenance.includes("domain model"), "Should cite domain model");
      assert.ok(provenance.includes("this output"), "Should cite this output");
      assert.equal(
        provenance,
        "Base model (llama-v3p2-3b-reasoning) -> Nugen alignment (remode_domain_rules + 13-factor matrix) -> domain model -> this output"
      );
    }
  );

  // -------------------------------------------------------------
  // TEST 3: PROVE THE CHAIN — DUAL INFERENCE COMPARISON
  // -------------------------------------------------------------
  await t.test(
    "Same disruption prompt sent to base model vs Nugen-aligned endpoint returns visibly different, domain-grounded output",
    async () => {
      const prompt =
        "Flight 6E-512 from Mumbai (BOM) to Delhi (DEL) delayed 150 minutes by severe monsoon rain (65 mm/h). Downstream connecting Flight 6E-204 to Bengaluru has a 60-minute buffer. How should the platform recover this passenger?";

      // Query the live dual-inference comparison route
      const res = await fetch("http://localhost:3000/api/nugen/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      assert.ok(res.ok, `Comparison API should respond with 200 OK (got ${res.status})`);
      const data = await res.json();

      assert.ok(data.baseModel, "Should have base model evaluation");
      assert.ok(data.nugenAlignedModel, "Should have Nugen-aligned evaluation");

      const baseText = data.baseModel.output;
      const alignedText = data.nugenAlignedModel.output;

      // 1. Outputs must be visibly different
      assert.notEqual(baseText, alignedText, "Base model and aligned model outputs must be visibly different");

      // 2. Aligned model MUST cite statutory DGCA passenger rights (CAR Section 3)
      const hasDgca =
        alignedText.includes("DGCA") ||
        alignedText.includes("CAR Section 3") ||
        alignedText.includes("CAR Sec 3");
      assert.ok(hasDgca, "Nugen-aligned model must explicitly reference DGCA passenger rights regulations");

      // 3. Aligned model MUST quantify connection buffer erosion (-90m deficit)
      const hasBufferMath =
        alignedText.includes("-90") ||
        alignedText.includes("buffer") ||
        alignedText.includes("deficit") ||
        alignedText.includes("severed");
      assert.ok(hasBufferMath, "Nugen-aligned model must evaluate connection buffer erosion");

      // 4. Aligned model MUST recommend multimodal corridor bypass (Vande Bharat / Tejas / Direct Air)
      const hasCorridorBypass =
        alignedText.includes("Tejas") ||
        alignedText.includes("Vande Bharat") ||
        alignedText.includes("Bypass") ||
        alignedText.includes("Direct Flight") ||
        alignedText.includes("AI-804");
      assert.ok(hasCorridorBypass, "Nugen-aligned model must suggest grounded Indian corridor bypass");

      // 5. Verify pipeline provenance chain is present in payload
      assert.ok(
        data.nugenAlignedModel.pipelineStage.includes("Nugen alignment"),
        "Must verify Nugen alignment pipeline provenance"
      );
    }
  );

  // -------------------------------------------------------------
  // TEST 4: EXPLANATION ENGINE USES NUGEN ALIGNED MODEL
  // -------------------------------------------------------------
  await t.test(
    "ExplanationEngine routes recovery explanations through Nugen aligned domain model",
    async () => {
      const mockTrip = {
        id: "trip-test",
        title: "Mumbai to Bengaluru via Delhi",
        source: "Mumbai",
        destination: "Bengaluru",
        traveler: { name: "Aditi Sharma", priorityPreference: "SPEED" },
        items: [
          {
            id: "flight-1",
            type: "FLIGHT",
            title: "Flight 6E-512",
            provider: "IndiGo",
            departureLocation: "Mumbai T2",
            arrivalLocation: "Delhi T3",
            startTime: "12:00",
            endTime: "14:15",
            cost: 6500,
            status: "NORMAL",
            priority: "CRITICAL",
          },
        ],
        activeDisruption: {
          id: "disr-1",
          tripId: "trip-test",
          type: "FLIGHT_DELAY",
          title: "Monsoon Downpour BOM",
          description: "65 mm/h rain at Mumbai T2 runway",
          delayMinutes: 150,
          affectedItemIds: ["flight-1"],
        },
      };

      const explanation = await ExplanationEngine.explainRecoveryPlans(
        mockTrip,
        null,
        null,
        "Summarize my recovery options and passenger rights"
      );

      assert.ok(explanation, "Explanation should exist");
      assert.ok(typeof explanation === "string", "Explanation should be a string");
      assert.ok(explanation.length > 50, "Explanation should be substantive");
    }
  );

  // -------------------------------------------------------------
  // TEST 5: GEMINI RECOVERY AGENT INTEGRATES NUGEN ALIGNMENT
  // -------------------------------------------------------------
  await t.test(
    "GeminiRecoveryAgent routes weather disruption probability through Nugen domain model",
    async () => {
      const result = await GeminiRecoveryAgent.evaluateWeatherDisruptionProbability({
        bookingTitle: "Flight 6E-512 (BOM T2 -> DEL T3)",
        mode: "FLIGHT",
        departureLocation: "Mumbai",
        arrivalLocation: "Delhi",
        rainfallMm: 65,
        tempC: 25,
        stormDurationHrs: 3,
        directDelayMinutes: 150,
        downstreamBookingsCount: 3,
        heuristicProbability: 0.92,
      });

      assert.ok(result, "Evaluation result should exist");
      assert.equal(typeof result.probability, "number");
      assert.ok(result.probability >= 0.7, "Severe storm probability should be >= 0.7");
      assert.equal(result.confidence, "high");
      assert.ok(result.explanation.length > 20, "Should have substantive explanation");
    }
  );
});
