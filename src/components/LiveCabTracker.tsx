"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { Marker, Tooltip, Polyline, MapContainer, TileLayer } from "react-leaflet";
import { patchLeafletSafety } from "@/lib/leafletSafety";
import { Car, Clock, Navigation, CheckCircle2, RotateCcw, Play, Pause, Bus } from "lucide-react";

patchLeafletSafety(L);

export type TransitVehicleType = "CAB" | "VOLVO" | "EXCURSION" | "HOTEL";

export interface VehicleConfig {
  type: TransitVehicleType;
  emoji: string;
  name: string;
  shortLabel: string;
  accentColor: string;
  pingColor: string;
  borderColor: string;
  glowColor: string;
  defaultSpeedMs: number;
}

export const VEHICLE_CONFIGS: Record<TransitVehicleType, VehicleConfig> = {
  CAB: {
    type: "CAB",
    emoji: "🚖",
    name: "Ola Prime Sedan",
    shortLabel: "Cab",
    accentColor: "#2CD9B8",
    pingColor: "#2CD9B8",
    borderColor: "#2CD9B8",
    glowColor: "rgba(44, 217, 184, 0.7)",
    defaultSpeedMs: 950,
  },
  VOLVO: {
    type: "VOLVO",
    emoji: "🚌",
    name: "Volvo 9600 Multi-Axle Luxury Sleeper",
    shortLabel: "Volvo Bus",
    accentColor: "#A855F7",
    pingColor: "#C084FC",
    borderColor: "#A855F7",
    glowColor: "rgba(168, 85, 247, 0.7)",
    defaultSpeedMs: 1200,
  },
  EXCURSION: {
    type: "EXCURSION",
    emoji: "🚐",
    name: "Force Urbania Excursion Cruiser",
    shortLabel: "Excursion",
    accentColor: "#F59E0B",
    pingColor: "#FBBF24",
    borderColor: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.7)",
    defaultSpeedMs: 1050,
  },
  HOTEL: {
    type: "HOTEL",
    emoji: "🏨",
    name: "Emergency Hotel Airport Shuttle",
    shortLabel: "Hotel Stay",
    accentColor: "#10B981",
    pingColor: "#34D399",
    borderColor: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.7)",
    defaultSpeedMs: 950,
  },
};

export interface LiveCabTrackerProps {
  routePolyline: [number, number][];
  destination: [number, number];
  speedMs?: number;
  cabName?: string;
  vehicleType?: TransitVehicleType;
  onArrival?: () => void;
  onPositionChange?: (position: [number, number], etaText: string) => void;
}

/**
 * Calculates geographical bearing between two coordinates in degrees
 */
export function calculateBearing(start: [number, number], end: [number, number]): number {
  if (!start || !end) return 0;
  const lat1 = (start[0] * Math.PI) / 180;
  const lon1 = (start[1] * Math.PI) / 180;
  const lat2 = (end[0] * Math.PI) / 180;
  const lon2 = (end[1] * Math.PI) / 180;

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * React-Leaflet subcomponent for live animated cab/bus/excursion tracking
 * Mounts directly inside a React-Leaflet <MapContainer>
 */
export function LiveCabTracker({
  routePolyline,
  destination,
  speedMs,
  cabName,
  vehicleType = "CAB",
  onArrival,
  onPositionChange,
}: LiveCabTrackerProps) {
  const config = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS.CAB;
  const effectiveSpeedMs = speedMs || config.defaultSpeedMs;
  const displayName = cabName || config.name;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(
    routePolyline?.[0] || [19.076, 72.8777]
  );
  const [etaText, setEtaText] = useState<string>("Calculating ETA...");
  const [distanceText, setDistanceText] = useState<string>("");
  const [isArrived, setIsArrived] = useState<boolean>(false);
  const [bearing, setBearing] = useState<number>(0);

  // References to keep callbacks and state fresh inside the interval
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const isArrivedRef = useRef(false);
  isArrivedRef.current = isArrived;

  // Function to fetch live ETA from Ola Maps Distance Matrix API
  const fetchLiveEta = async (pos: [number, number], dest: [number, number]) => {
    try {
      const originParam = `${pos[0]},${pos[1]}`;
      const destParam = `${dest[0]},${dest[1]}`;
      const url = `/api/cabs/distance-matrix?origin=${encodeURIComponent(
        originParam
      )}&destination=${encodeURIComponent(destParam)}&vehicleType=${encodeURIComponent(
        vehicleType.toLowerCase()
      )}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.duration === "number") {
          const mins = Math.max(1, Math.round(data.duration / 60));
          const newEta = mins <= 1 ? "Arriving now (< 1 min)" : `Arriving in ${mins} mins`;
          setEtaText(newEta);

          if (typeof data.distance === "number") {
            const km = (data.distance / 1000).toFixed(1);
            setDistanceText(`${km} km remaining`);
          }
        }
      }
    } catch (err) {
      console.warn("[LiveCabTracker] Error fetching Ola Distance Matrix ETA:", err);
    }
  };

  // Initial ETA fetch on mount
  useEffect(() => {
    if (routePolyline && routePolyline.length > 0 && destination) {
      fetchLiveEta(routePolyline[0], destination);
    }
  }, [routePolyline, destination, vehicleType]);

  // Main animation loop: steps through routePolyline array index by index
  useEffect(() => {
    if (!routePolyline || routePolyline.length === 0) return;

    // Reset index if polyline changed
    setCurrentIndex(0);
    setCurrentPosition(routePolyline[0]);
    setIsArrived(false);

    const intervalId = setInterval(() => {
      const nextIndex = currentIndexRef.current + 1;

      // Check if end of array reached
      if (nextIndex >= routePolyline.length) {
        setIsArrived(true);
        setCurrentPosition(routePolyline[routePolyline.length - 1]);
        setEtaText("Arrived at destination");
        setDistanceText("0 km");
        clearInterval(intervalId);
        onArrival?.();
        return;
      }

      const nextPos = routePolyline[nextIndex];
      const prevPos = routePolyline[currentIndexRef.current];

      // Calculate bearing / heading
      const currentBearing = calculateBearing(prevPos, nextPos);
      setBearing(currentBearing);

      // Update position
      setCurrentIndex(nextIndex);
      setCurrentPosition(nextPos);
      onPositionChange?.(nextPos, etaText);

      // Fetch Live ETA every 5 steps to avoid spamming the API
      if (nextIndex % 5 === 0) {
        fetchLiveEta(nextPos, destination);
      }
    }, effectiveSpeedMs);

    return () => clearInterval(intervalId);
  }, [routePolyline, destination, effectiveSpeedMs, onArrival, onPositionChange, vehicleType]);

  // Custom Leaflet DivIcon with vehicle emoji, dynamic rotation, and pulse ring
  const vehicleIcon = useMemo(() => {
    if (typeof window === "undefined") return null;

    const htmlContent = `
      <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; background: #0F1B2B; border: 2.5px solid ${config.borderColor}; border-radius: 50%; box-shadow: 0 0 18px ${config.glowColor}; transform: rotate(${Math.round(
        bearing
      )}deg); transition: transform 0.4s ease-out;">
        <span style="font-size: 21px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">${config.emoji}</span>
        ${
          !isArrived
            ? `<span style="position: absolute; top: -3px; right: -3px; width: 11px; height: 11px; background: ${config.pingColor}; border-radius: 50%; border: 2px solid #0F1B2B; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
            : `<span style="position: absolute; top: -3px; right: -3px; width: 11px; height: 11px; background: #10B981; border-radius: 50%; border: 2px solid #0F1B2B;"></span>`
        }
      </div>
    `;

    return L.divIcon({
      className: "custom-live-vehicle-marker",
      html: htmlContent,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -24],
    });
  }, [bearing, isArrived, config]);

  if (!vehicleIcon || !currentPosition) return null;

  return (
    <Marker position={currentPosition} icon={vehicleIcon}>
      <Tooltip
        permanent
        direction="top"
        offset={[0, -24]}
        className="custom-live-vehicle-tooltip"
      >
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F1B2B] text-white shadow-2xl text-xs font-mono font-bold whitespace-nowrap"
          style={{ border: `1px solid ${config.accentColor}80` }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isArrived ? "#10B981" : config.accentColor,
            }}
          />
          <span className="text-gray-200">{displayName}:</span>
          <span style={{ color: isArrived ? "#10B981" : config.accentColor }}>
            {etaText}
          </span>
          {distanceText && (
            <span className="text-[10px] text-gray-400 border-l border-white/20 pl-1.5 ml-0.5">
              {distanceText}
            </span>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}

/**
 * Default sample Mumbai airport corridor polyline for Cab demonstration
 */
export const SAMPLE_MUMBAI_CAB_ROUTE: [number, number][] = [
  [19.0886, 72.8679], // Mumbai T2 Chhatrapati Shivaji Airport
  [19.0855, 72.8645],
  [19.0820, 72.8610],
  [19.0785, 72.8570], // Western Express Highway
  [19.0740, 72.8520],
  [19.0700, 72.8480],
  [19.0650, 72.8430], // Bandra Kurla Complex flyover
  [19.0600, 72.8390],
  [19.0550, 72.8350],
  [19.0500, 72.8310], // Bandra Reclamation
  [19.0450, 72.8270],
  [19.0400, 72.8230], // Bandra-Worli Sea Link North
  [19.0300, 72.8180], // Sea Link Central Span
  [19.0200, 72.8150],
  [19.0100, 72.8160], // Worli Toll Plaza
  [19.0000, 72.8190], // Worli Sea Face
  [18.9900, 72.8220],
  [18.9800, 72.8250], // Haji Ali Dargah
  [18.9700, 72.8180], // Pedder Road
  [18.9600, 72.8120], // Chowpatty Beach
  [18.9500, 72.8190], // Marine Drive
  [18.9400, 72.8230],
  [18.9300, 72.8280], // Churchgate
  [18.9220, 72.8347], // Gateway of India / Colaba Destination
];

export const SAMPLE_MUMBAI_DESTINATION: [number, number] = [18.922, 72.8347];

/**
 * Sample Pune Swargate ➔ Mumbai Dadar Volvo Bus Expressway Corridor (NH 48)
 */
export const SAMPLE_VOLVO_BUS_ROUTE: [number, number][] = [
  [18.5018, 73.8636], // Pune Swargate MSRTC Bus Station
  [18.5204, 73.8567], // Pune Shivajinagar
  [18.5580, 73.8200], // Wakdewadi Bus Depot
  [18.5900, 73.7900], // Pimpri Chinchwad
  [18.6350, 73.7650], // Nigdi Pradhikaran
  [18.6650, 73.7300], // Dehu Road Expressway Starting Point
  [18.7050, 73.6800], // Talegaon Toll Plaza
  [18.7350, 73.5900], // Urse Toll Plaza
  [18.7500, 73.4800], // Lonavala / Khandala Ghat Section
  [18.7900, 73.3600], // Khopoli Exit
  [18.8700, 73.2300], // Khalapur Toll Plaza
  [18.9600, 73.1300], // Panvel Bypass
  [19.0200, 73.0300], // Belapur / Navi Mumbai
  [19.0550, 72.9350], // Vashi Creek Bridge
  [19.0400, 72.8900], // Chembur Amar Mahal
  [19.0178, 72.8478], // Dadar Asiad / Volvo Intercity Bus Terminal
];

export const SAMPLE_VOLVO_DESTINATION: [number, number] = [19.0178, 72.8478];

/**
 * Sample Western Ghats Scenic Excursion Corridor (Force Urbania)
 */
export const SAMPLE_EXCURSION_ROUTE: [number, number][] = [
  [19.0760, 72.8777], // Mumbai Suburban Hub
  [19.0500, 72.9200], // Eastern Express Highway
  [19.0200, 73.0100], // Navi Mumbai Palm Beach
  [18.9800, 73.1100], // Panvel Junction
  [18.8900, 73.2200], // Chowk / Karjat Junction
  [18.8200, 73.3200], // Khalapur
  [18.7700, 73.4100], // Bhor Ghat Ascend
  [18.7500, 73.4072], // Tiger Point & Bhushi Dam Scenic Excursion Hub
];

export const SAMPLE_EXCURSION_DESTINATION: [number, number] = [18.7500, 73.4072];

/**
 * Sample Destination Transit Hub ➔ Emergency Hotel Transfer Route
 */
export const SAMPLE_HOTEL_TRANSFER_ROUTE: [number, number][] = [
  [19.0886, 72.8679], // Mumbai T2 Terminal Exit
  [19.0910, 72.8700], // Sahar Airport Approach Road
  [19.0945, 72.8715],
  [19.0980, 72.8735], // IA Project Road
  [19.1025, 72.8722], // The Lalit Mumbai Sahar (Emergency Hotel)
];

export const SAMPLE_HOTEL_DESTINATION: [number, number] = [19.1025, 72.8722];

/**
 * Self-contained Full Interactive Live Cab / Volvo / Excursion Tracker Map View
 * Includes React-Leaflet MapContainer, dynamic Ola Distance Matrix ETA,
 * vehicle type selector tabs, simulation controls, and trajectory polyline.
 */
export function LiveCabTrackerMap({
  routePolyline,
  destination,
  defaultVehicleType = "CAB",
  height = "440px",
  className = "",
}: {
  routePolyline?: [number, number][];
  destination?: [number, number];
  defaultVehicleType?: TransitVehicleType;
  height?: string;
  className?: string;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<TransitVehicleType>(defaultVehicleType);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [simulationKey, setSimulationKey] = useState<number>(0);

  const activeConfig = VEHICLE_CONFIGS[selectedVehicle];

  // Route per vehicle type if not explicitly passed
  const activePolyline = useMemo(() => {
    if (routePolyline && routePolyline.length > 0) return routePolyline;
    if (selectedVehicle === "VOLVO") return SAMPLE_VOLVO_BUS_ROUTE;
    if (selectedVehicle === "EXCURSION") return SAMPLE_EXCURSION_ROUTE;
    if (selectedVehicle === "HOTEL") return SAMPLE_HOTEL_TRANSFER_ROUTE;
    return SAMPLE_MUMBAI_CAB_ROUTE;
  }, [routePolyline, selectedVehicle]);

  const activeDestination = useMemo(() => {
    if (destination) return destination;
    if (selectedVehicle === "VOLVO") return SAMPLE_VOLVO_DESTINATION;
    if (selectedVehicle === "EXCURSION") return SAMPLE_EXCURSION_DESTINATION;
    if (selectedVehicle === "HOTEL") return SAMPLE_HOTEL_DESTINATION;
    return SAMPLE_MUMBAI_DESTINATION;
  }, [destination, selectedVehicle]);

  const [liveInfo, setLiveInfo] = useState<{ position: [number, number]; eta: string }>({
    position: activePolyline[0],
    eta: `Calculating ETA for ${activeConfig.name}...`,
  });

  const speedMs = Math.max(
    200,
    Math.round(activeConfig.defaultSpeedMs / speedMultiplier)
  );

  const centerCoords: [number, number] = activePolyline[0] || [19.076, 72.8777];

  const handleVehicleChange = (type: TransitVehicleType) => {
    setSelectedVehicle(type);
    setSimulationKey((k) => k + 1);
    setIsPlaying(true);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-white/15 bg-[#0F1B2B] shadow-2xl flex flex-col ${className}`}
    >
      {/* Header Overlay */}
      <div className="p-3.5 bg-[#0A131F]/90 backdrop-blur-md border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 z-[1000]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{
              backgroundColor: `${activeConfig.accentColor}20`,
              border: `1.5px solid ${activeConfig.accentColor}60`,
            }}
          >
            {activeConfig.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{activeConfig.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1"
                style={{
                  backgroundColor: `${activeConfig.accentColor}20`,
                  color: activeConfig.accentColor,
                  border: `1px solid ${activeConfig.accentColor}50`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: activeConfig.accentColor }}
                />
                Ola Distance Matrix
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" style={{ color: activeConfig.accentColor }} />
              <span>{liveInfo.eta}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Selection & Playback Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs">
          {/* Vehicle Type Tabs */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center">
            {(["CAB", "VOLVO", "EXCURSION", "HOTEL"] as TransitVehicleType[]).map((vType) => {
              const cfg = VEHICLE_CONFIGS[vType];
              const isSel = selectedVehicle === vType;
              return (
                <button
                  key={vType}
                  type="button"
                  onClick={() => handleVehicleChange(vType)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                    isSel
                      ? "text-[#0F1B2B]"
                      : "text-gray-400 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isSel ? cfg.accentColor : "transparent",
                  }}
                >
                  <span>{cfg.emoji}</span>
                  <span>{cfg.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Speed Multiplier */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center">
            {[1, 2, 4].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  speedMultiplier === mult
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSimulationKey((k) => k + 1);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10"
            title="Restart Route"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* React-Leaflet Map Viewport */}
      <div style={{ height, width: "100%" }} className="relative z-0">
        <MapContainer
          center={centerCoords}
          zoom={selectedVehicle === "VOLVO" ? 10 : 12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Dark-Themed OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Planned Trajectory Polyline */}
          <Polyline
            positions={activePolyline}
            pathOptions={{
              color: activeConfig.accentColor,
              weight: 5,
              opacity: 0.85,
              dashArray: "8, 6",
            }}
          />

          {/* Destination Marker */}
          <Marker
            position={activeDestination}
            icon={
              typeof window !== "undefined"
                ? L.divIcon({
                    className: "dest-marker",
                    html: `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #EF4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); color: white; font-size: 14px;">📍</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                  })
                : (null as any)
            }
          >
            <Tooltip permanent direction="bottom" offset={[0, 16]}>
              <span className="font-bold font-mono text-[10px] text-gray-900">
                Destination Drop-off
              </span>
            </Tooltip>
          </Marker>

          {/* Live Animated Vehicle Tracker Marker */}
          {isPlaying && (
            <LiveCabTracker
              key={`${simulationKey}-${selectedVehicle}`}
              routePolyline={activePolyline}
              destination={activeDestination}
              speedMs={speedMs}
              vehicleType={selectedVehicle}
              cabName={activeConfig.name}
              onPositionChange={(pos, eta) => {
                setLiveInfo({ position: pos, eta });
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Footer Status Bar */}
      <div className="p-2.5 bg-[#0A131F]/90 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" style={{ color: activeConfig.accentColor }} />
          <span>
            {selectedVehicle === "VOLVO"
              ? "Pune Swargate ➔ Mumbai Dadar Intercity Bus Corridor"
              : selectedVehicle === "EXCURSION"
              ? "Mumbai ➔ Lonavala / Khandala Western Ghats Excursion"
              : selectedVehicle === "HOTEL"
              ? "Mumbai Airport (T2) ➔ The Lalit Sahar Emergency Hotel Transfer"
              : "Mumbai Airport (T2) ➔ Gateway of India Corridor"}
          </span>
        </span>
        <span style={{ color: activeConfig.accentColor }}>
          Mode: {selectedVehicle} &bull; /api/cabs/distance-matrix
        </span>
      </div>
    </div>
  );
}

/**
 * SSR-Safe Dynamic Export for Next.js 14 App Router
 */
export const DynamicLiveCabTrackerMap = dynamic(
  () => Promise.resolve(LiveCabTrackerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] w-full rounded-2xl bg-[#0F1B2B] border border-white/10 flex flex-col items-center justify-center text-gray-400 text-xs font-mono gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#A855F7] border-t-transparent animate-spin" />
        <span>Loading React-Leaflet & Ola Maps Tracking Engine...</span>
      </div>
    ),
  }
);

/**
 * Hook for vanilla Leaflet Map instances (e.g. RouteMapClient)
 * Attaches the live animated Cab, Volvo Bus, or Excursion Cruiser marker
 * with real-time Ola Maps Distance Matrix ETA.
 */
export function useLeafletLiveCabTracker(
  map: L.Map | null,
  isActive: boolean,
  options: {
    routePolyline?: [number, number][];
    destination?: [number, number];
    speedMs?: number;
    cabName?: string;
    vehicleType?: TransitVehicleType;
  } = {}
) {
  useEffect(() => {
    if (!map || !isActive) return;

    const vType = options.vehicleType || "CAB";
    const config = VEHICLE_CONFIGS[vType] || VEHICLE_CONFIGS.CAB;

    const route =
      options.routePolyline && options.routePolyline.length >= 2
        ? options.routePolyline
        : vType === "VOLVO"
        ? SAMPLE_VOLVO_BUS_ROUTE
        : vType === "EXCURSION"
        ? SAMPLE_EXCURSION_ROUTE
        : SAMPLE_MUMBAI_CAB_ROUTE;

    const dest = options.destination || route[route.length - 1];
    if (route.length < 2) return;

    const layerGroup = L.layerGroup().addTo(map);

    // Add trajectory polyline with vehicle theme color
    L.polyline(route, {
      color: config.accentColor,
      weight: 5,
      opacity: 0.85,
      dashArray: "8, 6",
    }).addTo(layerGroup);

    // Initial marker at origin
    let index = 0;
    let currentBearing = calculateBearing(route[0], route[1]);

    const getIcon = (b: number, arrived = false) =>
      L.divIcon({
        className: "custom-live-vehicle-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #0F1B2B; border: 2px solid ${config.borderColor}; border-radius: 50%; box-shadow: 0 0 16px ${config.glowColor}; transform: rotate(${Math.round(
            b
          )}deg); transition: transform 0.4s ease-out;">
            <span style="font-size: 20px; line-height: 1;">${config.emoji}</span>
            ${
              !arrived
                ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: ${config.pingColor}; border-radius: 50%; border: 2px solid #0F1B2B; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #10B981; border-radius: 50%; border: 2px solid #0F1B2B;"></span>`
            }
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

    const vehicleMarker = L.marker(route[0], { icon: getIcon(currentBearing) }).addTo(layerGroup);

    let etaString = `Calculating ETA via Ola Maps...`;
    const vehicleLabel = options.cabName || config.name;

    vehicleMarker.bindTooltip(
      `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: white; padding: 4px 8px; border-radius: 6px; border: 1px solid ${config.accentColor}80; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        ${config.emoji} ${vehicleLabel}: <span style="color: ${config.accentColor};">${etaString}</span>
      </div>`,
      { permanent: true, direction: "top", offset: [0, -20] }
    );

    const updateEta = async (pos: [number, number]) => {
      try {
        const res = await fetch(
          `/api/cabs/distance-matrix?origin=${pos[0]},${pos[1]}&destination=${dest[0]},${dest[1]}&vehicleType=${encodeURIComponent(
            vType.toLowerCase()
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (typeof data.duration === "number") {
            const mins = Math.max(1, Math.round(data.duration / 60));
            etaString = mins <= 1 ? "Arriving now (< 1 min)" : `Arriving in ${mins} mins`;
            vehicleMarker.setTooltipContent(
              `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: white; padding: 4px 8px; border-radius: 6px; border: 1px solid ${config.accentColor}80; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                ${config.emoji} ${vehicleLabel}: <span style="color: ${config.accentColor};">${etaString}</span>
              </div>`
            );
          }
        }
      } catch (e) {
        console.warn("[useLeafletLiveCabTracker] Distance matrix fetch error:", e);
      }
    };

    updateEta(route[0]);

    const speed = options.speedMs || config.defaultSpeedMs;
    const interval = setInterval(() => {
      index++;
      if (index >= route.length) {
        clearInterval(interval);
        vehicleMarker.setIcon(getIcon(currentBearing, true));
        vehicleMarker.setTooltipContent(
          `<div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0F1B2B; color: #10B981; padding: 4px 8px; border-radius: 6px; border: 1px solid #10B981; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            ${config.emoji} ${vehicleLabel}: Arrived at destination
          </div>`
        );
        return;
      }

      const prev = route[index - 1];
      const curr = route[index];
      currentBearing = calculateBearing(prev, curr);
      vehicleMarker.setIcon(getIcon(currentBearing));
      vehicleMarker.setLatLng(curr);

      if (index % 5 === 0) {
        updateEta(curr);
      }
    }, speed);

    return () => {
      clearInterval(interval);
      map.removeLayer(layerGroup);
    };
  }, [
    map,
    isActive,
    options.routePolyline,
    options.destination,
    options.speedMs,
    options.cabName,
    options.vehicleType,
  ]);
}

export default LiveCabTracker;
