import * as fs from "fs";
import * as path from "path";

/**
 * Builds the comprehensive Nugen Domain Alignment Dataset for ReMode.
 * Synthesizes:
 * 1. routeCatalogs corridor patterns
 * 2. RecoveryEngine 13-factor scoring & recovery rules
 * 3. Sample disruption -> recovery pairs
 * 4. DGCA Passenger Charter & IRCTC Railway rules
 */

const REMODE_DOMAIN_RULES_V2 = `# REMODE DIGITAL TWIN & DISRUPTION RECOVERY: ALIGNED DOMAIN RULES

## 1. MULTIMODAL CORRIDOR PATTERNS & VELOCITY PROFILES
- BOM-DEL (Mumbai to Delhi | 1,148 km):
  * Flight: 2h 10m nominal. ATC holding stacks active if BOM runway visual range < 550m or crosswind > 25 knots.
  * Train (Tejas Rajdhani / August Kranti): 15h 30m. Highly resilient against monsoon gale; primary bypass when aviation suspended.
  * Road: 24h via Western Dedicated Freight / NH48; not recommended for urgent connection recovery.
- DEL-JAI (Delhi to Jaipur | 280 km):
  * Road (Delhi-Mumbai Expressway): 3h 45m via Volvo 9600 / EV Chauffeur. High resilience, primary bypass for delayed DEL flights.
  * Train (Vande Bharat 20978): 3h 40m. 99.2% on-time reliability.
- BLR-MAA (Bengaluru to Chennai | 350 km):
  * Train (Vande Bharat 20608): 4h 25m. High frequency alternative for weather-delayed morning flights.
  * Flight: 55m gate-to-gate. Highly vulnerable to North-East monsoon squalls.
- DEL-IXC / Manali (Delhi to Chandigarh / Kullu):
  * Hill transit subject to NH3 / NH21 landslide closures. Volvo B11R multi-axle coaches with dual drivers mandatory.

## 2. RECOVERY ENGINE 13-FACTOR MULTI-CRITERIA DECISION SCORING
When evaluating candidate recovery plans, the engine scores 13 distinct physical and operational factors:
1. Primary Transit Delay (minutes): Direct schedule drift from meteorological event.
2. Downstream Buffer Erosion (minutes): Remaining cushion before subsequent departure.
3. Connection Severance Risk: Flagged as 'MISSED_CONNECTION' if buffer < 30 minutes.
4. Multimodal Feasibility: Availability of un-disrupted alternative transport modes.
5. Critical Event Protection: Whether wedding, keynote, board meeting, or flight is salvaged.
6. Passenger Out-of-Pocket Cost Delta (INR): Incremental expenditure after refunds.
7. Statutory Refund Entitlement: Automatic calculation under DGCA / IRCTC / Consumer charters.
8. Luggage Interoperability: Seamless transfer of checked baggage across mode switches.
9. Time-of-Day Comfort: Overnight hotel priority if arrival is forced past 23:00.
10. Carbon & Fleet Efficiency: Prioritizing Vande Bharat Electric / EV Chauffeurs.
11. Provider Reliability Index: Historical on-time metric for replacement carrier.
12. Ripple Depth: Total number of downstream itinerary nodes affected by the change.
13. User Priority Alignment: Tailored to SPEED (fastest), COST (cheapest), or BUFFER (maximum safety cushion).

## 3. DGCA PASSENGER RIGHTS (CAR SECTION 3, SERIES M, PART IV)
- Flight Cancellation / Operator Delay > 2 Hours:
  * Passengers entitled to free re-booking on the next available flight of the same airline or partner airline, OR 100% full refund with zero cancellation penalty.
- Blocked Connection: If the first leg delays a connecting flight on the same PNR, carrier must provide alternate transportation or full refund for untraveled sectors.
- Overnight Delay: If cancellation or delay exceeds 6 hours during night (20:00 to 06:00), airline must provide complimentary hotel accommodation and airport transfers.
- Food & Refreshments: Mandatory for delays exceeding 2 hours for domestic flights.

## 4. IRCTC RAILWAY PASSENGER CHARTER & TDR RULES
- Train Running Late > 3 Hours: Full refund without cancellation charges if TDR (Ticket Deposit Receipt) filed before actual departure.
- Waterlogging & Track Suspension: 100% automatic refund credited without TDR requirement.
- Rail Buckling & Summer Caution Orders: 25 km/h speed ceilings imposed when rail temperature >= 46°C.

## 5. RECOVERY EXECUTION PAIR ARCHETYPES
- Archetype A (Aviation Storm Delay -> High-Speed Rail Bypass):
  * Disruption: Flight 6E-512 (BOM-DEL) delayed 150m by convective cloudburst.
  * Recovery: Transfer passenger to Tejas Rajdhani Express (Train 12951) or Vande Bharat. Airline provides 100% full cancellation refund under DGCA CAR Sec 3. Downstream Delhi meetings protected.
- Archetype B (Flight Ground Stop -> Priority Chauffeur Transfer):
  * Disruption: Short-haul flight DEL-JAI cancelled due to runway maintenance.
  * Recovery: Immediate deployment of priority chauffeur via Delhi-Mumbai Expressway. Buffer preserved; arrival within 45m of original schedule.
- Archetype C (Missed Connection -> Emergency Overnight Accommodation):
  * Disruption: Arrival at transfer hub delayed past 23:30; connecting train missed.
  * Recovery: Proactive hold on 4-star transit hotel near station with pre-booked morning Volvo cruiser.
`;

const REMODE_SUPERVISED_TRAINING_PAIRS = [
  {
    instruction: "Evaluate a 150-minute weather delay on Flight 6E-512 from Mumbai (BOM) to Delhi (DEL) and generate the optimal recovery strategy.",
    input: "Mode: FLIGHT, Corridor: BOM->DEL, Delay: 150m, Downstream: Connecting Flight 6E-204 to BLR with 60m buffer, Weather: 65 mm/h rain, 60 km/h wind.",
    output: "### Disruption Assessment\n- Status: CANCELLED / MISSED_CONNECTION\n- Connection Impact: The 150-minute delay completely wipes out the 60-minute connection buffer (net deficit: -90m). Connecting Flight 6E-204 to Bengaluru is broken.\n\n### DGCA Passenger Rights & Refund\n- Under DGCA CAR Section 3, Series M, Part IV, delay exceeds 2 hours. Traveler is legally entitled to a 100% full refund without cancellation fees or free rebooking on the next available flight.\n\n### Recommended Recovery Strategy\n1. Reroute via Direct Flight BOM->BLR (e.g. AI-804 departing 18:30), bypassing the broken Delhi transit node entirely.\n2. Claim full refund for the un-flown BOM-DEL-BLR ticket.\n3. Protect downstream Oberoi Bengaluru hotel check-in by updating arrival ETA to 20:15."
  },
  {
    instruction: "Explain how RecoveryEngine's 13-factor scoring selects between an express cab and a Vande Bharat train when a flight to Jaipur is cancelled.",
    input: "Disrupted Item: Flight AI-491 (DEL->JAI), Reason: Runway waterlogging at IGI Airport, Alternatives: Delhi-Mumbai Expressway Cab vs Vande Bharat Express 20978.",
    output: "RecoveryEngine evaluates the 13-factor matrix:\n1. Schedule Cushion: Vande Bharat arrives at 19:00 (Buffer: 75m, Risk: LOW). Expressway Cab arrives at 19:45 (Buffer: 30m, Risk: MODERATE due to highway rain).\n2. Cost Delta: Vande Bharat Executive CC is ₹1,420 (offset by ₹3,800 airline refund = net savings ₹2,380). Cab is ₹4,200 (net cost +₹400).\n3. Critical Event Feasibility: Both protect the evening Dinner Keynote, but Vande Bharat scores higher on Provider Reliability (99.2%) and Luggage Ease.\nOutcome: Ranked Plan 1 is Vande Bharat Rail Bypass."
  },
  {
    instruction: "What are the passenger compensation entitlements when a train is delayed by more than 3 hours due to rail waterlogging?",
    input: "Transport: Indian Railways, Event: Track waterlogging >100mm over rail flange, Delay: 210 minutes.",
    output: "Under Indian Railways Passenger Charter and IRCTC TDR filing rules:\n1. 100% full refund of the ticket fare without any clerkage or cancellation charge deduction when train delay exceeds 3 hours and passenger chooses not to travel.\n2. In cases of official service cancellation due to submerged tracks, automated full refund is credited back to the source payment method without requiring a manual TDR filing.\n3. If passenger travels up to an intermediate station where track is blocked, proportionate refund for the untraveled distance is provided by the station master."
  },
  {
    instruction: "How does the Digital Twin simulate cascading ripple effects on an itinerary without mutating real booking rows?",
    input: "Simulation Input: { bookingId: 'flight-101', rainfallMm: 55, tempC: 26, stormDurationHrs: 2.5 }",
    output: "The Digital Twin achieves zero-mutation simulation via in-memory state cloning:\n1. Clones the active TripGraph into an isolated heap snapshot (JSON.parse(JSON.stringify(trip))).\n2. Traverses the 'dependsOn' directed acyclic graph to calculate schedule drift and buffer erosion for each dependent leg.\n3. Flags affected nodes with 'simulatedStatus' (CANCELLED, MISSED, AT_RISK) and calculates remaining buffer minutes.\n4. Returns the simulated impact telemetry directly to the UI sandbox while the persistent TripStore and database remain 100% untouched."
  }
];

function main() {
  const docsDir = path.resolve(__dirname, "../docs/nugen");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. Write domain rules v2
  const domainRulesPath = path.join(docsDir, "remode_domain_rules_v2.txt");
  fs.writeFileSync(domainRulesPath, REMODE_DOMAIN_RULES_V2, "utf-8");
  console.log(`[BuildDataset] Wrote ${domainRulesPath}`);

  // 2. Write JSON alignment dataset
  const jsonDatasetPath = path.join(docsDir, "remode_alignment_dataset.json");
  fs.writeFileSync(jsonDatasetPath, JSON.stringify(REMODE_SUPERVISED_TRAINING_PAIRS, null, 2), "utf-8");
  console.log(`[BuildDataset] Wrote ${jsonDatasetPath}`);

  console.log("[BuildDataset] Successfully generated comprehensive Nugen alignment datasets.");
}

main();
