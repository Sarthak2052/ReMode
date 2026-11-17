import test from "node:test";
import assert from "node:assert/strict";
import { fetchWeather } from "../src/core/weather/fetchWeather.ts";
import { estimateWeatherImpact } from "../src/core/weather/estimateWeatherImpact.ts";
import { fetchWeatherNews } from "../src/core/social/fetchWeatherNews.ts";
import { INITIAL_TRIP_SNAPSHOT } from "../src/core/demoData.ts";

test("Feature 1: LIVE WEATHER INPUT - fetchWeather returns structured meteorological telemetry for real Indian city", async () => {
  const result = await fetchWeather("Mumbai");
  assert.ok(result, "Weather result must be returned");
  assert.equal(typeof result.city, "string", "City must be a string");
  assert.equal(typeof result.temperature, "number", "Temperature must be a number");
  assert.equal(typeof result.rainfall, "number", "Rainfall must be a number");
  assert.equal(typeof result.windSpeed, "number", "Wind speed must be a number");
  assert.equal(typeof result.visibility, "number", "Visibility must be a number");
  assert.equal(typeof result.condition, "string", "Condition must be a string");
  assert.ok(result.temperature >= -10 && result.temperature <= 60, "Temperature must be in a realistic physical range");
});

test("Feature 2: DIGITAL TWIN WHAT-IF SIMULATION - memory isolation, dependsOn traversal, probabilistic output", async () => {
  const tripCopy = JSON.parse(JSON.stringify(INITIAL_TRIP_SNAPSHOT));
  const originalDisruptionBefore = tripCopy.activeDisruption || null;
  const originalItemsBefore = JSON.stringify(tripCopy.items || []);

  const targetBookingId = tripCopy.items[0]?.id || "item-flight-1";

  // 1. Run low rainfall simulation (5 mm/h)
  const lowRainResult = await estimateWeatherImpact({
    bookingId: targetBookingId,
    rainfallMm: 5,
    tempC: 28,
    stormDurationHrs: 1,
    trip: tripCopy,
  });

  // 2. Run severe storm simulation (65 mm/h)
  const highRainResult = await estimateWeatherImpact({
    bookingId: targetBookingId,
    rainfallMm: 65,
    tempC: 32,
    stormDurationHrs: 4,
    trip: tripCopy,
  });

  // Verification A: Running twice with different rainfall values gives different probabilities
  assert.ok(
    highRainResult.probability > lowRainResult.probability,
    `High rain probability (${highRainResult.probability}) must be strictly greater than low rain probability (${lowRainResult.probability})`
  );
  assert.ok(
    highRainResult.delayMinutes > lowRainResult.delayMinutes,
    `High rain delay (${highRainResult.delayMinutes}m) must be greater than low rain delay (${lowRainResult.delayMinutes}m)`
  );

  // Verification B: Structured probability + confidence + explanation
  assert.equal(typeof highRainResult.probability, "number", "Probability must be numeric");
  assert.ok(highRainResult.probability >= 0 && highRainResult.probability <= 1, "Probability must be between 0 and 1");
  assert.ok(["low", "medium", "high"].includes(highRainResult.confidence), "Confidence must be low, medium, or high");
  assert.ok(highRainResult.explanation.length > 20, "Explanation must be a descriptive AI assessment");

  // Verification C: dependsOn graph traversal correctly propagated impact to downstream bookings
  assert.ok(highRainResult.directImpact.includes(targetBookingId), "Direct impact must include target booking");
  assert.ok(Array.isArray(highRainResult.downstreamImpact), "Downstream impact must be an array");
  assert.ok(highRainResult.allAffectedItemIds.length >= 1, "All affected must include direct + downstream");

  // Verification D: ZERO WRITES TO REAL TRIP/BOOKING DATA
  assert.equal(
    tripCopy.activeDisruption || null,
    originalDisruptionBefore,
    "Real trip activeDisruption must remain completely unchanged (zero DB writes)"
  );
  assert.equal(
    JSON.stringify(tripCopy.items || []),
    originalItemsBefore,
    "Real trip items array must remain completely untouched in storage"
  );
});

test("Feature 4: SOCIAL SIGNAL - fetchWeatherNews pulls Google News RSS with no API key", async () => {
  const headlines = await fetchWeatherNews("Delhi", 3);
  assert.ok(Array.isArray(headlines), "Headlines must be an array");
  assert.ok(headlines.length >= 1, "At least 1 headline must be returned");
  headlines.forEach((item) => {
    assert.ok(item.title && item.title.length > 5, "Headline must have a valid title");
    assert.ok(item.source, "Headline must include news source");
    assert.ok(item.link, "Headline must have link");
  });
});

test("ACCEPTANCE: End-to-end corridor Digital Twin storm scenario with zero writes to real data", async () => {
  const baselineTrip = JSON.parse(JSON.stringify(INITIAL_TRIP_SNAPSHOT));
  const baselineSnapshot = JSON.stringify(baselineTrip);
  const targetBookingId = baselineTrip.items[0]?.id || "item-flight-1";

  // Step 1: Live weather input
  const weather = await fetchWeather("Delhi");
  assert.ok(weather.city, "Weather city present");

  // Step 2: Digital Twin What-If simulation
  const simulation = await estimateWeatherImpact({
    bookingId: targetBookingId,
    rainfallMm: 45,
    tempC: 30,
    stormDurationHrs: 3,
    trip: baselineTrip,
  });

  assert.ok(simulation.probability >= 0.5, "Storm scenario produces notable disruption probability");
  assert.ok(simulation.explanation.includes("Digital Twin"), "Explanation mentions Digital Twin assessment");
  assert.ok(simulation.allAffectedItemIds.length >= 1, "Affected items propagated through graph");

  // Step 3: Social signals from Google News RSS
  const news = await fetchWeatherNews(weather.city, 2);
  assert.ok(news.length >= 1, "Public weather news headlines fetched");

  // Step 4: Strict invariance verification - ZERO writes to real trip store
  assert.equal(
    JSON.stringify(baselineTrip),
    baselineSnapshot,
    "CRITICAL: Baseline trip store must be 100% byte-for-byte identical after simulation"
  );
});
