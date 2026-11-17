export interface TransportOption {
  id: string;
  type: "FLIGHT" | "TRAIN" | "TRANSFER" | "RIDESHARE" | "METRO";
  provider: string;
  carrierCode?: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  cost: number;
  currency: string;
  bufferMinutes: number;
  availability: "HIGH" | "LIMITED" | "LAST_SEATS";
  direct: boolean;
  notes?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  distanceKmFromTarget: number;
  travelTimeMinutes: number;
  costPerNight: number;
  currency: string;
  checkInAvailableFrom: string;
  cancellationPolicyDesc: string;
  availableRooms: number;
  amenities: string[];
}

export interface ActivityOption {
  id: string;
  title: string;
  category: string;
  distanceKm: number;
  cost: number;
  currency: string;
  timeSlot: string;
  durationMinutes: number;
  isFlexible: boolean;
}

export interface ITransportProvider {
  findAlternatives(
    from: string,
    to: string,
    arriveBy: string,
    modeFilter?: string
  ): Promise<TransportOption[]>;
}

export interface IAccommodationProvider {
  findAlternatives(
    near: string,
    checkInTime: string,
    nights?: number
  ): Promise<HotelOption[]>;
}

export interface IActivityProvider {
  findAlternatives(
    near: string,
    timeSlot: string,
    category?: string
  ): Promise<ActivityOption[]>;
}
