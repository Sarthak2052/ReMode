import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ReMode Database with Multi-Modal Scenarios...");

  // 1. Create or Upsert User with travel preferences
  const user = await prisma.user.upsert({
    where: { email: "manas.kadam@example.com" },
    update: {
      name: "Manas Kadam",
      avoidNightTravel: true,
      carrierLoyalty: ["IndiGo", "Taj Hotels"],
      priorityWeights: {
        costWeight: 0.3,
        timeWeight: 0.5,
        convenienceWeight: 0.2,
      },
    },
    create: {
      email: "manas.kadam@example.com",
      name: "Manas Kadam",
      avoidNightTravel: true,
      carrierLoyalty: ["IndiGo", "Taj Hotels"],
      priorityWeights: {
        costWeight: 0.3,
        timeWeight: 0.5,
        convenienceWeight: 0.2,
      },
    },
  });

  console.log(`👤 User ready: ${user.name} (${user.id})`);

  // =====================================================================
  // SCENARIO 1: Mumbai to Jaipur Weekend Getaway (Flight -> Cab -> Train -> Hotel)
  // =====================================================================
  const tripJaipur = await prisma.trip.create({
    data: {
      userId: user.id,
      title: "Mumbai to Jaipur Weekend Getaway",
      source: "BOM",
      destination: "JAI",
      startDate: new Date("2026-10-15T10:00:00Z"),
      endDate: new Date("2026-10-18T12:00:00Z"),
      status: "ACTIVE",
    },
  });

  const flightJaipur = await prisma.itineraryItem.create({
    data: {
      tripId: tripJaipur.id,
      type: "FLIGHT",
      provider: "IndiGo",
      referenceNumber: "6E-4522",
      source: "BOM (Terminal 2)",
      destination: "DEL (Terminal 1)",
      departureTime: new Date("2026-10-15T04:30:00Z"), // 10:00 AM IST
      arrivalTime: new Date("2026-10-15T06:40:00Z"), // 12:10 PM IST
      cost: 5500.0,
      currency: "INR",
      status: "CONFIRMED",
      dependsOn: [], // Root node
      cancellationPolicy: {
        isRefundable: false,
        dgcaRights:
          "Delay > 2hrs: Meals. Delay > 4hrs: Rebook or Full Refund (CAR Section 3, Series M).",
      },
      metadata: { pnr: "X7BY9Q", seat: "12A" },
    },
  });

  const cabJaipur = await prisma.itineraryItem.create({
    data: {
      tripId: tripJaipur.id,
      type: "CAB",
      provider: "BluSmart",
      referenceNumber: "BLU-9921",
      source: "DEL (Terminal 1)",
      destination: "New Delhi Railway Station (NDLS)",
      departureTime: new Date("2026-10-15T07:30:00Z"), // 1:00 PM IST
      arrivalTime: new Date("2026-10-15T08:30:00Z"), // 2:00 PM IST
      cost: 850.0,
      currency: "INR",
      status: "CONFIRMED",
      dependsOn: [flightJaipur.id],
      cancellationPolicy: {
        isRefundable: true,
        cutoffHours: 1,
        penalty: 0,
      },
    },
  });

  const trainJaipur = await prisma.itineraryItem.create({
    data: {
      tripId: tripJaipur.id,
      type: "TRAIN",
      provider: "IRCTC / Vande Bharat Express",
      referenceNumber: "20978",
      source: "NDLS",
      destination: "Jaipur Jn (JP)",
      departureTime: new Date("2026-10-15T09:40:00Z"), // 3:10 PM IST
      arrivalTime: new Date("2026-10-15T14:10:00Z"), // 7:40 PM IST
      cost: 1250.0,
      currency: "INR",
      status: "CONFIRMED",
      dependsOn: [cabJaipur.id],
      cancellationPolicy: {
        isRefundable: true,
        rules: "IRCTC Chart preparation limit: Cancel up to 4 hrs prior for 50% refund.",
      },
      metadata: { pnr: "2819301934", coach: "C4", seat: "45" },
    },
  });

  const hotelJaipur = await prisma.itineraryItem.create({
    data: {
      tripId: tripJaipur.id,
      type: "HOTEL",
      provider: "Taj Amer",
      referenceNumber: "TAJ-55829",
      source: "Jaipur",
      destination: "Jaipur",
      departureTime: new Date("2026-10-15T15:00:00Z"), // 8:30 PM IST (Check-in)
      arrivalTime: new Date("2026-10-18T05:30:00Z"), // Checkout 3 days later
      cost: 24000.0,
      currency: "INR",
      status: "CONFIRMED",
      dependsOn: [trainJaipur.id],
      cancellationPolicy: {
        isRefundable: false,
        rules: "No-shows billed for first night.",
      },
    },
  });

  // Disruption 1: Flight delayed by 4 hours
  await prisma.disruption.create({
    data: {
      tripId: tripJaipur.id,
      itemId: flightJaipur.id,
      type: "DELAY",
      severity: "CRITICAL",
      source: "CARRIER_ALERT",
      delayMinutes: 240,
      description: "Flight 6E-4522 delayed by 4 hours due to technical aircraft fault at BOM.",
      impactedItemIds: [cabJaipur.id, trainJaipur.id],
      status: "ACTIVE",
    },
  });

  // =====================================================================
  // SCENARIO 2: The Andaman Cancellation (Flight -> Cab -> Ferry -> Hotel)
  // =====================================================================
  const tripAndaman = await prisma.trip.create({
    data: {
      userId: user.id,
      title: "Havelock Anniversary Trip",
      source: "BOM",
      destination: "Havelock Island",
      startDate: new Date("2026-11-10T05:00:00Z"),
      endDate: new Date("2026-11-15T10:00:00Z"),
      status: "ACTIVE",
    },
  });

  const andamanFlight = await prisma.itineraryItem.create({
    data: {
      tripId: tripAndaman.id,
      type: "FLIGHT",
      provider: "Akasa Air",
      referenceNumber: "QP-1122",
      source: "BOM (Mumbai)",
      destination: "IXZ (Port Blair)",
      departureTime: new Date("2026-11-10T00:30:00Z"), // 6:00 AM IST
      arrivalTime: new Date("2026-11-10T04:00:00Z"), // 9:30 AM IST
      cost: 12500.0,
      currency: "INR",
      dependsOn: [],
      cancellationPolicy: {
        isRefundable: false,
        dgcaRights:
          "Airline cancelled < 24hrs: Full refund or alternate flight on same/next day.",
      },
    },
  });

  const andamanCab = await prisma.itineraryItem.create({
    data: {
      tripId: tripAndaman.id,
      type: "CAB",
      provider: "Local Taxi",
      source: "IXZ Airport",
      destination: "Haddo Jetty",
      departureTime: new Date("2026-11-10T04:30:00Z"), // 10:00 AM IST
      arrivalTime: new Date("2026-11-10T05:00:00Z"), // 10:30 AM IST
      cost: 400.0,
      currency: "INR",
      dependsOn: [andamanFlight.id],
      cancellationPolicy: { isRefundable: true, penalty: 0 },
    },
  });

  const andamanFerry = await prisma.itineraryItem.create({
    data: {
      tripId: tripAndaman.id,
      type: "FERRY",
      provider: "Makruzz",
      referenceNumber: "MK-992",
      source: "Port Blair (Haddo Jetty)",
      destination: "Havelock Island",
      departureTime: new Date("2026-11-10T06:00:00Z"), // 11:30 AM IST
      arrivalTime: new Date("2026-11-10T07:30:00Z"), // 1:00 PM IST
      cost: 3200.0,
      currency: "INR",
      dependsOn: [andamanCab.id],
      cancellationPolicy: {
        isRefundable: false,
        rules: "0% refund if cancelled within 24 hours of departure.",
      },
    },
  });

  // Disruption 2: Flight Cancelled 12 hours prior
  await prisma.disruption.create({
    data: {
      tripId: tripAndaman.id,
      itemId: andamanFlight.id,
      type: "CANCELLATION",
      severity: "CRITICAL",
      source: "CARRIER_ALERT",
      delayMinutes: 0,
      description: "Akasa Air flight QP-1122 cancelled due to operational reasons.",
      impactedItemIds: [andamanCab.id, andamanFerry.id],
      status: "ACTIVE",
    },
  });

  // =====================================================================
  // SCENARIO 3: The Winter Fog (Train -> Cab -> Int'l Flight)
  // =====================================================================
  const tripDubai = await prisma.trip.create({
    data: {
      userId: user.id,
      title: "Lucknow to Dubai Business Trip",
      source: "LKO",
      destination: "DXB",
      startDate: new Date("2026-12-20T10:00:00Z"),
      endDate: new Date("2026-12-25T10:00:00Z"),
      status: "ACTIVE",
    },
  });

  const fogTrain = await prisma.itineraryItem.create({
    data: {
      tripId: tripDubai.id,
      type: "TRAIN",
      provider: "IRCTC / Swarna Shatabdi",
      referenceNumber: "12003",
      source: "LKO (Lucknow)",
      destination: "NDLS (New Delhi)",
      departureTime: new Date("2026-12-20T10:00:00Z"), // 3:30 PM IST
      arrivalTime: new Date("2026-12-20T16:30:00Z"), // 10:00 PM IST
      cost: 1800.0,
      currency: "INR",
      dependsOn: [],
      cancellationPolicy: {
        isRefundable: true,
        rules: "Full refund if train is delayed by more than 3 hours at source.",
      },
    },
  });

  const fogCab = await prisma.itineraryItem.create({
    data: {
      tripId: tripDubai.id,
      type: "CAB",
      provider: "Uber",
      source: "NDLS",
      destination: "DEL (Terminal 3)",
      departureTime: new Date("2026-12-20T17:00:00Z"), // 10:30 PM IST
      arrivalTime: new Date("2026-12-20T18:00:00Z"), // 11:30 PM IST
      cost: 650.0,
      currency: "INR",
      dependsOn: [fogTrain.id],
      cancellationPolicy: { isRefundable: true, penalty: 0 },
    },
  });

  const fogFlight = await prisma.itineraryItem.create({
    data: {
      tripId: tripDubai.id,
      type: "FLIGHT",
      provider: "Air India",
      referenceNumber: "AI-995",
      source: "DEL (Terminal 3)",
      destination: "DXB (Dubai)",
      departureTime: new Date("2026-12-20T21:00:00Z"), // 2:30 AM IST (Next Day)
      arrivalTime: new Date("2026-12-21T01:00:00Z"), // 6:30 AM GST
      cost: 18500.0,
      currency: "INR",
      dependsOn: [fogCab.id],
      cancellationPolicy: {
        isRefundable: false,
        rules:
          "No-show results in 100% fare forfeiture. Date change allowed up to 4 hrs prior for ₹3500 fee.",
      },
    },
  });

  // Disruption 3: Train delayed by 6 hours due to fog
  await prisma.disruption.create({
    data: {
      tripId: tripDubai.id,
      itemId: fogTrain.id,
      type: "DELAY",
      severity: "CRITICAL",
      source: "WEATHER_FEED",
      delayMinutes: 360, // 6 hours
      description:
        "Swarna Shatabdi delayed by 6 hours due to dense zero-visibility fog in North India.",
      impactedItemIds: [fogCab.id, fogFlight.id],
      status: "ACTIVE",
    },
  });

  console.log("✅ All 3 Multi-Modal Disruption Scenarios Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
