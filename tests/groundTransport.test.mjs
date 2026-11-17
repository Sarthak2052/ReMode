import test from "node:test";
import assert from "node:assert/strict";
import { MockGroundTransportProvider } from "../src/core/providers/MockGroundTransportProvider.ts";
import { getGroundTransportProvider, setGroundTransportProvider } from "../src/core/providers/getGroundTransportProvider.ts";

test("GroundTransportProvider - Mock implementation", async (t) => {
  const provider = new MockGroundTransportProvider();

  await t.test("geocodes known Indian hubs", async () => {
    const loc = await provider.geocode("DEL T3");
    assert.ok(loc, "Expected geocoded location");
    assert.equal(loc.name, "Indira Gandhi International Airport (DEL T3)");
    assert.equal(loc.coordinates.lat, 28.5562);
  });

  await t.test("calculates realistic road route between Indian hubs", async () => {
    const route = await provider.calculateRoadRoute("DEL T1", "NDLS");
    assert.ok(route, "Expected road route");
    assert.ok(route.distanceMeters > 5000, "Expected distance > 5km");
    assert.ok(route.durationSeconds > 600, "Expected duration > 10 min");
    assert.ok(route.coordinates.length > 2, "Expected waypoints in route");
    assert.ok(route.steps && route.steps.length > 0, "Expected turn-by-turn steps");
    assert.ok(route.estimatedCost.min > 0, "Expected positive estimated cost");
  });

  await t.test("computes distance matrix between multiple origins and destinations", async () => {
    const matrix = await provider.getDistanceMatrix(["DEL T3", "NDLS"], ["BOM T2", "Jaipur Jn"]);
    assert.equal(matrix.length, 2);
    assert.equal(matrix[0].length, 2);
    assert.equal(matrix[0][0].status, "OK");
    assert.ok(matrix[0][0].distanceMeters > 0);
  });

  await t.test("factory defaults to MockGroundTransportProvider when no API key", () => {
    const origKey1 = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
    const origKey2 = process.env.OLA_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
    delete process.env.OLA_MAPS_API_KEY;
    setGroundTransportProvider(null);
    try {
      const defaultProvider = getGroundTransportProvider();
      assert.ok(defaultProvider);
      assert.equal(defaultProvider.name, "MockGroundTransportProvider");
    } finally {
      if (origKey1 !== undefined) process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY = origKey1;
      if (origKey2 !== undefined) process.env.OLA_MAPS_API_KEY = origKey2;
      setGroundTransportProvider(null);
    }
  });
});
