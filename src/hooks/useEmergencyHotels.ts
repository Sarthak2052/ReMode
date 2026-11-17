"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmergencyHotelItem } from "@/app/api/hotels/nearby/route";

export type EmergencyHotel = EmergencyHotelItem;

export interface UseEmergencyHotelsResult {
  hotels: EmergencyHotel[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Client-side React hook to fetch and manage live emergency overnight accommodation
 * when Nugen AI evaluates a disruption status as CANCELLED or MISSED_CONNECTION.
 */
export function useEmergencyHotels(
  status: string | undefined | null,
  locationQuery: string = "Mumbai"
): UseEmergencyHotelsResult {
  const [hotels, setHotels] = useState<EmergencyHotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize status for reliable evaluation
  const normalizedStatus = (status || "").toUpperCase().trim();
  const isEmergencyDisruption =
    normalizedStatus === "CANCELLED" ||
    normalizedStatus === "MISSED_CONNECTION" ||
    normalizedStatus === "SEVERELY DELAYED";

  const fetchHotels = useCallback(async () => {
    if (!isEmergencyDisruption) {
      setHotels([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean location string (e.g. "BOM (Mumbai)" -> "Mumbai")
      const cleanCity =
        locationQuery
          .replace(/\(.*?\)/g, "")
          .replace(/Station|Airport|Terminal|Junction|Central|Hub/gi, "")
          .trim() || "Mumbai";

      const res = await fetch(`/api/hotels/nearby?city=${encodeURIComponent(cleanCity)}`);

      if (!res.ok) {
        throw new Error(`Hotels API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.hotels || [];
      setHotels(list);
    } catch (err: any) {
      console.warn("[useEmergencyHotels] Failed to fetch emergency hotels:", err);
      setError(err?.message || "Failed to load emergency accommodations");
    } finally {
      setIsLoading(false);
    }
  }, [isEmergencyDisruption, locationQuery]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return {
    hotels,
    isLoading,
    error,
    refetch: fetchHotels,
  };
}

export default useEmergencyHotels;
