/**
 * Train Disruption Monitor Worker
 * Polls IRCTC1 RapidAPI for live running status of active trains and injects disruptions into ReMode.
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "remode_internal_secret_2026";
const IRCTC1_KEY = process.env.IRCTC1_KEY || "";

function stripSpaces(s: string) {
  return (s || "").replace(/[^0-9]/g, "") || (s || "").replace(/\s+/g, "");
}

// The IRCTC1 API requires a startDay integer (0 = today, 1 = yesterday, etc.)
function getStartDay(bookingDateStr: string) {
  if (!bookingDateStr) return 0;
  const bookingDate = new Date(bookingDateStr);
  const today = new Date();
  const diffTime = today.getTime() - bookingDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  return Math.max(0, diffDays);
}

async function main() {
  console.log(`[TrainMonitor] Connecting to ${APP_URL}/api/internal/active-train-bookings...`);

  const bookingsRes = await fetch(`${APP_URL}/api/internal/active-train-bookings`, {
    headers: { "x-internal-secret": INTERNAL_SECRET },
  });

  if (!bookingsRes.ok) {
    console.error(`[TrainMonitor] Failed to fetch active bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
    return;
  }

  const bookings = await bookingsRes.json();
  console.log(`[TrainMonitor] Found ${bookings.length} active train booking(s) to check.`);

  if (!IRCTC1_KEY) {
    console.warn("[TrainMonitor] IRCTC1_KEY is not configured in .env. Skipping live RapidAPI calls.");
    return;
  }

  for (const booking of bookings) {
    try {
      const trainNo = stripSpaces(booking.trainNumber);
      const startDay = booking.date ? getStartDay(booking.date) : 0;
      
      const url = `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?startDay=${startDay}&trainNo=${trainNo}`;
      console.log(`[TrainMonitor] Checking train ${trainNo} (startDay=${startDay}) for booking ${booking.id}...`);

      const res = await fetch(url, {
        headers: {
          "x-rapidapi-host": "irctc1.p.rapidapi.com",
          "x-rapidapi-key": IRCTC1_KEY,
        },
      });

      if (!res.ok) {
        console.warn(`[TrainMonitor] IRCTC API returned HTTP ${res.status} for train ${trainNo}`);
        continue;
      }

      const text = await res.text();
      if (!text || text.trim() === "") {
        console.log(`[TrainMonitor] ${trainNo}: empty response from IRCTC API`);
        continue;
      }

      let responseJson: any;
      try {
        responseJson = JSON.parse(text);
      } catch (e) {
        console.log(`[TrainMonitor] ${trainNo}: invalid JSON response`);
        continue;
      }
      
      if (!responseJson.status || !responseJson.data) { 
        console.log(`[TrainMonitor] ${trainNo}: no live data found (${responseJson.message || 'unknown status'})`); 
        continue; 
      }

      const trainData = responseJson.data;
      const trainName = trainData.train_name || trainData.trainName || trainNo;
      const delayMinutes = Number(trainData.delay) || 0;
      const isCancelled = trainData.is_run_day === false || trainData.status === "Cancelled";

      console.log(`[TrainMonitor] ${trainNo} (${trainName}): run_day=${trainData.is_run_day}, delay=${delayMinutes}min, status=${trainData.status || "Running"}`);

      // 60-minute threshold for Indian Railways
      if (delayMinutes > 60 || isCancelled) {
        console.log(`[TrainMonitor] Disruption detected for train ${trainNo}! Alerting ReMode trip ${booking.tripId}...`);
        const alertRes = await fetch(`${APP_URL}/api/trips/${booking.tripId}/disruptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_SECRET,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            type: isCancelled ? "CANCELLATION" : "DELAY",
            source: "CARRIER_ALERT",
            delayMinutes: Math.max(delayMinutes, 0),
            description: isCancelled
              ? `Train ${trainNo} (${trainName}) is cancelled`
              : `Train ${trainNo} (${trainName}) delayed ${delayMinutes} min`,
          }),
        });

        if (alertRes.ok) {
          console.log(`[TrainMonitor] Disruption successfully injected into trip ${booking.tripId}`);
        } else {
          console.error(`[TrainMonitor] Failed to inject disruption: ${alertRes.status}`);
        }
      }
    } catch (err) {
      console.error(`[TrainMonitor] Error checking booking ${booking.id}:`, err);
    }
  }
}

main().catch((e) => {
  console.error("[TrainMonitor] Fatal error:", e);
  process.exit(1);
});

export {};
