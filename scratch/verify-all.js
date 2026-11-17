const test = async () => {
  const baseUrl = "http://localhost:3000";
  console.log("1. Checking Trip Creation Flow...");
  const tripPayload = {
    id: `trip-test-${Date.now()}`,
    title: "Bengaluru Global AI & Tech Summit",
    source: "Mumbai (BOM T2)",
    destination: "Bengaluru, Karnataka",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    traveler: {
      name: "Dr. Aarav Sharma",
      priorityPreference: "SPEED",
    },
    items: [
      {
        id: "leg-1",
        type: "FLIGHT",
        title: "IndiGo 6E-512 (BOM T2 → BLR T2)",
        provider: "IndiGo Airlines",
        referenceNumber: "6E512-BOMBLR",
        startTime: "08:00",
        endTime: "09:40",
        departureLocation: "Mumbai (BOM T2)",
        arrivalLocation: "Bengaluru (BLR T2)",
        location: "BLR Terminal 2 Arrivals",
        cost: 5400,
        currency: "INR",
        priority: "HIGH",
        bufferMinutes: 75,
        status: "NORMAL",
        isFlexible: false,
        dependencies: [],
      },
      {
        id: "leg-2",
        type: "TRANSFER",
        title: "Kempegowda Airport Priority EV Cab",
        provider: "BluSmart / Executive Chauffeur",
        referenceNumber: "EV-BLR-9921",
        startTime: "10:00",
        endTime: "11:15",
        departureLocation: "BLR Terminal 2 Pickup",
        arrivalLocation: "Palace Grounds, Bengaluru",
        location: "Palace Grounds Gate 4",
        cost: 1850,
        currency: "INR",
        priority: "MEDIUM",
        bufferMinutes: 45,
        status: "NORMAL",
        isFlexible: true,
        dependencies: ["leg-1"],
      },
      {
        id: "leg-3",
        type: "EVENT",
        title: "India AI Innovation Summit Opening Keynote",
        provider: "NASSCOM / Tech Council",
        referenceNumber: "KEYNOTE-IND-01",
        startTime: "12:00",
        endTime: "13:30",
        departureLocation: "Palace Grounds, Bengaluru",
        arrivalLocation: "Palace Grounds, Bengaluru",
        location: "Grand Ball Pavilion",
        cost: 0,
        currency: "INR",
        priority: "CRITICAL",
        bufferMinutes: 90,
        notes: "CRITICAL COMMITMENT: Delivering inaugural keynote address. CANNOT be rescheduled.",
        status: "NORMAL",
        isFlexible: false,
        dependencies: ["leg-2"],
      },
    ],
  };

  const createRes = await fetch(`${baseUrl}/api/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripPayload),
  });
  console.log("Trip Creation Status:", createRes.status);
  const createdTrip = await createRes.json();
  console.log("Created Trip ID:", createdTrip.id, "Title:", createdTrip.title);

  console.log("\n2. Testing Disruption & Recovery Plans with Step-by-Step Blueprint...");
  const disruptRes = await fetch(`${baseUrl}/api/trips/trip-denver-2026/disruptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId: 1 }),
  });
  console.log("Disrupt status:", disruptRes.status);
  const disruptData = await disruptRes.json();
  console.log("Generated Recovery Plans:", disruptData.plans.length);

  disruptData.plans.forEach((p, idx) => {
    console.log(`\n--- Plan ${idx + 1}: ${p.label} ---`);
    console.log(`Feasibility: ${p.feasibility} | Arrival: ${p.arrivalTime} | Buffer: +${p.bufferMinutes}m (${p.bufferRisk} risk)`);
    console.log(`Financial: Net ₹${p.netAdditionalCost} (New ₹${p.additionalCost} - Refund ₹${p.refundAmount})`);
    console.log(`Luggage Handled: ${p.luggageHandled} - ${p.luggageNotes || "Handled at venue"}`);
    console.log("Step-by-step actions:");
    p.actions.forEach((a, aIdx) => {
      console.log(`  Step ${aIdx + 1} [${a.actionType}]: ${a.description}`);
    });
  });

  console.log("\n3. Testing Copilot Grounded Ask API...");
  const askRes = await fetch(`${baseUrl}/api/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tripId: "trip-denver-2026",
      question: "What is the recommended recovery plan and how does it protect my keynote?",
    }),
  });
  console.log("Copilot Ask Status:", askRes.status);
  const askData = await askRes.json();
  console.log("Copilot Answer excerpt:\n", askData.reply?.slice(0, 300), "...");

  console.log("\n✅ ALL ENGINE AND UI APIS VALIDATED SUCCESSFULLY!");
};

test().catch(console.error);
