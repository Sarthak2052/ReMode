/**
 * Geographic coordinates and realistic route waypoint tracing for Indian transit corridors
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteStop {
  name: string;
  coords: [number, number]; // [lat, lng]
  isDisrupted?: boolean;
  type?: "ORIGIN" | "DESTINATION" | "WAYPOINT" | "HAZARD" | "AIRPORT" | "STATION";
  label?: string;
}

export interface GeoRouteData {
  origin: RouteStop;
  destination: RouteStop;
  path: [number, number][];
  disruptionPoint?: RouteStop;
  modality: "TRAIN" | "FLIGHT" | "TRANSFER" | "BUS";
  distanceKm: number;
  durationText: string;
  routeColor: string;
  routeName: string;
}

// Canonical city coordinates in India
export const INDIAN_CITIES_COORDS: Record<string, [number, number]> = {
  pune: [18.5204, 73.8567],
  goa: [15.2993, 73.9879],
  madgaon: [15.2736, 73.9582],
  panaji: [15.4909, 73.8278],
  hyderabad: [17.385, 78.4867],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  newdelhi: [28.6139, 77.209],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  chandigarh: [30.7333, 76.7794],
  shimla: [31.1048, 77.1734],
  manali: [32.2432, 77.1892],
  dharamshala: [32.219, 76.3234],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  kochi: [9.9312, 76.2673],
  agra: [27.1767, 78.0081],
  amritsar: [31.634, 74.8723],
  varanasi: [25.3176, 82.9739],
};

export function getCityCoords(name: string): [number, number] {
  if (!name) return [28.6139, 77.209];
  const lower = name.toLowerCase();

  // Transit hub shortcuts
  if (
    lower.includes("del") ||
    lower.includes("ndls") ||
    lower.includes("igi") ||
    lower.includes("new delhi") ||
    lower.includes("delhi")
  ) {
    if (lower.includes("ndls") || lower.includes("railway") || lower.includes("station")) {
      return [28.643, 77.2197]; // New Delhi Railway Station
    }
    return [28.5562, 77.1]; // DEL Terminal 1 / IGI Airport
  }
  if (
    lower.includes("bom") ||
    lower.includes("mumbai") ||
    lower.includes("csmi") ||
    lower.includes("santacruz") ||
    lower.includes("andheri")
  ) {
    return [19.0896, 72.8656]; // Mumbai BOM T2
  }
  if (
    lower.includes("blr") ||
    lower.includes("bengaluru") ||
    lower.includes("bangalore") ||
    lower.includes("kempegowda")
  ) {
    if (lower.includes("palace") || lower.includes("mgr") || lower.includes("city")) {
      return [13.0067, 77.5817]; // Palace Grounds / MGR
    }
    return [13.1986, 77.7066]; // BLR Airport T2
  }
  if (lower.includes("pune") || lower.includes("pnq")) {
    return [18.5204, 73.8567];
  }
  if (
    lower.includes("goa") ||
    lower.includes("dabolim") ||
    lower.includes("goi") ||
    lower.includes("madgaon") ||
    lower.includes("panaji")
  ) {
    return [15.38, 73.8314];
  }
  if (
    lower.includes("port blair") ||
    lower.includes("ixz") ||
    lower.includes("havelock") ||
    lower.includes("haddo")
  ) {
    return [11.6412, 92.7297];
  }
  if (lower.includes("lucknow") || lower.includes("lko")) {
    return [26.7606, 80.8893];
  }
  if (lower.includes("jaipur") || lower.includes("jai")) {
    return [26.8242, 75.8122];
  }

  const clean = lower.replace(/[^a-z]/g, "");
  for (const [k, coords] of Object.entries(INDIAN_CITIES_COORDS)) {
    if (clean.includes(k) || k.includes(clean)) {
      return coords;
    }
  }
  return [28.6139, 77.209];
}

// Generate realistic polyline paths based on modality
export function generateRoutePath(
  srcName: string,
  dstName: string,
  modality: "TRAIN" | "FLIGHT" | "TRANSFER" | "BUS" | "TAXI",
  isDisrupted: boolean = false
): GeoRouteData {
  const src = getCityCoords(srcName);
  const dst = getCityCoords(dstName);
  const cleanSrc = srcName || "Origin";
  const cleanDst = dstName || "Destination";

  const lowerSrc = srcName.toLowerCase();
  const lowerDst = dstName.toLowerCase();

  let path: [number, number][] = [];
  let distanceKm = 450;
  let durationText = "6h 30m";
  let routeColor = "#1C6FD9"; // Default brand blue
  let routeName = `${cleanSrc} ➔ ${cleanDst}`;
  let disruptionPoint: RouteStop | undefined;

  // Specific corridors
  const isPuneToGoa =
    (lowerSrc.includes("pune") && lowerDst.includes("goa")) ||
    (lowerSrc.includes("goa") && lowerDst.includes("pune"));

  const isHydToBlr =
    (lowerSrc.includes("hyderabad") && lowerDst.includes("bengaluru")) ||
    (lowerSrc.includes("hyd") && lowerDst.includes("blr")) ||
    (lowerSrc.includes("bengaluru") && lowerDst.includes("hyderabad"));

  if (modality === "FLIGHT") {
    routeColor = "#0284C7"; // Cyan / Sky Blue
    routeName = `Direct Aerial Corridor (${cleanSrc} Airport ➔ ${cleanDst} Airport)`;
    distanceKm = Math.round(calculateDistanceKm(src, dst) * 1.08);
    durationText = "1h 15m (Cruise Flight)";

    // Great circle curved arc for flights
    path = generateGreatCircleArc(src, dst, 16);
  } else if (modality === "TRANSFER" || modality === "TAXI") {
    routeColor = "#16A34A"; // Emerald Green for Highway Cab
    routeName = `Express Highway Route via National Highway (${cleanSrc} ➔ ${cleanDst})`;
    distanceKm = Math.round(calculateDistanceKm(src, dst) * 1.25);
    durationText = "7h 45m (Direct Highway Cab)";

    if (isPuneToGoa) {
      // Real Pune-Satara-Kolhapur-Nipani-Amboli Ghat-Sawantwadi-Goa road path
      path = [
        [18.5204, 73.8567], // Pune
        [18.0688, 73.9922], // Shirwal
        [17.6805, 74.0183], // Satara
        [17.2892, 74.1818], // Karad
        [16.705, 74.2433], // Kolhapur
        [16.4021, 74.3821], // Nipani
        [16.1214, 74.214], // Ajra
        [15.9619, 73.9972], // Amboli Ghat (Scenic pass)
        [15.9082, 73.8214], // Sawantwadi
        [15.5937, 73.8143], // Mapusa
        [15.2993, 73.9879], // Goa Madgaon
      ];
      distanceKm = 448;
      durationText = "7h 30m";
    } else if (isHydToBlr) {
      // NH-44 Hyderabad to Bengaluru 4-lane expressway
      path = [
        [17.385, 78.4867], // Hyderabad
        [17.0622, 78.2321], // Shadnagar
        [16.7412, 78.134], // Jadcherla
        [15.8281, 78.0373], // Kurnool
        [14.6819, 77.6006], // Anantapur
        [13.7842, 77.6214], // Bagepalli
        [13.3421, 77.6914], // Devanahalli
        [12.9716, 77.5946], // Bengaluru
      ];
      distanceKm = 570;
      durationText = "8h 15m";
    } else {
      path = generateInterpolatedPath(src, dst, 8, 0.05);
    }
  } else if (modality === "BUS") {
    routeColor = "#9333EA"; // Purple for Luxury Volvo Sleeper
    routeName = `Intercity Volvo Multi-Axle Bus Corridor (${cleanSrc} ➔ ${cleanDst})`;
    distanceKm = Math.round(calculateDistanceKm(src, dst) * 1.28);
    durationText = "9h 30m (AC Sleeper)";

    if (isPuneToGoa) {
      // Volvo Highway route via Swargate, Belagavi, Chorla Ghat
      path = [
        [18.5204, 73.8567], // Pune
        [17.6805, 74.0183], // Satara
        [16.705, 74.2433], // Kolhapur
        [15.8497, 74.4977], // Belagavi Bypass
        [15.612, 74.241], // Chorla Ghat
        [15.5414, 74.032], // Sanquelim
        [15.4909, 73.8278], // Panaji
        [15.2993, 73.9879], // Madgaon
      ];
      distanceKm = 475;
      durationText = "9h 15m";
    } else if (isHydToBlr) {
      path = [
        [17.385, 78.4867], // Hyderabad MGBS
        [16.7412, 78.134], // Jadcherla
        [15.8281, 78.0373], // Kurnool
        [14.6819, 77.6006], // Anantapur
        [13.3421, 77.6914], // Devanahalli Toll
        [12.9716, 77.5946], // Bengaluru Majestic
      ];
      distanceKm = 575;
      durationText = "9h 00m";
    } else {
      path = generateInterpolatedPath(src, dst, 8, 0.04);
    }
  } else {
    // TRAIN
    routeColor = isDisrupted ? "#DC2626" : "#4F46E5"; // Red if disrupted, Indigo if on time
    routeName = isDisrupted
      ? `DISRUPTED RAILWAY CORRIDOR (${cleanSrc} ➔ ${cleanDst})`
      : `Indian Railways Mainline Track (${cleanSrc} ➔ ${cleanDst})`;
    distanceKm = Math.round(calculateDistanceKm(src, dst) * 1.22);
    durationText = "11h 45m";

    if (isPuneToGoa) {
      // Scenic Braganza Ghats track route: Pune -> Miraj -> Belagavi -> Londa -> Castle Rock -> Dudhsagar -> Kulem -> Madgaon
      path = [
        [18.5204, 73.8567], // Pune Jn
        [17.6805, 74.0183], // Satara
        [16.829, 74.6467], // Miraj Jn
        [15.8497, 74.4977], // Belagavi
        [15.4521, 74.5123], // Londa Jn
        [15.3982, 74.3412], // Castle Rock (Disruption hotspot in ghat section)
        [15.3144, 74.3143], // Dudhsagar Waterfalls
        [15.2821, 74.2412], // Kulem
        [15.2736, 73.9582], // Madgaon Junction
      ];
      distanceKm = 460;
      durationText = "11h 20m";

      if (isDisrupted) {
        disruptionPoint = {
          name: "Castle Rock / Braganza Ghat Rail Section",
          coords: [15.3982, 74.3412],
          isDisrupted: true,
          type: "HAZARD",
          label: "Track Failure / Signal Breakdown",
        };
      }
    } else if (isHydToBlr) {
      path = [
        [17.385, 78.4867], // Hyderabad KCG
        [16.7412, 78.134], // Mahbubnagar
        [15.8281, 78.0373], // Kurnool City
        [15.1724, 77.3712], // Guntakal Jn
        [14.6819, 77.6006], // Anantapur
        [14.4123, 77.7214], // Dharmavaram Jn
        [13.1002, 77.5962], // Yelahanka Jn
        [12.9716, 77.5946], // KSR Bengaluru SBC
      ];
      distanceKm = 610;
      durationText = "10h 30m";

      if (isDisrupted) {
        disruptionPoint = {
          name: "Guntakal Junction Central Switch Grid",
          coords: [15.1724, 77.3712],
          isDisrupted: true,
          type: "HAZARD",
          label: "Signaling System Hardware Failure",
        };
      }
    } else {
      path = generateInterpolatedPath(src, dst, 8, 0.02);
      if (isDisrupted) {
        const midIdx = Math.floor(path.length / 2);
        disruptionPoint = {
          name: "Intermediate Mainline Junction",
          coords: path[midIdx],
          isDisrupted: true,
          type: "HAZARD",
          label: "Track Obstruction / Signal Block",
        };
      }
    }
  }

  return {
    origin: {
      name: cleanSrc,
      coords: src,
      type: "ORIGIN",
      label: `Origin: ${cleanSrc}`,
    },
    destination: {
      name: cleanDst,
      coords: dst,
      type: "DESTINATION",
      label: `Destination: ${cleanDst}`,
    },
    path,
    disruptionPoint,
    modality: modality === "TAXI" ? "TRANSFER" : modality,
    distanceKm,
    durationText,
    routeColor,
    routeName,
  };
}

// Generate intermediate bezier curve points for airplane flight arc
function generateGreatCircleArc(
  start: [number, number],
  end: [number, number],
  steps = 16
): [number, number][] {
  const points: [number, number][] = [];
  const lat1 = start[0];
  const lng1 = start[1];
  const lat2 = end[0];
  const lng2 = end[1];

  // Midpoint with curve offset to simulate aerial airway route
  const midLat = (lat1 + lat2) / 2 + (lng2 - lng1) * 0.12;
  const midLng = (lng1 + lng2) / 2 - (lat2 - lat1) * 0.12;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve interpolation
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * midLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    points.push([Number(lat.toFixed(4)), Number(lng.toFixed(4))]);
  }
  return points;
}

// Interpolate waypoints with subtle realistic highway curves
function generateInterpolatedPath(
  start: [number, number],
  end: [number, number],
  steps = 8,
  jitterFactor = 0.03
): [number, number][] {
  const points: [number, number][] = [start];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sinOffset = Math.sin(t * Math.PI) * jitterFactor;
    const lat = start[0] + (end[0] - start[0]) * t + sinOffset * 1.5;
    const lng = start[1] + (end[1] - start[1]) * t + sinOffset * 0.8;
    points.push([Number(lat.toFixed(4)), Number(lng.toFixed(4))]);
  }
  points.push(end);
  return points;
}

// Haversine formula distance
function calculateDistanceKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLon = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
