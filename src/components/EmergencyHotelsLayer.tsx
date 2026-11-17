"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { patchLeafletSafety } from "@/lib/leafletSafety";
import { calculateBearing } from "@/components/LiveCabTracker";
import type { EmergencyHotelItem } from "@/app/api/hotels/nearby/route";

patchLeafletSafety(L);

export interface UseLeafletEmergencyHotelsOptions {
  city: string;
  destinationCoords?: [number, number];
  selectedHotelId?: string | null;
  onSelectHotel?: (hotel: EmergencyHotelItem) => void;
  speedMs?: number;
}

/**
 * Generates an organic road route from the destination hub to the chosen hotel
 */
export function generateHotelTransferRoute(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const steps = 10;
  const route: [number, number][] = [];
  const deltaLat = end[0] - start[0];
  const deltaLng = end[1] - start[1];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Parametric linear interpolation with slight road curve
    const lat = start[0] + deltaLat * t;
    const lng = start[1] + deltaLng * t;
    const curve = Math.sin(t * Math.PI) * 0.0014;
    route.push([
      Number((lat + curve).toFixed(5)),
      Number((lng + curve * 0.7).toFixed(5)),
    ]);
  }
  // Ensure the final point is exactly the hotel coords
  route[route.length - 1] = [end[0], end[1]];
  return route;
}

/**
 * Custom Leaflet Hook:
 * 1. Plots and makes ALL emergency hotels in the destination city visible with interactive markers.
 * 2. Prominently highlights the hotel chosen by the user.
 * 3. Shows the transfer route from the destination hub to that chosen hotel.
 * 4. Animates an emergency hotel shuttle with live Ola Maps Distance Matrix ETA.
 */
export function useLeafletEmergencyHotels(
  map: L.Map | null,
  isActive: boolean,
  options: UseLeafletEmergencyHotelsOptions
) {
  const [hotels, setHotels] = useState<EmergencyHotelItem[]>([]);
  const [activeHotelId, setActiveHotelId] = useState<string | null>(
    options.selectedHotelId || null
  );

  // Sync with prop if changed from external component
  useEffect(() => {
    if (options.selectedHotelId) {
      setActiveHotelId(options.selectedHotelId);
    }
  }, [options.selectedHotelId]);

  // Fetch hotels for destination city
  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;
    const fetchHotels = async () => {
      try {
        const cleanCity =
          (options.city || "Mumbai")
            .replace(/\(.*?\)/g, "")
            .replace(/Station|Airport|Terminal|Junction|Central|Hub/gi, "")
            .trim() || "Mumbai";

        const res = await fetch(`/api/hotels/nearby?city=${encodeURIComponent(cleanCity)}`);
        if (res.ok) {
          const data = await res.json();
          const list: EmergencyHotelItem[] = Array.isArray(data) ? data : data?.hotels || [];
          if (isMounted) {
            setHotels(list);
            if (!activeHotelId && list.length > 0) {
              setActiveHotelId(list[0].id);
            }
          }
        }
      } catch (err) {
        console.warn("[useLeafletEmergencyHotels] Failed to fetch hotels for map:", err);
      }
    };

    fetchHotels();
    return () => {
      isMounted = false;
    };
  }, [isActive, options.city]);

  // Main Leaflet Layer Effect
  useEffect(() => {
    if (!map || !isActive || hotels.length === 0) return;

    const layerGroup = L.layerGroup().addTo(map);

    // Identify the chosen hotel (or fallback to first)
    const chosenHotel =
      hotels.find((h) => h.id === activeHotelId) || hotels[0];

    // Determine the departure transit hub coordinate
    const startHubCoords: [number, number] =
      options.destinationCoords || [19.0886, 72.8679];

    // -------------------------------------------------------------
    // 1. RENDER ALL HOTELS VISIBLE ON THE MAP
    // -------------------------------------------------------------
    hotels.forEach((hotel) => {
      const isChosen = hotel.id === chosenHotel.id;

      const markerHtml = `
        <div style="position: relative; width: ${isChosen ? "46px" : "36px"}; height: ${
        isChosen ? "46px" : "36px"
      }; display: flex; align-items: center; justify-content: center; background: ${
        isChosen ? "#0F1B2B" : "#1A2636"
      }; border: ${isChosen ? "3px solid #10B981" : "2px solid rgba(255,255,255,0.4)"}; border-radius: 50%; box-shadow: ${
        isChosen
          ? "0 0 20px rgba(16, 185, 129, 0.9), 0 4px 10px rgba(0,0,0,0.6)"
          : "0 2px 6px rgba(0,0,0,0.4)"
      }; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;">
          <span style="font-size: ${isChosen ? "22px" : "17px"}; line-height: 1;">🏨</span>
          ${
            isChosen
              ? `<span style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #10B981; border-radius: 50%; border: 2px solid #0F1B2B; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
              : ""
          }
        </div>
      `;

      const hotelIcon = L.divIcon({
        className: `custom-hotel-marker-${hotel.id}`,
        html: markerHtml,
        iconSize: isChosen ? [46, 46] : [36, 36],
        iconAnchor: isChosen ? [23, 23] : [18, 18],
        popupAnchor: [0, -24],
      });

      const hotelMarker = L.marker(hotel.coordinates, {
        icon: hotelIcon,
        zIndexOffset: isChosen ? 1000 : 500,
      }).addTo(layerGroup);

      // Tooltip with Star Rating & Nightly Price
      hotelMarker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: white; padding: 5px 9px; border-radius: 8px; border: 1.5px solid ${
          isChosen ? "#10B981" : "rgba(255,255,255,0.3)"
        }; box-shadow: 0 4px 14px rgba(0,0,0,0.6); pointer-events: none; white-space: nowrap;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>🏨</span>
            <span style="color: ${isChosen ? "#10B981" : "#F3F4F6"};">${hotel.name}</span>
            ${
              isChosen
                ? `<span style="background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid #10B981; padding: 1px 4px; border-radius: 4px; font-size: 9px;">SELECTED</span>`
                : ""
            }
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px; font-size: 10px; color: #9CA3AF;">
            <span style="color: #FBBF24;">★ ${hotel.rating}</span>
            <span style="color: #34D399; font-weight: bold;">${hotel.price}</span>
            <span>${hotel.distance}</span>
          </div>
        </div>`,
        {
          permanent: isChosen,
          direction: "top",
          offset: [0, -24],
        }
      );

      // Click to select hotel and switch route
      hotelMarker.on("click", () => {
        setActiveHotelId(hotel.id);
        options.onSelectHotel?.(hotel);
      });
    });

    // -------------------------------------------------------------
    // 2. SHOW ROUTE TO HOTEL FROM THE DESTINATION HUB
    // -------------------------------------------------------------
    const transferRoute = generateHotelTransferRoute(
      startHubCoords,
      chosenHotel.coordinates
    );

    // Glowing Polyline for the transfer corridor
    L.polyline(transferRoute, {
      color: "#10B981",
      weight: 5,
      opacity: 0.9,
      dashArray: "8, 6",
    }).addTo(layerGroup);

    // Start Hub Departure Marker (e.g. Airport Terminal or Station)
    L.marker(startHubCoords, {
      icon: L.divIcon({
        className: "hub-departure-marker",
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: #EF4444; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8); color: white; font-size: 14px;">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
      zIndexOffset: 900,
    })
      .bindTooltip(
        `<span style="font-family: monospace; font-size: 10px; font-weight: bold; background: #0F1B2B; color: #EF4444; padding: 3px 6px; border-radius: 6px; border: 1px solid #EF4444;">Destination Arrival Hub</span>`,
        { permanent: true, direction: "bottom", offset: [0, 16] }
      )
      .addTo(layerGroup);

    // -------------------------------------------------------------
    // 3. ANIMATED HOTEL SHUTTLE TRACKER WITH LIVE OLA MAPS ETA
    // -------------------------------------------------------------
    let shuttleIndex = 0;
    let shuttleBearing = calculateBearing(transferRoute[0], transferRoute[1]);

    const getShuttleIcon = (bearing: number, arrived = false) =>
      L.divIcon({
        className: "custom-hotel-shuttle-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #0F1B2B; border: 2.5px solid #10B981; border-radius: 50%; box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); transform: rotate(${Math.round(
            bearing
          )}deg); transition: transform 0.4s ease-out;">
            <span style="font-size: 20px; line-height: 1;">🚐</span>
            ${
              !arrived
                ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #34D399; border-radius: 50%; border: 2px solid #0F1B2B; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #10B981; border-radius: 50%; border: 2px solid #0F1B2B;"></span>`
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

    const shuttleMarker = L.marker(transferRoute[0], {
      icon: getShuttleIcon(shuttleBearing),
      zIndexOffset: 2000,
    }).addTo(layerGroup);

    let shuttleEtaString = "Calculating Hotel Shuttle ETA...";
    shuttleMarker.bindTooltip(
      `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: white; padding: 4px 8px; border-radius: 6px; border: 1.5px solid #10B981; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
        🚐 Hotel Shuttle ➔ <span style="color: #34D399;">${shuttleEtaString}</span>
      </div>`,
      { permanent: true, direction: "top", offset: [0, -22] }
    );

    // Query live Ola Maps Distance Matrix API
    const updateShuttleEta = async (pos: [number, number]) => {
      try {
        const destPos = chosenHotel.coordinates;
        const res = await fetch(
          `/api/cabs/distance-matrix?origin=${pos[0]},${pos[1]}&destination=${destPos[0]},${destPos[1]}&vehicleType=cab`
        );
        if (res.ok) {
          const data = await res.json();
          if (typeof data.duration === "number") {
            const mins = Math.max(1, Math.round(data.duration / 60));
            shuttleEtaString = mins <= 1 ? "Arriving now (< 1 min)" : `Arriving in ${mins} mins`;
            const km = typeof data.distance === "number" ? ` (${(data.distance / 1000).toFixed(1)} km)` : "";
            shuttleMarker.setTooltipContent(
              `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: white; padding: 4px 8px; border-radius: 6px; border: 1.5px solid #10B981; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
                🚐 Shuttle ➔ <span style="color: #34D399;">${chosenHotel.name}: ${shuttleEtaString}${km}</span>
              </div>`
            );
          }
        }
      } catch (e) {
        console.warn("[useLeafletEmergencyHotels] Distance matrix fetch error:", e);
      }
    };

    updateShuttleEta(transferRoute[0]);

    const speed = options.speedMs || 1000;
    const interval = setInterval(() => {
      shuttleIndex++;
      if (shuttleIndex >= transferRoute.length) {
        clearInterval(interval);
        shuttleMarker.setIcon(getShuttleIcon(shuttleBearing, true));
        shuttleMarker.setTooltipContent(
          `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: #10B981; padding: 4px 8px; border-radius: 6px; border: 1.5px solid #10B981; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            🏨 Arrived at ${chosenHotel.name} (Emergency Re-Accommodation Active)
          </div>`
        );
        return;
      }

      const prev = transferRoute[shuttleIndex - 1];
      const curr = transferRoute[shuttleIndex];
      shuttleBearing = calculateBearing(prev, curr);
      shuttleMarker.setIcon(getShuttleIcon(shuttleBearing));
      shuttleMarker.setLatLng(curr);

      if (shuttleIndex % 4 === 0) {
        updateShuttleEta(curr);
      }
    }, speed);

    return () => {
      clearInterval(interval);
      map.removeLayer(layerGroup);
    };
  }, [
    map,
    isActive,
    hotels,
    activeHotelId,
    options.city,
    options.destinationCoords,
    options.speedMs,
  ]);

  return {
    hotels,
    activeHotelId,
    setActiveHotelId,
  };
}

export default useLeafletEmergencyHotels;
