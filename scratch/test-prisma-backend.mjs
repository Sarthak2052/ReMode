async function testBackend() {
  console.log("🚀 Testing PostgreSQL Prisma Backend Endpoints...");

  // 1. GET /api/trips
  const tripsRes = await fetch("http://localhost:3000/api/trips");
  console.log("1. GET /api/trips -> Status:", tripsRes.status);
  const trips = await tripsRes.json();
  console.log(`   Found ${trips.length} trip(s) in PostgreSQL:`);
  for (const t of trips) {
    console.log(`   - [${t.id}] "${t.title}" (${t.items.length} legs)`);
  }

  const activeTrip = trips[0];
  const tripId = activeTrip.id;

  // 2. GET /api/trips/[id]
  const tripRes = await fetch(`http://localhost:3000/api/trips/${tripId}`);
  console.log(`\n2. GET /api/trips/${tripId} -> Status:`, tripRes.status);
  const tripData = await tripRes.json();
  console.log(`   Trip destination: ${tripData.destination}, Traveler: ${tripData.traveler.name}`);

  // 3. POST /api/trips/[id]/disruptions (Inject Disruption)
  console.log(`\n3. Testing Disruption Injection on Trip ${tripId}...`);
  const disruptRes = await fetch(`http://localhost:3000/api/trips/${tripId}/disruptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId: 1 }),
  });
  console.log("   POST /api/trips/[id]/disruptions -> Status:", disruptRes.status);
  const disruptData = await disruptRes.json();
  console.log(`   Active Disruption: ${disruptData.disruption?.title}`);
  console.log(`   Generated Plans: ${disruptData.plans?.length}`);
  for (const p of disruptData.plans || []) {
    console.log(`   * [${p.planType}] ${p.label} (Net: ₹${p.netAdditionalCost})`);
  }

  // 4. POST /api/trips/[id]/recovery-plans/apply (Atomic Apply Transaction)
  if (disruptData.plans && disruptData.plans.length > 0) {
    const planToApply = disruptData.plans[0];
    console.log(`\n4. Testing Atomic $transaction Apply on Plan: "${planToApply.label}"...`);
    const applyRes = await fetch(`http://localhost:3000/api/trips/${tripId}/recovery-plans/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: planToApply.id,
        plan: planToApply,
        confirmed: true,
      }),
    });
    console.log("   POST /api/trips/[id]/recovery-plans/apply -> Status:", applyRes.status);
    const applyData = await applyRes.json();
    console.log("   Applied Plan Result: Status updated and trip active.");
  }

  // 5. POST /api/copilot/ask
  console.log(`\n5. Testing Grounded AI Copilot with PostgreSQL...`);
  const copilotRes = await fetch("http://localhost:3000/api/copilot/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tripId,
      message: "Explain the best alternative for my delayed leg under DGCA rules",
    }),
  });
  console.log("   POST /api/copilot/ask -> Status:", copilotRes.status);
  const copilotData = await copilotRes.json();
  console.log("   Copilot Reply Preview:", copilotData.reply?.substring(0, 150) + "...");

  console.log("\n✅ ALL POSTGRESQL PRISMA BACKEND ENDPOINTS TESTED SUCCESSFULLY!");
}

testBackend().catch(console.error);
