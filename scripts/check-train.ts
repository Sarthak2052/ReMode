/**
 * Train Live Status Quick Checker
 * Usage: npm run check:train <trainNumber> [startDay]
 * Example: npm run check:train 20978
 */

const IRCTC1_KEY = process.env.IRCTC1_KEY || "f08fbd43c2msh169b9ee713c7fcep19a08fjsnd807b58e3ff5";

async function checkTrain(trainNoInput: string, startDay = 0) {
  const trainNo = (trainNoInput || "").replace(/[^0-9]/g, "");
  if (!trainNo) {
    console.error("Please provide a valid train number (e.g. 20978 or 12003).");
    process.exit(1);
  }

  console.log(`\n🔍 Fetching live running status for Train ${trainNo} (Day offset: ${startDay})...\n`);

  try {
    const url = `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?startDay=${startDay}&trainNo=${trainNo}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "irctc1.p.rapidapi.com",
        "x-rapidapi-key": IRCTC1_KEY,
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch live status (HTTP ${res.status}): ${res.statusText}`);
      return;
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      console.log(`No response received for train ${trainNo}.`);
      return;
    }

    const data = JSON.parse(text);
    if (!data.status || !data.data) {
      console.log(`❌ No live status available: ${data.message || "Unknown error"}`);
      return;
    }

    const t = data.data;
    const trainName = t.train_name || t.trainName || trainNo;
    const delay = Number(t.delay) || 0;
    const isCancelled = t.is_run_day === false || t.status === "Cancelled";

    console.log("==================================================================");
    console.log(`🚆 Train: ${trainNo} - ${trainName}`);
    console.log(`📅 Run Day: ${t.is_run_day ? "Active / Running Today" : "Not Running / Cancelled"}`);
    console.log(`⏱️ Current Delay: ${delay} minutes ${delay > 0 ? `(Late)` : `(On Time)`}`);
    console.log(`🚦 Status: ${isCancelled ? "CANCELLED" : t.new_message || t.status || "Running"}`);
    console.log("==================================================================");

    if (t.current_location_info && t.current_location_info.length > 0) {
      console.log("\n📍 Current Location:");
      for (const loc of t.current_location_info) {
        console.log(`   • ${loc.label}: ${loc.message}`);
      }
    }

    if (t.next_stoppage_info) {
      const next = t.next_stoppage_info;
      console.log(`\n⏭️ Next Halt: ${next.next_stoppage} (${next.next_stoppage_time_diff || "Approaching"})`);
      if (next.next_stoppage_delay !== undefined) {
        console.log(`   Estimated delay at next stop: ${next.next_stoppage_delay} min`);
      }
    }

    if (t.upcoming_stations && t.upcoming_stations.length > 0) {
      console.log("\n📋 Upcoming Stations:");
      const nextFew = t.upcoming_stations.slice(0, 5);
      for (const stn of nextFew) {
        console.log(
          `   • ${stn.station_name} (${stn.station_code}) - ETA: ${stn.eta || stn.sta || "--:--"} | Delay: ${stn.arrival_delay || 0} min | Plat: ${stn.platform_number || "TBD"}`
        );
      }
      if (t.upcoming_stations.length > 5) {
        console.log(`   ... and ${t.upcoming_stations.length - 5} more upcoming stations.`);
      }
    }

    console.log("==================================================================\n");
  } catch (err: any) {
    console.error("Error fetching live train status:", err?.message || err);
  }
}

const args = process.argv.slice(2);
const trainNumber = args[0] || "20978";
const startDay = args[1] ? parseInt(args[1], 10) : 0;

checkTrain(trainNumber, startDay).catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
