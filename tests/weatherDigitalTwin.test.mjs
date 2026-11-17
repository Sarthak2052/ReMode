import test from "node:test";
import assert from "node:assert/strict";
import { extractCityName, assessWeatherRisk, computeTransitWeatherDelay, fetchCurrentWeather } from "../src/lib/weatherApi.ts";

test("Weather-Driven Digital Twin & Risk Physics Test Suite", async (t) => {
  await t.test("extractCityName maps transit codes and complex station names to clean cities", () => {
    assert.equal(extractCityName("Mumbai (CSMT)"), "Mumbai");
    assert.equal(extractCityName("CSMT"), "Mumbai");
    assert.equal(extractCityName("Platform 18, Mumbai CSMT"), "Mumbai");
    assert.equal(extractCityName("NDLS"), "New Delhi");
    assert.equal(extractCityName("New Delhi Railway Station"), "New Delhi");
    assert.equal(extractCityName("SBC"), "Bengaluru");
    assert.equal(extractCityName("Hazur Sahib Nanded"), "Nanded");
    assert.equal(extractCityName("PNQ"), "Pune");
    assert.equal(extractCityName("BOM"), "Mumbai");
  });

  await t.test("assessWeatherRisk correctly evaluates calm meteorological conditions", () => {
    const risk = assessWeatherRisk({
      temperature: 26,
      windSpeed: 12,
      rainfall: 0,
      visibility: 10000,
      condition: "Clear"
    });
    assert.equal(risk.overallRisk, "LOW");
    assert.equal(risk.flightRisk, "LOW");
    assert.equal(risk.trainRisk, "LOW");
    assert.equal(risk.roadRisk, "LOW");
    assert.equal(risk.recommendedDelayMinutes, 0);
  });

  await t.test("assessWeatherRisk triggers CRITICAL aviation and railway warnings under severe monsoon gale", () => {
    const risk = assessWeatherRisk({
      temperature: 28,
      windSpeed: 75, // Severe crosswinds
      rainfall: 65,  // Rail track waterlogging
      visibility: 400,
      condition: "Thunderstorm"
    });
    assert.equal(risk.overallRisk, "CRITICAL");
    assert.equal(risk.flightRisk, "CRITICAL");
    assert.equal(risk.trainRisk, "CRITICAL");
    assert.equal(risk.roadRisk, "CRITICAL");
    assert.ok(risk.recommendedDelayMinutes >= 120);
    assert.ok(risk.breakdown.some((b) => b.includes("Aviation Critical")));
    assert.ok(risk.breakdown.some((b) => b.includes("Railways Critical")));
  });

  await t.test("assessWeatherRisk detects track buckling risk at extreme temperatures", () => {
    const risk = assessWeatherRisk({
      temperature: 48,
      windSpeed: 15,
      rainfall: 0,
      visibility: 8000,
      condition: "Haze"
    });
    assert.equal(risk.trainRisk, "HIGH");
    assert.ok(risk.breakdown.some((b) => b.includes("buckling")));
  });

  await t.test("computeTransitWeatherDelay assigns modal delays appropriately", () => {
    const mockWeather = {
      city: "Mumbai",
      country: "IN",
      coordinates: { lat: 19.076, lon: 72.8777 },
      temperature: 29,
      feelsLike: 33,
      tempMin: 28,
      tempMax: 30,
      humidity: 90,
      pressure: 1008,
      windSpeed: 75,
      rainfall: 65,
      visibility: 500,
      condition: "Thunderstorm",
      description: "heavy thunderstorm",
      icon: "11d",
      timestamp: Date.now(),
      source: "OPENWEATHER_LIVE",
      riskAssessment: assessWeatherRisk({
        temperature: 29,
        windSpeed: 75,
        rainfall: 65,
        visibility: 500,
        condition: "Thunderstorm"
      })
    };

    const flightDelay = computeTransitWeatherDelay("FLIGHT", mockWeather);
    assert.equal(flightDelay.risk, "CRITICAL");
    assert.equal(flightDelay.delayMinutes, 120);
    assert.equal(flightDelay.isDisrupted, true);

    const trainDelay = computeTransitWeatherDelay("TRAIN", mockWeather);
    assert.equal(trainDelay.risk, "CRITICAL");
    assert.equal(trainDelay.delayMinutes, 150);
    assert.equal(trainDelay.isDisrupted, true);

    const roadDelay = computeTransitWeatherDelay("TAXI", mockWeather);
    assert.equal(roadDelay.risk, "CRITICAL");
    assert.equal(roadDelay.delayMinutes, 90);
    assert.equal(roadDelay.isDisrupted, true);
  });

  await t.test("Live OpenWeather fetch queries live API with API key", async () => {
    if (!process.env.OPENWEATHER_KEY && !process.env.NEXT_PUBLIC_OPENWEATHER_KEY) {
      console.log("Skipping live OpenWeather fetch test: No API key in environment");
      return;
    }

    const data = await fetchCurrentWeather("Mumbai");
    assert.ok(data, "Expected valid weather data from OpenWeather");
    assert.ok(typeof data.temperature === "number");
    assert.ok(typeof data.windSpeed === "number");
    assert.ok(data.coordinates.lat !== 0);
    assert.ok(data.riskAssessment);
  });
});
