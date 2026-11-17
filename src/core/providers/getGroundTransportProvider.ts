import type { IGroundTransportProvider } from "./GroundTransportProvider.ts";
import { MockGroundTransportProvider } from "./MockGroundTransportProvider.ts";

import { OlaMapsProvider } from "./OlaMapsProvider.ts";

let cachedProvider: IGroundTransportProvider | null = null;

/**
 * Returns the configured GroundTransportProvider singleton.
 * Defaults to MockGroundTransportProvider unless OLA_MAPS_API_KEY is configured.
 */
export function getGroundTransportProvider(): IGroundTransportProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const apiKey = process.env.OLA_MAPS_API_KEY || process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  if (apiKey && apiKey.trim() !== "") {
    try {
      cachedProvider = new OlaMapsProvider(apiKey);
      return cachedProvider;
    } catch (e) {
      console.warn("Failed to initialize OlaMapsProvider, falling back to MockGroundTransportProvider:", e);
    }
  }

  cachedProvider = new MockGroundTransportProvider();
  return cachedProvider;
}

/**
 * For testing purposes: allows overriding or resetting the ground transport provider.
 */
export function setGroundTransportProvider(provider: IGroundTransportProvider | null): void {
  cachedProvider = provider;
}
