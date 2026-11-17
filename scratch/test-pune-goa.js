async function testPuneToGoa() {
  const tripPayload = {
    title: 'Goa Coastal Leadership Offsite',
    source: 'Pune (PNQ)',
    destination: 'Goa (GOI)',
    startDate: '2026-11-12',
    endDate: '2026-11-15',
    priorityPreference: 'SPEED',
    items: [
      {
        id: 'leg-goa-1',
        type: 'FLIGHT',
        title: 'IndiGo 6E-6321 (PNQ → GOX Mopa)',
        provider: 'IndiGo Airlines',
        startTime: '09:15',
        endTime: '10:20',
        departureLocation: 'Pune Airport (PNQ T1)',
        arrivalLocation: 'Goa Mopa Airport (GOX)',
        cost: 3850,
        currency: 'INR',
        priority: 'HIGH',
        bufferMinutes: 75,
        metadata: { hasLuggage: true }
      },
      {
        id: 'leg-goa-2',
        type: 'TRANSFER',
        title: 'Goa Airport Priority EV Chauffeur',
        provider: 'Goa Miles / BluSmart Executive',
        startTime: '10:45',
        endTime: '11:45',
        departureLocation: 'Goa Mopa Airport',
        arrivalLocation: 'Grand Hyatt Bambolim, Goa',
        cost: 1450,
        currency: 'INR',
        priority: 'MEDIUM',
        bufferMinutes: 45
      },
      {
        id: 'leg-goa-3',
        type: 'EVENT',
        title: 'Goa Coastal Leadership Offsite & Tech Founders Conclave',
        provider: 'Venture Conclave Council',
        startTime: '16:00',
        endTime: '18:30',
        departureLocation: 'Grand Hyatt Bambolim, Goa',
        arrivalLocation: 'Grand Hyatt Bambolim, Goa',
        cost: 0,
        currency: 'INR',
        priority: 'CRITICAL',
        bufferMinutes: 90
      },
      {
        id: 'leg-goa-4',
        type: 'HOTEL',
        title: 'Taj Exotica Resort & Spa, Goa (Benaulim)',
        provider: 'Taj Hotels (IHCL)',
        startTime: '19:00',
        endTime: '19:45',
        departureLocation: 'Calwaddo, Benaulim Beach, South Goa',
        arrivalLocation: 'Calwaddo, Benaulim Beach, South Goa',
        cost: 14500,
        currency: 'INR',
        priority: 'MEDIUM',
        bufferMinutes: 180
      }
    ]
  };

  const res = await fetch('http://localhost:3000/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripPayload)
  });
  const data = await res.json();
  console.log('Trip create status:', res.status, 'ID:', data.id);

  const disruptRes = await fetch('http://localhost:3000/api/trips/' + data.id + '/disruptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      disruptedItemId: 'leg-goa-1',
      delayMinutes: 75,
      reason: 'Dense sea fog & ATC slot hold at Goa Mopa (GOX)'
    })
  });
  const disData = await disruptRes.json();
  console.log('Disruption recovery status:', disruptRes.status);
  console.log('Generated plans count:', disData.plans?.length);
  disData.plans.forEach(p => {
    console.log(`Plan [${p.strategy}]: ${p.title} | Net: ₹${p.costDifference} | Feasible: ${p.feasibility}`);
    console.log(`   Arrival: ${p.expectedArrival} | Buffer: ${p.bufferAtKeynoteMinutes}m | Luggage: ${p.luggageProtocol}`);
  });
}
testPuneToGoa().catch(console.error);
