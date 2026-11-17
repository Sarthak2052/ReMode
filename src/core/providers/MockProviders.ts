import type {
  ITransportProvider,
  IAccommodationProvider,
  IActivityProvider,
  TransportOption,
  HotelOption,
  ActivityOption,
} from "./ProviderInterfaces.ts";

export class MockTransportProvider implements ITransportProvider {
  async findAlternatives(
    from: string,
    to: string,
    arriveBy: string,
    modeFilter?: string
  ): Promise<TransportOption[]> {
    return [
      {
        id: "tr-opt-1",
        type: "RIDESHARE",
        provider: "Priority Express Airport Cab",
        carrierCode: "PREMIUM-CAB",
        departureTime: "Immediate upon exit",
        arrivalTime: "35 min direct",
        durationMinutes: 35,
        cost: 2400,
        currency: "INR",
        bufferMinutes: 55,
        availability: "HIGH",
        direct: true,
        notes: "Direct highway route, bypasses city core traffic, priority terminal curb pickup.",
      },
      {
        id: "tr-opt-2",
        type: "FLIGHT",
        provider: "Skyline Express Flight SE-902",
        carrierCode: "SE902",
        departureTime: "14:10",
        arrivalTime: "15:25",
        durationMinutes: 75,
        cost: 6500,
        currency: "INR",
        bufferMinutes: 65,
        availability: "LIMITED",
        direct: true,
        notes: "Direct flight with priority boarding; guaranteed seat hold.",
      },
      {
        id: "tr-opt-3",
        type: "METRO",
        provider: "Airport Express Rapid Rail",
        carrierCode: "AER-L3",
        departureTime: "Every 15 min",
        arrivalTime: "55 min",
        durationMinutes: 55,
        cost: 350,
        currency: "INR",
        bufferMinutes: 20,
        availability: "HIGH",
        direct: false,
        notes: "Lowest cost option, requires 1 station transfer and 8 min walk.",
      },
      {
        id: "tr-opt-4",
        type: "TRAIN",
        provider: "InterCity Superfast Rail 12044",
        carrierCode: "IC-12044",
        departureTime: "15:00",
        arrivalTime: "16:40",
        durationMinutes: 100,
        cost: 950,
        currency: "INR",
        bufferMinutes: 15,
        availability: "LAST_SEATS",
        direct: true,
        notes: "Reliable weather-proof rail line.",
      },
    ];
  }
}

export class MockAccommodationProvider implements IAccommodationProvider {
  async findAlternatives(
    near: string,
    checkInTime: string,
    nights: number = 1
  ): Promise<HotelOption[]> {
    return [
      {
        id: "ht-opt-1",
        name: "The Grand Regency Convention Hotel",
        rating: 4.8,
        distanceKmFromTarget: 0.8,
        travelTimeMinutes: 10,
        costPerNight: 4600,
        currency: "INR",
        checkInAvailableFrom: "14:00 (Early check-in approved)",
        cancellationPolicyDesc: "Free cancellation until 6 PM check-in day",
        availableRooms: 4,
        amenities: ["Luggage Concierge", "High-speed Wi-Fi", "Business Center", "Meeting Pods"],
      },
      {
        id: "ht-opt-2",
        name: "Mercure Downtown Suites",
        rating: 4.4,
        distanceKmFromTarget: 2.4,
        travelTimeMinutes: 15,
        costPerNight: 3500,
        currency: "INR",
        checkInAvailableFrom: "15:00",
        cancellationPolicyDesc: "50% refund if cancelled within 24h",
        availableRooms: 7,
        amenities: ["Free Breakfast", "Luggage Hold", "Direct Metro Access"],
      },
      {
        id: "ht-opt-3",
        name: "Highway Suburban Inn (Budget)",
        rating: 3.8,
        distanceKmFromTarget: 19.5,
        travelTimeMinutes: 50,
        costPerNight: 2100,
        currency: "INR",
        checkInAvailableFrom: "16:00",
        cancellationPolicyDesc: "Non-refundable economy rate",
        availableRooms: 12,
        amenities: ["Free Parking", "Basic Wi-Fi"],
      },
    ];
  }
}

export class MockActivityProvider implements IActivityProvider {
  async findAlternatives(
    near: string,
    timeSlot: string,
    category?: string
  ): Promise<ActivityOption[]> {
    return [
      {
        id: "act-opt-1",
        title: "Private Art Walk & Evening Lounge",
        category: "LEISURE",
        distanceKm: 0.6,
        cost: 1200,
        currency: "INR",
        timeSlot: "19:45 - 21:30",
        durationMinutes: 105,
        isFlexible: true,
      },
      {
        id: "act-opt-2",
        title: "Chef's Table Tasting Experience (Late Slot)",
        category: "DINING",
        distanceKm: 1.1,
        cost: 2800,
        currency: "INR",
        timeSlot: "20:30 - 22:30",
        durationMinutes: 120,
        isFlexible: true,
      },
    ];
  }
}
