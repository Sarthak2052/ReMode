import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLocalRules, evaluateDisruptionWithNugen, evaluateWithNugen } from "../src/lib/nugenService.ts";

test("Nugen Intelligence AI & Disruption Engine Evaluation Suite", async (t) => {
  await t.test("evaluateLocalRules computes nominal clear weather conditions", () => {
    const res = evaluateLocalRules({
      mode: "FLIGHT",
      weather: {
        temperature: 27,
        windSpeed: 10,
        rainfall: 0,
        visibility: 10000,
        condition: "Clear",
      },
      routeContext: {
        from: "Mumbai",
        to: "Bengaluru",
      },
    });

    assert.equal(res.riskLevel, "LOW");
    assert.equal(res.delayMinutes, 0);
    assert.equal(res.status, "ON_TIME");
    assert.equal(res.source, "local_rules");
    assert.ok(res.reasoning.includes("nominal"));
  });

  await t.test("evaluateLocalRules triggers CRITICAL cancellation for severe aviation crosswinds", () => {
    const res = evaluateLocalRules({
      mode: "FLIGHT",
      weather: {
        temperature: 25,
        windSpeed: 75,
        rainfall: 45,
        visibility: 400,
        condition: "Thunderstorm",
      },
      routeContext: {
        from: "Mumbai",
        to: "Bengaluru",
      },
    });

    assert.equal(res.riskLevel, "CRITICAL");
    assert.ok(res.delayMinutes >= 120);
    assert.equal(res.status, "CANCELLED");
    assert.equal(res.source, "local_rules");
    assert.ok(res.reasoning.includes("crosswinds") || res.reasoning.includes("limits"));
    assert.ok(res.recoveryAction.includes("ground stop") || res.recoveryAction.includes("refund"));
  });

  await t.test("evaluateLocalRules triggers railway track waterlogging alert for heavy downpour", () => {
    const res = evaluateLocalRules({
      mode: "TRAIN",
      weather: {
        temperature: 26,
        windSpeed: 30,
        rainfall: 65,
        visibility: 2000,
        condition: "Heavy Rain",
      },
      routeContext: {
        from: "Mumbai CSMT",
        to: "Hazur Sahib Nanded",
      },
    });

    assert.equal(res.riskLevel, "CRITICAL");
    assert.ok(res.delayMinutes >= 150);
    assert.equal(res.status, "CANCELLED");
    assert.ok(res.reasoning.includes("waterlog") || res.reasoning.includes("rail"));
  });

  await t.test("evaluateDisruptionWithNugen provides robust fallback to local rules when API unavailable", async () => {
    const res = await evaluateDisruptionWithNugen({
      mode: "ROAD",
      weather: {
        temperature: 28,
        windSpeed: 20,
        rainfall: 30,
        visibility: 1500,
        condition: "Rain",
      },
      routeContext: {
        from: "Pune",
        to: "Mumbai",
        connectionBufferMinutes: 45,
      },
    });

    assert.ok(res);
    assert.ok(["LOW", "MODERATE", "HIGH", "CRITICAL"].includes(res.riskLevel));
    assert.ok(typeof res.delayMinutes === "number");
    assert.ok(res.source === "local_rules" || res.source === "nugen_aligned_model");
    assert.ok(res.reasoning.length > 0);
    assert.ok(res.recoveryAction.length > 0);
  });

  await t.test("evaluateWithNugen evaluates incoming requestData and returns valid domain assessment", async () => {
    const res = await evaluateWithNugen({
      mode: "ROAD",
      weather: {
        temperature: 30,
        windSpeed: 25,
        rainfall: 40,
        visibility: 2000,
        condition: "Heavy Rain",
      },
      routeContext: {
        from: "Delhi",
        to: "Agra",
        connectionBufferMinutes: 60,
      },
    });

    assert.ok(res);
    assert.ok(["LOW", "MODERATE", "HIGH", "CRITICAL"].includes(res.riskLevel));
    assert.ok(typeof res.delayMinutes === "number");
    assert.ok(["local_rules", "nugen_aligned_model"].includes(res.source));
  });
});
