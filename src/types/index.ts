export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ItemStatus =
  | "NORMAL"
  | "AT_RISK"
  | "AFFECTED"
  | "MISSED"
  | "CANCELLED"
  | "RECOVERED"
  | "RESCHEDULED";

export type Feasibility = "RECOVERABLE" | "AT_RISK" | "IMPOSSIBLE";

export type DisruptionType =
  | "FLIGHT_DELAY"
  | "FLIGHT_CANCELLATION"
  | "FLIGHT_CANCELLED"
  | "MISSED_CONNECTION"
  | "HOTEL_UNAVAILABLE"
  | "HOTEL_CANCELLED"
  | "ACTIVITY_CANCELLATION"
  | "ACTIVITY_CANCELLED"
  | "TRAIN_DELAY"
  | "TRAIN_CANCELLED"
  | "BUS_DELAY"
  | "BUS_CANCELLED"
  | "TRANSFER_FAILURE"
  | "TRANSFER_FAILED"
  | "WEATHER_DISRUPTION"
  | "TRAVELER_CHANGE"
  | "MULTIPLE_DISRUPTIONS";

export type ItemType =
  | "FLIGHT"
  | "TRAIN"
  | "BUS"
  | "TRANSFER"
  | "TAXI"
  | "HOTEL"
  | "ACTIVITY"
  | "EVENT";

export interface CancellationRule {
  thresholdHours: number;
  refundPercent: number;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  type: ItemType;
  title: string;
  provider: string;
  referenceNumber: string;
  startTime: string;
  endTime: string;
  departureLocation: string;
  arrivalLocation: string;
  location: string;
  status: ItemStatus;
  priority: Priority;
  isFlexible: boolean;
  cancellationPolicy: CancellationRule[];
  refundPolicyNotes?: string;
  cost: number;
  currency: string;
  dependencies: string[];
  bufferMinutes: number;
  notes?: string;
  metadata?: {
    terminal?: string;
    gate?: string;
    seat?: string;
    roomType?: string;
    contactNumber?: string;
    address?: string;
    dressCode?: string;
    luggageDropOffAvailable?: boolean;
    hasLuggage?: boolean;
    transitTimeMinutes?: number;
    [key: string]: any;
  };
}

export interface DisruptionEvent {
  id: string;
  tripId: string;
  scenarioId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  type: DisruptionType;
  title: string;
  description: string;
  affectedItemIds: string[];
  delayMinutes?: number;
  newEstimatedArrival?: string;
  reportedAt: string;
  rawPayload?: Record<string, unknown>;
}

export interface CriticalEventAlert {
  itemId: string;
  title: string;
  priority: Priority;
  scheduledTime: string;
  estimatedArrival: string;
  bufferMinutes: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  luggageIssue?: boolean;
  luggageAdvice?: string;
}

export interface ImpactAnalysis {
  disruptedItemId: string;
  disruptionType: DisruptionType;
  directImpact: string[];
  downstreamImpact: string[];
  criticalEventsAtRisk: CriticalEventAlert[];
  feasibility: Feasibility;
  impossibleReason?: string;
  fallbacks?: string[];
  connectionBufferErosion: {
    connectionId: string;
    originalBuffer: number;
    newBuffer: number;
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
  }[];
  analyzedAt: string;
}

export interface LiveAlternativeOption {
  id: string;
  name: string;
  number: string;
  departureTime: string;
  arrivalTime: string;
  cost: number;
  seatClass?: string;
  status: string;
  tagline?: string;
  isRecommended?: boolean;
}

export interface LiveTransitRecommendation {
  isLiveApi: boolean;
  mode: "TRAIN" | "FLIGHT" | "BUS" | "CAB";
  corridor: string;
  sourceStation?: string;
  destStation?: string;
  headline: string;
  availableAlternatives: LiveAlternativeOption[];
}

export interface RecoveryAction {
  targetItemId: string;
  actionType: "REBOOK" | "REORDER" | "RESCHEDULE" | "REPLACE" | "CANCEL" | "KEEP_AS_IS";
  description: string;
  previousSchedule?: { start: string; end: string };
  newSchedule?: { start: string; end: string };
  newProvider?: string;
  originalCost: number;
  refundAmount: number;
  newCost: number;
  netCost: number;
  liveMetadata?: {
    isLiveApi: boolean;
    transportMode: "TRAIN" | "FLIGHT" | "BUS" | "CAB";
    referenceNumber?: string;
    verifiedSchedule?: boolean;
    availableAlternatives?: LiveAlternativeOption[];
  };
}

export interface RecoveryPlan {
  id: string;
  tripId: string;
  label: "Option A — Fastest" | "Option B — Lowest Cost" | "Option C — Minimum Changes" | string;
  planType: "FASTEST" | "LOWEST_COST" | "MINIMUM_CHANGES";
  rank: number;
  additionalCost: number;
  refundAmount: number;
  netAdditionalCost: number;
  arrivalTime: string;
  bufferMinutes: number;
  bufferRisk: "LOW" | "MEDIUM" | "HIGH";
  bookingsChanged: number;
  activitiesLost: number;
  distanceKm: number;
  criticalEventProtected: "YES" | "RISKY" | "NO";
  feasibility: Feasibility;
  explanation: string;
  tradeOffSummary: string;
  luggageHandled: boolean;
  luggageNotes?: string;
  actions: RecoveryAction[];
  scores: {
    factor: string;
    value: string | number;
    grade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL";
  }[];
  liveRecommendation?: LiveTransitRecommendation;
}

export type RecoveryPriorityPreference =
  | "SPEED"
  | "LOWEST_COST"
  | "MIN_CHANGES"
  | "BALANCED"
  | "COST"
  | "COMFORT";

export interface TripSnapshot {
  id: string;
  title: string;
  source?: string;
  destination: string;
  startDate: string;
  endDate: string;
  traveler: {
    name: string;
    phone?: string;
    priorityPreference: RecoveryPriorityPreference;
  };
  items: ItineraryItem[];
  activeDisruption?: DisruptionEvent | null;
  history: {
    timestamp: string;
    action: string;
    items: ItineraryItem[];
  }[];
}

export interface RiskAlert {
  id: string;
  itemId: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  currentBufferMinutes: number;
  suggestedAction: string;
}

export interface WeatherRiskAssessment {
  overallRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  flightRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  trainRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  roadRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  recommendedDelayMinutes: number;
  advisory: string;
  breakdown: string[];
}

export interface WeatherCondition {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  temperature: number; // in Celsius
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number; // in %
  pressure: number; // in hPa
  windSpeed: number; // normalized to km/h (OpenWeather m/s * 3.6)
  windDeg: number; // meteorological degrees
  windGust?: number; // in km/h
  rainfall: number; // in mm/hr
  snowfall?: number; // in mm/hr
  visibility: number; // in meters
  condition: string; // e.g. "Rain", "Thunderstorm", "Fog", "Clear", "Clouds"
  description: string; // e.g. "heavy intensity rain"
  icon: string; // OpenWeather icon code e.g. "10d"
  timestamp: number; // Unix timestamp
  source: "OPENWEATHER_LIVE" | "METEOROLOGICAL_FALLBACK" | "SIMULATION";
  riskAssessment: WeatherRiskAssessment;
}

