/**
 * Flight Disruption Monitor Worker
 * Polls AeroDataBox RapidAPI for live status of active flights and injects disruptions into ReMode.
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "remode_internal_secret_2026";
const AERODATABOX_KEY = process.env.AERODATABOX_KEY || "";

function stripSpaces(s: string) {
  return (s || "").replace(/[\s-]+/g, "");
}

async function main() {
  console.log(`[FlightMonitor] Connecting to ${APP_URL}/api/internal/active-flight-bookings...`);

  const bookingsRes = await fetch(`${APP_URL}/api/internal/active-flight-bookings`, {
    headers: { "x-internal-secret": INTERNAL_SECRET },
  });

  if (!bookingsRes.ok) {
    console.error(`[FlightMonitor] Failed to fetch active bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
    return;
  }

  const bookings = await bookingsRes.json();
  console.log(`[FlightMonitor] Found ${bookings.length} active flight booking(s) to check.`);

  if (!AERODATABOX_KEY) {
    console.warn("[FlightMonitor] AERODATABOX_KEY is not configured in .env. Skipping live RapidAPI calls.");
    return;
  }

  for (const booking of bookings) {
    try {
      const flightNo = stripSpaces(booking.flightNumber);
      const url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNo}/${booking.date}?withAircraftImage=false&withFlightPlan=false&withLocation=false&dateLocalRole=Both`;
      
      console.log(`[FlightMonitor] Checking flight ${flightNo} on ${booking.date}...`);

      const res = await fetch(url, {
        headers: {
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
          "x-rapidapi-key": AERODATABOX_KEY,
        },
      });

      if (res.status === 204 || res.status === 404) {
        console.log(`[FlightMonitor] ${flightNo}: no live data found for ${booking.date} (HTTP ${res.status})`);
        continue;
      }

      if (!res.ok) {
        console.warn(`[FlightMonitor] AeroDataBox returned ${res.status} for ${flightNo}`);
        continue;
      }

      const text = await res.text();
      if (!text || text.trim() === "") {
        console.log(`[FlightMonitor] ${flightNo}: empty response from AeroDataBox`);
        continue;
      }

      const data = JSON.parse(text);
      const flight = Array.isArray(data) ? data[0] : data;
      if (!flight || !flight.departure) {
        console.log(`[FlightMonitor] ${flightNo}: no flight details found in response`);
        continue;
      }

      const scheduledUtc = flight.departure?.scheduledTime?.utc;
      if (!scheduledUtc) {
        console.log(`[FlightMonitor] ${flightNo}: no scheduled time found in flight response`);
        continue;
      }

      const scheduled = new Date(scheduledUtc);
      const revisedUtc = flight.departure?.revisedTime?.utc || flight.departure?.actualTime?.utc;
      const delayMinutes = revisedUtc
        ? Math.round((new Date(revisedUtc).getTime() - scheduled.getTime()) / 60000)
        : 0;
      const isCancelledOrDiverted = ["Cancelled", "Diverted"].includes(flight.status);

      console.log(`[FlightMonitor] ${flightNo}: status=${flight.status || "Scheduled"}, delay=${delayMinutes}min`);

      if (delayMinutes > 15 || isCancelledOrDiverted) {
        console.log(`[FlightMonitor] Alerting ReMode: Disruption detected for ${flightNo} on trip ${booking.tripId}`);
        const alertRes = await fetch(`${APP_URL}/api/trips/${booking.tripId}/disruptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            type: isCancelledOrDiverted ? "CANCELLATION" : "DELAY",
            source: "CARRIER_ALERT",
            delayMinutes: Math.max(delayMinutes, 0),
            description: isCancelledOrDiverted
              ? `Flight ${flightNo} ${flight.status.toLowerCase()}`
              : `Flight ${flightNo} delayed ${delayMinutes} min`,
          }),
        });

        if (alertRes.ok) {
          console.log(`[FlightMonitor] Disruption successfully injected into trip ${booking.tripId}`);
        } else {
          console.error(`[FlightMonitor] Failed to inject disruption: ${alertRes.status}`);
        }
      }
    } catch (err) {
      console.error(`[FlightMonitor] Error checking booking ${booking.id}:`, err);
    }
  }
}

main().catch((e) => {
  console.error("[FlightMonitor] Fatal error:", e);
  process.exit(1);
});

export {};
