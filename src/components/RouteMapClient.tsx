"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { patchLeafletSafety } from "@/lib/leafletSafety";

patchLeafletSafety(L);
import {
  generateRoutePath,
  GeoRouteData,
  INDIAN_CITIES_COORDS,
} from "@/core/dataset/geoRoutes";
import { DisruptionEvent, RecoveryPlan } from "@/types";
import {
  Maximize2,
  Minimize2,
  Navigation,
  AlertTriangle,
  Plane,
  Train,
  Car,
  Bus,
  Layers,
  Sparkles,
  Info,
  CloudRain,
  Hotel,
} from "lucide-react";
import { useLeafletWeatherRadar } from "./WeatherRadarLayer";
import { useLeafletLiveCabTracker } from "./LiveCabTracker";
import { useLeafletEmergencyHotels } from "./EmergencyHotelsLayer";
import type { SimulatedWeatherImpact } from "@/core/RecoveryEngine";

export interface RouteMapProps {
  source: string;
  destination: string;
  currentTransitType?: string;
  activeDisruption?: DisruptionEvent | null;
  selectedRecoveryPlan?: RecoveryPlan | null;
  simulatedImpact?: (SimulatedWeatherImpact & {
    isSimulated?: boolean;
    delayMinutes?: number;
    probability?: number;
    affectedItemIds?: string[];
    explanation?: string;
  }) | any | null;
  height?: string;
  className?: string;
  title?: string;
  showPrecipitationTiles?: boolean;
}

export const RouteMapClient: React.FC<RouteMapProps> = ({
  source,
  destination,
  currentTransitType = "TRAIN",
  activeDisruption,
  selectedRecoveryPlan,
  simulatedImpact,
  height = "380px",
  className = "",
  title = "Live Transit Route Tracing",
  showPrecipitationTiles = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showWeatherRadar, setShowWeatherRadar] = useState(showPrecipitationTiles);
  const [simulateStormCell, setSimulateStormCell] = useState(false);

  useEffect(() => {
    if (showPrecipitationTiles) {
      setShowWeatherRadar(true);
    }
  }, [showPrecipitationTiles]);

  const isSimulatedDisruption = !!(
    simulatedImpact &&
    ((simulatedImpact.probability ?? 0) >= 0.2 || simulatedImpact.isSimulated)
  );

  useEffect(() => {
    if (isSimulatedDisruption) {
      setShowWeatherRadar(true);
      setSimulateStormCell(true);
    }
  }, [isSimulatedDisruption]);

  const [showLiveCab, setShowLiveCab] = useState(false);
  const [showLiveVolvo, setShowLiveVolvo] = useState(false);
  const [showEmergencyHotels, setShowEmergencyHotels] = useState(false);
  const [chosenHotelId, setChosenHotelId] = useState<string | null>(null);
  const [activePathCoords, setActivePathCoords] = useState<[number, number][]>([]);

  const [activeTabMode, setActiveTabMode] = useState<
    "AUTO" | "TRAIN" | "FLIGHT" | "TRANSFER" | "BUS"
  >("AUTO");
  const [routeStats, setRouteStats] = useState<{
    distanceKm: number;
    duration: string;
    mode: string;
    name: string;
  }>({
    distanceKm: 460,
    duration: "11h 20m",
    mode: "TRAIN",
    name: "Indian Railways Mainline Track",
  });

  // Determine active modality
  const effectiveModality = React.useMemo(() => {
    if (activeTabMode !== "AUTO") return activeTabMode;
    if (selectedRecoveryPlan) {
      const label = (selectedRecoveryPlan.label || "").toLowerCase();
      const id = (selectedRecoveryPlan.id || "").toLowerCase();
      if (label.includes("flight") || label.includes("airways") || id.includes("flight"))
        return "FLIGHT";
      if (label.includes("cab") || label.includes("innova") || id.includes("cab"))
        return "TRANSFER";
      if (label.includes("bus") || label.includes("volvo") || id.includes("bus"))
        return "BUS";
      if (label.includes("train") || label.includes("vande") || id.includes("train"))
        return "TRAIN";
    }
    const cleanType = (currentTransitType || "TRAIN").toUpperCase();
    if (cleanType === "FLIGHT") return "FLIGHT";
    if (cleanType === "BUS") return "BUS";
    if (cleanType === "TRANSFER" || cleanType === "TAXI") return "TRANSFER";
    return "TRAIN";
  }, [activeTabMode, selectedRecoveryPlan, currentTransitType]);

  const isDisruptedNow =
    (Boolean(activeDisruption) && !selectedRecoveryPlan) || isSimulatedDisruption;

  // Compute approximate route center for radar visualization
  const routeCenter = React.useMemo<[number, number]>(() => {
    const srcCoords = INDIAN_CITIES_COORDS[(source || "").toLowerCase()] || [19.076, 72.8777];
    const dstCoords = INDIAN_CITIES_COORDS[(destination || "").toLowerCase()] || [19.153, 77.301];
    return [
      (srcCoords[0] + dstCoords[0]) / 2,
      (srcCoords[1] + dstCoords[1]) / 2,
    ];
  }, [source, destination]);

  // Live Doppler Precipitation Radar Overlay Hook
  useLeafletWeatherRadar(mapInstanceRef.current, showWeatherRadar, {
    simulateStormCell,
    routeCenter,
    sourceName: source,
    destName: destination,
  });

  // Live Animated Cab Tracker with Ola Maps Distance Matrix ETA Hook
  useLeafletLiveCabTracker(mapInstanceRef.current, showLiveCab, {
    routePolyline: activePathCoords,
    destination: activePathCoords.length > 0 ? activePathCoords[activePathCoords.length - 1] : undefined,
    vehicleType: "CAB",
    cabName: "ReMode Ola Cab",
    speedMs: 900,
  });

  // Live Animated Volvo Bus / Excursion Cruiser Tracker with Ola Maps Distance Matrix ETA Hook
  useLeafletLiveCabTracker(mapInstanceRef.current, showLiveVolvo, {
    routePolyline: activePathCoords,
    destination: activePathCoords.length > 0 ? activePathCoords[activePathCoords.length - 1] : undefined,
    vehicleType: "VOLVO",
    cabName: "Volvo 9600 Luxury Sleeper",
    speedMs: 1200,
  });

  // Live Emergency Hotels Layer: plots all visible hotels + traces route from destination hub to chosen hotel
  const {
    hotels: mapHotels,
    activeHotelId: currentHotelId,
    setActiveHotelId: selectMapHotel,
  } = useLeafletEmergencyHotels(mapInstanceRef.current, showEmergencyHotels, {
    city: destination,
    destinationCoords:
      activePathCoords.length > 0
        ? activePathCoords[activePathCoords.length - 1]
        : undefined,
    selectedHotelId: chosenHotelId,
    onSelectHotel: (hotel) => {
      setChosenHotelId(hotel.id);
    },
  });

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center of India
    const map = L.map(mapContainerRef.current, {
      center: [17.5, 75.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    // Add Ola Maps raster tiles (Krutrim Cloud) with automatic fallback
    const olaApiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
    const olaTileUrl = `https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=${olaApiKey || ""}`;
    const fallbackTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(olaTileUrl, {
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://olamaps.io">Ola Maps</a> contributors',
    }).addTo(map);

    let hasFallenBack = false;
    tileLayer.on("tileerror", () => {
      if (!hasFallenBack) {
        hasFallenBack = true;
        tileLayer.setUrl(fallbackTileUrl);
      }
    });

    // Reposition zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Invalidate map size after initial render and when resizing
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const onWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onWindowResize);
      try {
        map.stop();
        (map as any)._animatingZoom = false;
        map.remove();
      } catch (err) {
        console.warn("Leaflet map cleanup warning:", err);
      }
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update polylines, markers, and route traces whenever props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    let isMounted = true;
    layerGroup.clearLayers();

    const cleanSrc = source || "Pune";
    const cleanDst = destination || "Goa";

    // 1. Initial fallback route
    const staticRoute = generateRoutePath(
      cleanSrc,
      cleanDst,
      effectiveModality as any,
      isDisruptedNow
    );

    const renderLayers = (
      pathCoords: [number, number][],
      distKm: number,
      durText: string,
      rColor: string,
      rName: string
    ) => {
      if (!isMounted || !layerGroup) return;
      setActivePathCoords(pathCoords);
      layerGroup.clearLayers();

      // Ghost dashed red line if disruption is active
      if (activeDisruption && selectedRecoveryPlan) {
        const disruptedRoute = generateRoutePath(
          cleanSrc,
          cleanDst,
          "TRAIN",
          true
        );
        L.polyline(disruptedRoute.path, {
          color: "#EF4444",
          weight: 3.5,
          opacity: 0.5,
          dashArray: "6, 8",
        }).addTo(layerGroup);

        if (disruptedRoute.disruptionPoint) {
          const hazardIcon = L.divIcon({
            className: "custom-map-icon",
            html: `
              <div class="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-black shadow-[2px_2px_0px_#000] whitespace-nowrap animate-pulse">
                <span>⚠️</span>
                <span>Disrupted Sector</span>
              </div>
            `,
            iconSize: [120, 24],
            iconAnchor: [60, 12],
          });
          L.marker(disruptedRoute.disruptionPoint.coords, {
            icon: hazardIcon,
          }).addTo(layerGroup);
        }
      }

      // Draw Main Active Route Polyline
      L.polyline(pathCoords, {
        color: rColor,
        weight: effectiveModality === "FLIGHT" ? 4 : 5,
        opacity: 0.95,
        dashArray: effectiveModality === "FLIGHT" ? "8, 6" : undefined,
      }).addTo(layerGroup);

      // Outer glow effect
      L.polyline(pathCoords, {
        color: rColor,
        weight: effectiveModality === "FLIGHT" ? 8 : 10,
        opacity: 0.25,
      }).addTo(layerGroup);

      // Origin Marker
      const originCoords = pathCoords[0] || staticRoute.origin.coords;
      const originIcon = L.divIcon({
        className: "custom-map-icon",
        html: `
          <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#0F1B2B] text-[11px] font-extrabold px-3 py-1 rounded-full border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.12)] whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            <span>${cleanSrc}</span>
          </div>
        `,
        iconSize: [140, 28],
        iconAnchor: [70, 14],
      });
      L.marker(originCoords, { icon: originIcon }).addTo(layerGroup);

      // Destination Marker
      const destCoords = pathCoords[pathCoords.length - 1] || staticRoute.destination.coords;
      const destIcon = L.divIcon({
        className: "custom-map-icon",
        html: `
          <div class="flex items-center gap-1.5 bg-[#0F1B2B] text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.18)] whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-[#74BCFB] inline-block shadow-[0_0_6px_#74BCFB]"></span>
            <span>${cleanDst}</span>
          </div>
        `,
        iconSize: [140, 28],
        iconAnchor: [70, 14],
      });
      L.marker(destCoords, { icon: destIcon }).addTo(layerGroup);

      // Midpoint / Transit Icon indicator
      const midIdx = Math.floor(pathCoords.length / 2);
      const midCoords = pathCoords[midIdx] || originCoords;

      let transitEmoji = "🚆";
      let transitBadgeText = "Active Transit";
      let badgeBg = "bg-gradient-to-r from-indigo-600 to-blue-600";

      if (effectiveModality === "FLIGHT") {
        transitEmoji = "✈️";
        transitBadgeText = "Airway Route (Cruise)";
        badgeBg = "bg-gradient-to-r from-[#1C6FD9] to-[#2CD9B8]";
      } else if (effectiveModality === "TRANSFER") {
        transitEmoji = "🚗";
        transitBadgeText = "Ola Maps Road Routing / Express Cab";
        badgeBg = "bg-gradient-to-r from-emerald-600 to-teal-600";
      } else if (effectiveModality === "BUS") {
        transitEmoji = "🚌";
        transitBadgeText = "Super Luxury Volvo Sleeper Corridor";
        badgeBg = "bg-gradient-to-r from-purple-600 to-indigo-600";
      } else if (isSimulatedDisruption) {
        transitEmoji = "⚡";
        transitBadgeText = `Simulated Storm Impact (+${simulatedImpact?.delayMinutes || 60}m • ${Math.round((simulatedImpact?.probability || 0.7) * 100)}% risk)`;
        badgeBg = "bg-gradient-to-r from-red-600 via-amber-600 to-red-600";
      } else if (isDisruptedNow) {
        transitEmoji = "⚠️";
        transitBadgeText = "Track Congestion / Signal Block";
        badgeBg = "bg-gradient-to-r from-red-600 to-rose-600";
      }

      const transitIcon = L.divIcon({
        className: "custom-map-icon",
        html: `
          <div class="inline-flex items-center gap-1.5 ${badgeBg} text-white text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-white/40 shadow-[0_4px_14px_rgba(0,0,0,0.18)] whitespace-nowrap">
            <span>${transitEmoji}</span>
            <span>${transitBadgeText}</span>
          </div>
        `,
        iconSize: [220, 26],
        iconAnchor: [110, 13],
      });
      L.marker(midCoords, { icon: transitIcon }).addTo(layerGroup);

      // Render Simulated Weather Disruption Ripple & Hazard Overlay on Map
      if (simulatedImpact && simulatedImpact.probability > 0.2) {
        const isCritical = simulatedImpact.probability > 0.6;
        const strokeColor = isCritical ? "#EF4444" : "#F59E0B";

        // Visibly highlight the affected route segment with glowing dashed hazard line
        L.polyline(pathCoords, {
          color: strokeColor,
          weight: 6.5,
          opacity: 0.9,
          dashArray: "10, 8",
        }).addTo(layerGroup);

        const hazardCoords: [number, number] = [
          midCoords[0] + 0.05,
          midCoords[1] + 0.05,
        ];

        const simMarkerHtml = `
          <div class="flex items-center gap-1.5 bg-[#0F1B2B] text-white text-[10px] font-black px-3 py-1 rounded-full border-2 ${
            isCritical ? "border-[#EF4444]" : "border-[#F59E0B]"
          } shadow-[0_0_16px_rgba(239,68,68,0.7)] whitespace-nowrap animate-bounce">
            <span class="w-2.5 h-2.5 rounded-full ${
              isCritical ? "bg-[#EF4444]" : "bg-[#F59E0B]"
            } animate-ping"></span>
            <span>⛈️ Simulated Impact: ${Math.round((simulatedImpact.probability || 0.45) * 100)}% Risk (+${
              simulatedImpact.affectedBookings?.[0]?.delayMinutes || simulatedImpact.delayMinutes || 45
            }m delay)</span>
          </div>
        `;

        const simHazardIcon = L.divIcon({
          className: "custom-map-icon",
          html: simMarkerHtml,
          iconSize: [280, 26],
          iconAnchor: [140, 13],
        });

        L.marker(hazardCoords, { icon: simHazardIcon }).addTo(layerGroup);
      }

      // Fit map bounds nicely with padding
      if (pathCoords.length > 0 && mapInstanceRef.current && (mapInstanceRef.current as any)._mapPane) {
        try {
          map.fitBounds(L.latLngBounds(pathCoords), {
            padding: [45, 45],
            maxZoom: 14,
            animate: false,
          });
        } catch {}
      }

      setRouteStats({
        distanceKm: distKm,
        duration: durText,
        mode: effectiveModality,
        name: rName,
      });
    };

    // Render baseline route immediately
    renderLayers(
      staticRoute.path,
      staticRoute.distanceKm,
      staticRoute.durationText,
      staticRoute.routeColor,
      staticRoute.routeName
    );

    // If ground transport, fetch live turn-by-turn road route from Ola Maps API!
    if (effectiveModality === "TRANSFER" || effectiveModality === "BUS") {
      fetch(
        `/api/geo/directions?origin=${encodeURIComponent(cleanSrc)}&destination=${encodeURIComponent(cleanDst)}`
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!isMounted || !data?.route?.coordinates || data.route.coordinates.length < 2) return;
          const liveCoords: [number, number][] = data.route.coordinates.map((c: any) => [
            c.lat,
            c.lng,
          ]);
          const distKm = Math.round(data.route.distanceMeters / 1000);
          const hours = Math.floor(data.route.durationSeconds / 3600);
          const mins = Math.floor((data.route.durationSeconds % 3600) / 60);
          const durText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          renderLayers(
            liveCoords,
            distKm,
            durText,
            effectiveModality === "BUS" ? "#9333EA" : "#16A34A",
            `${cleanSrc} ➔ ${cleanDst} (Ola Maps Live Road Routing)`
          );
        })
        .catch((e) => {
          console.warn("Could not fetch live Ola Maps directions, using default route:", e);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [
    source,
    destination,
    effectiveModality,
    isDisruptedNow,
    activeDisruption,
    selectedRecoveryPlan,
  ]);

  const recenterMap = () => {
    if (!mapInstanceRef.current || !(mapInstanceRef.current as any)._mapPane) return;
    const cleanSrc = source || "Pune";
    const cleanDst = destination || "Goa";
    const route = generateRoutePath(
      cleanSrc,
      cleanDst,
      effectiveModality as any,
      isDisruptedNow
    );
    try {
      mapInstanceRef.current.fitBounds(L.latLngBounds(route.path), {
        padding: [40, 40],
        animate: false,
      });
    } catch {}
  };

  return (
    <div
      className={`relative bg-white/95 backdrop-blur-xl border border-[#74BCFB]/35 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(10,61,115,0.08)] flex flex-col transition-all ${className}`}
    >
      {/* Map Header / Navigation Bar */}
      <div className="bg-gradient-to-r from-white via-[#F8FBFF] to-white px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1C6FD9] to-[#2CD9B8] flex items-center justify-center shadow-[0_4px_12px_rgba(28,111,217,0.25)]">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-sm text-[#0F1B2B] tracking-tight">
              {title}
            </h4>
            <span className="text-[11px] text-[#4A5B70] font-medium flex items-center gap-1.5">
              <span className="font-semibold text-[#1C6FD9]">{source || "Origin"}</span>
              <span className="text-gray-300">&rarr;</span>
              <span className="font-semibold text-[#1C6FD9]">{destination || "Destination"}</span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-500">Real-time Corridor Tracing</span>
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSimulatedDisruption ? (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-300 animate-pulse shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Simulated Storm Impact ({Math.round((simulatedImpact?.probability || 0.7) * 100)}% risk)
            </span>
          ) : isDisruptedNow ? (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 animate-pulse shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Disruption Active
            </span>
          ) : selectedRecoveryPlan ? (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Replacement Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold bg-[#EAF5FF] text-[#1C6FD9] px-3 py-1 rounded-full border border-[#74BCFB]/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              On-Schedule Route
            </span>
          )}

          {/* Live OpenWeather Precipitation Radar Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowWeatherRadar((prev) => !prev);
            }}
            title="Toggle Live OpenWeather Precipitation Radar Overlay"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              showWeatherRadar
                ? "bg-gradient-to-r from-[#0284C7] to-[#1C6FD9] text-white border-transparent shadow-[0_4px_12px_rgba(2,132,199,0.3)] animate-pulse"
                : "bg-white text-[#0F1B2B] border-gray-200 hover:bg-[#F8FBFF] hover:border-[#74BCFB]/50"
            }`}
          >
            <CloudRain className={`w-3.5 h-3.5 ${showWeatherRadar ? "text-white" : "text-[#0284C7]"}`} />
            <span>{showWeatherRadar ? "Radar: ON" : "Radar: OFF"}</span>
          </button>

          {/* Live Cab Tracking Simulation via Ola Maps Distance Matrix */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLiveCab((prev) => !prev);
            }}
            title="Toggle Live Cab Tracking Simulation via Ola Maps Distance Matrix"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
              showLiveCab
                ? "bg-[#2CD9B8] text-[#0F1B2B] border-[#2CD9B8] shadow-sm shadow-[0_0_12px_rgba(44,217,184,0.4)]"
                : "bg-white text-[#0F1B2B] border-[#0F1B2B]/40 hover:bg-gray-100"
            }`}
          >
            <Car className={`w-3 h-3 ${showLiveCab ? "text-[#0F1B2B]" : "text-[#2CD9B8]"}`} />
            <span>{showLiveCab ? "🚖 Cab: ON" : "🚖 Cab: OFF"}</span>
          </button>

          {/* Live Volvo Bus / Excursion Tracking Simulation via Ola Maps Distance Matrix */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLiveVolvo((prev) => !prev);
            }}
            title="Toggle Live Volvo Bus Tracking Simulation via Ola Maps Distance Matrix"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
              showLiveVolvo
                ? "bg-[#9333EA] text-white border-[#9333EA] shadow-sm shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                : "bg-white text-[#0F1B2B] border-[#0F1B2B]/40 hover:bg-gray-100"
            }`}
          >
            <Bus className={`w-3 h-3 ${showLiveVolvo ? "text-white" : "text-[#9333EA]"}`} />
            <span>{showLiveVolvo ? "🚌 Volvo: ON" : "🚌 Volvo: OFF"}</span>
          </button>

          {/* Live Emergency Hotel Accommodation & Route from Destination */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowEmergencyHotels((prev) => !prev);
            }}
            title="Toggle Live Emergency Hotels & Route from Destination Hub"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
              showEmergencyHotels
                ? "bg-[#10B981] text-white border-[#10B981] shadow-sm shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-white text-[#0F1B2B] border-[#0F1B2B]/40 hover:bg-gray-100"
            }`}
          >
            <Hotel className={`w-3 h-3 ${showEmergencyHotels ? "text-white" : "text-[#10B981]"}`} />
            <span>{showEmergencyHotels ? "🏨 Hotels: ON" : "🏨 Hotels: OFF"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              recenterMap();
            }}
            title="Recenter Route"
            className="p-1.5 rounded-xl bg-white border border-gray-200 hover:bg-[#F8FBFF] hover:border-[#74BCFB]/50 transition-all text-[#4A5B70] hover:text-[#1C6FD9] shadow-xs cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modality Tracing Quick Filter Tabs */}
      <div className="bg-[#FAFDFE]/80 backdrop-blur-sm px-4 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[#4A5B70] uppercase tracking-wider text-[10px] font-bold mr-1 shrink-0">
          Trace Mode:
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTabMode("AUTO");
          }}
          className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap text-xs cursor-pointer ${
            activeTabMode === "AUTO"
              ? "bg-[#1C6FD9] text-white shadow-[0_2px_8px_rgba(28,111,217,0.3)]"
              : "bg-white text-[#4A5B70] border border-gray-200/80 hover:bg-gray-50 hover:text-[#0F1B2B]"
          }`}
        >
          Auto (Active)
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTabMode("TRAIN");
          }}
          className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs cursor-pointer ${
            effectiveModality === "TRAIN"
              ? "bg-[#4F46E5] text-white shadow-[0_2px_8px_rgba(79,70,229,0.3)]"
              : "bg-white text-[#4A5B70] border border-gray-200/80 hover:bg-gray-50 hover:text-[#0F1B2B]"
          }`}
        >
          <Train className="w-3 h-3" /> Railways
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTabMode("FLIGHT");
          }}
          className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs cursor-pointer ${
            effectiveModality === "FLIGHT"
              ? "bg-[#0284C7] text-white shadow-[0_2px_8px_rgba(2,132,199,0.3)]"
              : "bg-white text-[#4A5B70] border border-gray-200/80 hover:bg-gray-50 hover:text-[#0F1B2B]"
          }`}
        >
          <Plane className="w-3 h-3" /> Airways
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTabMode("TRANSFER");
          }}
          className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs cursor-pointer ${
            effectiveModality === "TRANSFER"
              ? "bg-[#16A34A] text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)]"
              : "bg-white text-[#4A5B70] border border-gray-200/80 hover:bg-gray-50 hover:text-[#0F1B2B]"
          }`}
        >
          <Car className="w-3 h-3" /> Highway Cab
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveTabMode("BUS");
          }}
          className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs cursor-pointer ${
            effectiveModality === "BUS"
              ? "bg-[#9333EA] text-white shadow-[0_2px_8px_rgba(147,51,234,0.3)]"
              : "bg-white text-[#4A5B70] border border-gray-200/80 hover:bg-gray-50 hover:text-[#0F1B2B]"
          }`}
        >
          <Bus className="w-3 h-3" /> Volvo Bus
        </button>
      </div>

      {/* Leaflet Map Div with Relative Wrap for Floating HUD */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="w-full relative z-0"
        />

        {/* Floating Doppler Weather Radar HUD when Radar is ON */}
        {showWeatherRadar && (
          <div className="absolute top-3 left-3 z-[400] bg-[#0F1B2B]/90 backdrop-blur-md border border-[#2CD9B8]/40 rounded-xl p-3 shadow-2xl text-white max-w-[280px] pointer-events-auto">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#2CD9B8]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>DOPPLER RADAR ACTIVE</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                LIVE SWEEP
              </span>
            </div>
            <p className="text-[10px] text-gray-300 leading-tight mb-2">
              Real-time Doppler precipitation reflectivity feed overlaid across {source || "Corridor"} ➔ {destination || "Destination"}.
            </p>
            {/* Reflectivity Scale dBZ */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8.5px] font-bold text-gray-400">
                <span>0.5 mm/h</span>
                <span>10 mm/h</span>
                <span>35 mm/h</span>
                <span>65+ mm/h</span>
              </div>
              <div className="h-2 rounded-full w-full bg-gradient-to-r from-[#22c55e] via-[#eab308] via-[#f97316] to-[#ef4444]" />
              <div className="flex justify-between text-[8px] text-gray-400">
                <span>Light</span>
                <span>Moderate</span>
                <span>Heavy</span>
                <span>Severe Cell</span>
              </div>
            </div>
            {/* Storm Cell Simulation Button */}
            <button
              type="button"
              onClick={() => setSimulateStormCell((prev) => !prev)}
              className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                simulateStormCell
                  ? "bg-[#EF4444] text-white animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-[#2CD9B8] border border-[#2CD9B8]/30"
              }`}
            >
              <span>⚡</span>
              <span>{simulateStormCell ? "Active Storm Cell (48 mm/h)" : "Simulate Monsoon Storm Cell"}</span>
            </button>
          </div>
        )}

        {/* Floating Emergency Hotels Route HUD */}
        {showEmergencyHotels && mapHotels.length > 0 && (
          <div className="absolute top-3 left-3 z-[400] bg-[#0F1B2B]/95 backdrop-blur-md border border-[#10B981]/50 rounded-xl p-3 shadow-2xl text-white max-w-[300px] pointer-events-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>HOTELS.COM EMERGENCY ROUTE</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {mapHotels.length} PLOTTED
              </span>
            </div>
            <p className="text-[10px] text-gray-300 leading-tight mb-2">
              Route traced from <strong>{destination || "Destination Hub"}</strong> to chosen hotel. Click any hotel to re-route shuttle.
            </p>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
              {mapHotels.map((h) => {
                const isSelected = h.id === currentHotelId;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setChosenHotelId(h.id);
                      selectMapHotel(h.id);
                    }}
                    className={`w-full text-left p-1.5 rounded-lg text-[10px] transition-all flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#10B981]/20 border-[#10B981] text-white font-bold"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="truncate font-semibold">{h.name}</div>
                      <div className="text-[9px] text-gray-400">{h.distance}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-emerald-400 font-mono font-bold block">{h.price}</span>
                      <span className="text-amber-400 text-[9px]">★ {h.rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live Distance & ETA Bottom Bar */}
      <div className="bg-gradient-to-r from-white via-[#F8FBFF] to-white px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-[#0F1B2B]">
        <div className="flex items-center gap-3">
          {showEmergencyHotels ? (
            <div className="flex items-center gap-2">
              <span className="font-bold flex items-center gap-1.5 text-[#10B981]">
                <Hotel className="w-3.5 h-3.5 text-[#10B981]" />
                Emergency Stay: <strong>{mapHotels.find((h) => h.id === currentHotelId)?.name || "Hotel Shuttle Route Active"}</strong>
              </span>
              <span className="font-bold border-l border-gray-300 pl-2 text-gray-700">
                Hub Transfer: <strong className="text-[#10B981]">{mapHotels.find((h) => h.id === currentHotelId)?.distance || "0.8 km"}</strong>
              </span>
              <span className="font-mono text-[10px] text-gray-500 border-l border-gray-300 pl-2">
                ({mapHotels.length} Hotels Visible on Map)
              </span>
            </div>
          ) : (
            <>
              <span className="font-medium text-gray-600">
                Distance: <strong className="text-[#1C6FD9] font-bold">{routeStats.distanceKm} km</strong>
              </span>
              <span className="font-medium text-gray-600 border-l border-gray-200 pl-3">
                Estimated Duration: <strong className="text-[#15803D] font-bold">{routeStats.duration}</strong>
              </span>
            </>
          )}
        </div>
        <div className="text-[11px] text-[#4A5B70] font-medium hidden sm:flex items-center gap-1.5">
          {showEmergencyHotels ? (
            <span>Hotels.com RapidAPI &bull; Emergency Re-Accommodation</span>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Ola Maps &bull; High-Fidelity Indian Corridors</span>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
