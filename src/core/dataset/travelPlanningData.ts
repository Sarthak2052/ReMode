/**
 * Comprehensive Indian Travel Knowledge Base & Itinerary Planning Catalog
 * Covers destinations, transit corridors, hotels, activities, and resilience advisories.
 */

export interface TransitOption {
  mode: "FLIGHT" | "TRAIN" | "BUS" | "CAB";
  title: string;
  provider: string;
  duration: string;
  costEstimateInr: number;
  departureHub: string;
  arrivalHub: string;
  highlights: string[];
  resilienceTip: string;
}

export interface AccommodationOption {
  tier: "LUXURY_5STAR" | "EXECUTIVE_BOUTIQUE" | "HERITAGE_RESORT" | "BUDGET_FRIENDLY";
  name: string;
  location: string;
  pricePerNightInr: number;
  vibe: string;
  cancellationPolicy: string;
  recommendedFor: string;
}

export interface ActivityOption {
  title: string;
  category: "ADVENTURE" | "CULTURE" | "BEACH_NATURE" | "DINING_NIGHTLIFE" | "WELLNESS";
  location: string;
  duration: string;
  costInr: number;
  highlights: string;
}

export interface DayItineraryLeg {
  dayNumber: number;
  title: string;
  timeSlot: string;
  activity: string;
  location: string;
  modeOfTransit?: string;
  costEstimateInr: number;
  bufferMinutes: number;
}

export interface DestinationGuide {
  id: string;
  name: string;
  aliases: string[];
  state: string;
  bestTimeToVisit: string;
  idealDurationDays: string;
  vibeDescription: string;
  transitOptions: TransitOption[];
  accommodations: AccommodationOption[];
  activities: ActivityOption[];
  sample3DayItinerary: DayItineraryLeg[];
  proResilienceTips: string[];
}

export const DESTINATION_GUIDES: Record<string, DestinationGuide> = {
  goa: {
    id: "dest-goa",
    name: "Goa (North & South)",
    aliases: ["goa", "madgaon", "panjim", "panaji", "vasco", "baga", "calangute", "vagator", "benaulim", "palolem"],
    state: "Goa",
    bestTimeToVisit: "Mid-October to March (Pleasant coastal breezes, beach shacks open, water sports operational)",
    idealDurationDays: "3 to 5 Days",
    vibeDescription: "Sun-drenched coastal paradise combining Portuguese heritage architecture, vibrant beach culture, luxury oceanfront retreats, and spice plantation gastronomy.",
    transitOptions: [
      {
        mode: "FLIGHT",
        title: "Direct Flights to Goa (IndiGo / Air India / Akasa)",
        provider: "IndiGo / Akasa Air",
        duration: "1h 15m (from BOM/BLR/HYD) | 2h 30m (from DEL)",
        costEstimateInr: 3850,
        departureHub: "BOM T2 / BLR T2 / DEL T3",
        arrivalHub: "Goa Mopa (GOX - North) or Dabolim (GOI - South)",
        highlights: ["Over 25 daily connections across Indian metros", "Terminal 2 lounge access", "Complimentary web check-in"],
        resilienceTip: "Choose GOX for Vagator/Anjuna/Panjim; choose GOI for Benaulim/Colva/Palolem. Allow 75m buffer for Mopa highway transit.",
      },
      {
        mode: "TRAIN",
        title: "Vande Bharat Express (20670 / 22229)",
        provider: "Indian Railways / Central Railway",
        duration: "7h 30m (from Pune) | 7h 45m (from Mumbai CSMT)",
        costEstimateInr: 1850,
        departureHub: "Pune Junction / CSMT",
        arrivalHub: "Madgaon Junction (MAO)",
        highlights: [
          "160 km/h semi-high speed transit traversing scenic Western Ghats tunnels",
          "180° Rotating Recliner Seats in Executive Chair Car (EC)",
          "Onboard hot regional breakfast and fresh coastal dining",
        ],
        resilienceTip: "99.1% punctuality track record. High reliability during monsoon when regional flights face weather holds.",
      },
      {
        mode: "TRAIN",
        title: "Goa Express (12780) via Dudhsagar Waterfalls",
        provider: "Indian Railways / IRCTC",
        duration: "13h 05m (Overnight Sleeper from Pune)",
        costEstimateInr: 1420,
        departureHub: "Pune Junction",
        arrivalHub: "Madgaon Junction (MAO)",
        highlights: [
          "Crosses iconic Dudhsagar Waterfalls rail viaduct at sunrise",
          "Comfortable 2nd AC / 3rd AC Sleeper berths",
          "Arrive 05:40 AM fresh in South Goa before beach traffic",
        ],
        resilienceTip: "Book 2A sleeper for peaceful sleep. Free cancellation up to 48 hours prior with minimal IRCTC deduction.",
      },
      {
        mode: "CAB",
        title: "Highway Express Innova Crysta Chauffeur",
        provider: "ReMode Verified Intercity Fleet",
        duration: "8h 30m via NH-48 & Amboli Ghat (Scenic mountain-to-coast descent)",
        costEstimateInr: 6500,
        departureHub: "Direct Doorstep Pickup (Pune / Mumbai)",
        arrivalHub: "Any Beachfront Resort in Goa",
        highlights: [
          "Private dedicated vehicle with professional hill-certified chauffeur",
          "Flexible departure time and customized stops at Kolhapur / Belgaum",
          "Luggage capacity up to 5 large bags + pets allowed",
        ],
        resilienceTip: "Zero airport security lines; perfect for family groups where per-person cost drops below flight fares.",
      },
      {
        mode: "BUS",
        title: "Multi-Axle Luxury AC Sleeper Coach (KSRTC / Seabird)",
        provider: "KSRTC Airavat / Seabird Club Class",
        duration: "10h 30m (Overnight)",
        costEstimateInr: 1250,
        departureHub: "Swargate / Borivali",
        arrivalHub: "Panjim Kadamba Bus Terminus / Mapusa",
        highlights: ["Fully flat individual sleeper pods with privacy curtains", "USB charging & reading lights", "Economical night travel"],
        resilienceTip: "Book lower berth for smoother ghats transit; 90% refund if cancelled >12h prior.",
      },
    ],
    accommodations: [
      {
        tier: "LUXURY_5STAR",
        name: "Taj Exotica Resort & Spa (Benaulim, South Goa)",
        location: "Calwaddo, Benaulim Beach",
        pricePerNightInr: 14500,
        vibe: "Serene Mediterranean-style beachfront palatial villas amidst 56 acres of lush gardens",
        cancellationPolicy: "100% refundable up to 72 hours prior to check-in",
        recommendedFor: "Couples, executive retreats, travelers seeking calm uncrowded white sand beaches",
      },
      {
        tier: "LUXURY_5STAR",
        name: "W Goa (Vagator, North Goa)",
        location: "Vagator Beachfront, North Goa",
        pricePerNightInr: 16000,
        vibe: "High-energy luxury resort perched over Chapora Fort and Vagator cliffs with Rock Pool sunset bar",
        cancellationPolicy: "Free cancellation up to 48 hours prior",
        recommendedFor: "Founders, nightlife enthusiasts, luxury seekers who want to be near top restaurants & beach clubs",
      },
      {
        tier: "HERITAGE_RESORT",
        name: "Heritage Fontainhas Boutique Haveli (Panjim)",
        location: "Latin Quarter, Panaji",
        pricePerNightInr: 5800,
        vibe: "19th-century Portuguese restored mansion with azulejo tiles, hand-carved balconies, and artisanal cafe",
        cancellationPolicy: "Full refund up to 7 days prior; 50% refund up to 48 hours",
        recommendedFor: "Culture & architecture lovers, foodies exploring authentic Goan cuisine",
      },
      {
        tier: "BUDGET_FRIENDLY",
        name: "Zostel Plus or Whispering Palms (Candolim)",
        location: "Candolim Beach Road",
        pricePerNightInr: 2800,
        vibe: "Vibrant beachside hub with co-working spaces, swimming pool, and community beach walks",
        cancellationPolicy: "Flexible 24-hour cancellation",
        recommendedFor: "Solo travelers, digital nomads, young professionals on a budget",
      },
    ],
    activities: [
      {
        title: "Dudhsagar Waterfalls 4x4 Jeep Safari & Spice Plantation",
        category: "ADVENTURE",
        location: "Bhagwan Mahavir Wildlife Sanctuary, Mollem",
        duration: "6 Hours",
        costInr: 2200,
        highlights: "Traverse river streams in rugged 4x4 jeeps to reach India's 5th highest waterfall, followed by authentic Goan buffet at Sahakari Spice Farm.",
      },
      {
        title: "Sunset Catamaran Sailing Cruise on Mandovi River",
        category: "BEACH_NATURE",
        location: "Britona / Panaji Jetty",
        duration: "2.5 Hours",
        costInr: 1800,
        highlights: "Private luxury catamaran cruise down the river mouth into the Arabian Sea with chilled beverages and live acoustic music.",
      },
      {
        title: "Fontainhas Latin Quarter Heritage & Food Walk",
        category: "CULTURE",
        location: "Fontainhas, Panaji",
        duration: "2 Hours",
        costInr: 950,
        highlights: "Guided stroll through Portuguese heritage streets, sampling fresh poee bread, bebinca, and visiting heritage art galleries.",
      },
      {
        title: "Scuba Diving & Dolphin Expedition at Grande Island",
        category: "ADVENTURE",
        location: "Sinquerim / Grande Island",
        duration: "4.5 Hours",
        costInr: 3200,
        highlights: "PADI-instructed shallow reef dive exploring marine coral and shipwrecks, with underwater HD photos and dolphin spotting.",
      },
    ],
    sample3DayItinerary: [
      {
        dayNumber: 1,
        title: "Coastal Arrival & Sun-Downer at Vagator",
        timeSlot: "11:30 - 15:00",
        activity: "Arrive via Vande Bharat / Flight, private chauffeur pickup, check-in to resort, coastal seafood lunch",
        location: "Vagator / Candolim",
        costEstimateInr: 4500,
        bufferMinutes: 60,
      },
      {
        dayNumber: 1,
        title: "Chapora Fort & Sunset at Rock Pool",
        timeSlot: "16:30 - 20:00",
        activity: "Panoramic cliff views over the Arabian Sea, sunset tapas and beachside music",
        location: "Chapora / Vagator",
        costEstimateInr: 1800,
        bufferMinutes: 45,
      },
      {
        dayNumber: 2,
        title: "Dudhsagar Jeep Safari & Spice Farm Feast",
        timeSlot: "08:00 - 14:30",
        activity: "Morning 4x4 safari through jungle sanctuary to waterfall pool, followed by organic spice tour & lunch",
        location: "Mollem / Ponda",
        costEstimateInr: 2400,
        bufferMinutes: 90,
      },
      {
        dayNumber: 2,
        title: "Fontainhas Panaji Heritage Walk & Dinner",
        timeSlot: "17:00 - 21:30",
        activity: "Explore Latin Quarter colorful cobblestone alleys, Portuguese bakery treats, dinner at Fisherman's Wharf",
        location: "Panjim",
        costEstimateInr: 1600,
        bufferMinutes: 45,
      },
      {
        dayNumber: 3,
        title: "South Goa Serenity & Beach Shack Brunch",
        timeSlot: "09:30 - 14:00",
        activity: "Lazy brunch at Benaulim beachfront, water sports or coastal cycling along the coconut palms",
        location: "Benaulim / Cavelossim",
        costEstimateInr: 1200,
        bufferMinutes: 60,
      },
      {
        dayNumber: 3,
        title: "Sunset Catamaran Cruise & Airport / Train Departure",
        timeSlot: "16:00 - 19:30",
        activity: "Sunset river sailing, airport transfer with 90m checked luggage buffer, return flight / train",
        location: "Mopa / Dabolim Airport",
        costEstimateInr: 3800,
        bufferMinutes: 90,
      },
    ],
    proResilienceTips: [
      "Airport Choice: Mopa (GOX) is 35km North; Dabolim (GOI) is central. Booking the wrong airport adds 1.5h cab rides.",
      "Taxi Pricing: Goa local taxis do not use meters; always book pre-paid airport counters or verified apps (GoaMiles).",
      "Monsoon Resilience: If traveling June–September, sea water sports are banned. Stick to inland heritage havelis, Dudhsagar streams, and Vande Bharat rail connections.",
      "Buffer Guidance: Allow at least 90 minutes before return flights due to evening highway congestion along the Mandovi and Zuari bridges.",
    ],
  },

  himachal: {
    id: "dest-himachal",
    name: "Himachal Pradesh (Manali • Shimla • Kasol • Dharamshala)",
    aliases: ["himachal", "manali", "shimla", "kasol", "dharamshala", "kullu", "spiti", "rohtang", "atal tunnel"],
    state: "Himachal Pradesh",
    bestTimeToVisit: "March to June (Pleasant weather & valleys) or December to February (Snowfall & winter sports)",
    idealDurationDays: "5 to 10 Days",
    vibeDescription: "Majestic snow-clad Himalayan peaks, cedar-forested mountain passes, Buddhist monasteries, gushing Beas river streams, and alpine pine log retreats.",
    transitOptions: [
      {
        mode: "FLIGHT",
        title: "Flight to Chandigarh (IXC) / Bhuntar-Kullu (KUU)",
        provider: "IndiGo / Alliance Air",
        duration: "1h 10m to Chandigarh + 5h scenic highway cab to Manali",
        costEstimateInr: 4500,
        departureHub: "DEL / BOM / BLR",
        arrivalHub: "Chandigarh International Airport (IXC)",
        highlights: ["Smooth highway link via 4-lane Kiratpur-Nerchowk expressway", "Saves 7 hours of mountain driving"],
        resilienceTip: "Alliance Air flies to Bhuntar (Kullu), but flights are frequently delayed by mountain clouds. Chandigarh flight + cab is 98% more reliable.",
      },
      {
        mode: "BUS",
        title: "HPTDC Volvo Super Luxury AC Sleeper / Semi-Sleeper",
        provider: "Himachal Pradesh Tourism (HPTDC)",
        duration: "12h 00m (Overnight from Delhi Majnu Ka Tila / Kashmere Gate)",
        costEstimateInr: 1450,
        departureHub: "Delhi ISBT / Majnu Ka Tila",
        arrivalHub: "Manali Private Bus Stand",
        highlights: ["Punctual state-run drivers trained in night mountain hairpin driving", "Air suspension for smooth ghats sleep"],
        resilienceTip: "Strictly avoid non-certified private buses during monsoon to prevent highway breakdown delays.",
      },
      {
        mode: "TRAIN",
        title: "Vande Bharat Express (Delhi ➔ Chandigarh) + Toy Train to Shimla",
        provider: "Indian Railways / UNESCO Kalka-Shimla Railway",
        duration: "3h 15m to Chandigarh + UNESCO heritage mountain crawl to Shimla",
        costEstimateInr: 1250,
        departureHub: "New Delhi Railway Station",
        arrivalHub: "Chandigarh / Shimla",
        highlights: ["World heritage narrow-gauge rail passing 102 tunnels and 800+ bridges", "Stunning pine valley vistas"],
        resilienceTip: "Note: Manali has NO railway station. Rail terminates at Chandigarh / Kalka.",
      },
    ],
    accommodations: [
      {
        tier: "LUXURY_5STAR",
        name: "Wildflower Hall, An Oberoi Resort (Shimla)",
        location: "Mashobra, Shimla",
        pricePerNightInr: 22000,
        vibe: "Former residence of Lord Kitchener nestled amidst 22 acres of virgin cedar forest with heated infinity pool",
        cancellationPolicy: "100% refundable up to 7 days prior",
        recommendedFor: "Honeymooners, luxury alpine seekers, wellness enthusiasts",
      },
      {
        tier: "EXECUTIVE_BOUTIQUE",
        name: "The Himalayan Resort & Spa (Manali)",
        location: "Hadimba Road, Manali",
        pricePerNightInr: 8500,
        vibe: "Victorian Gothic stone castle with antique fireplaces, mountain orchards, and heated outdoor pool",
        cancellationPolicy: "Full refund up to 15 days prior as per Himachal brochure policy",
        recommendedFor: "Families, mountain retreat travelers",
      },
    ],
    activities: [
      {
        title: "Atal Tunnel & Sissu Lahaul Valley Excursion",
        category: "ADVENTURE",
        location: "Atal Tunnel & Sissu, Lahaul",
        duration: "5 Hours",
        costInr: 2500,
        highlights: "Drive through the 9.02km engineering marvel under Rohtang Pass into the dramatic snow mountains and waterfalls of Lahaul.",
      },
      {
        title: "Solang Valley Paragliding & Skiing Experience",
        category: "ADVENTURE",
        location: "Solang Valley",
        duration: "3 Hours",
        costInr: 3200,
        highlights: "Tandem paragliding over alpine meadows with panoramic views of Pir Panjal peaks.",
      },
    ],
    sample3DayItinerary: [
      {
        dayNumber: 1,
        title: "Arrival in Manali, Hadimba Temple & Old Manali Cafes",
        timeSlot: "10:00 - 15:30",
        activity: "Arrive via luxury Volvo, check in, cedar forest walk at Hadimba Temple, artisanal trout lunch in Old Manali",
        location: "Old Manali",
        costEstimateInr: 2800,
        bufferMinutes: 60,
      },
      {
        dayNumber: 2,
        title: "Atal Tunnel, Sissu Waterfall & Snow Point",
        timeSlot: "08:30 - 16:00",
        activity: "4x4 mountain drive through Atal Tunnel, river walk at Sissu, snow activities",
        location: "Lahaul Valley",
        costEstimateInr: 3500,
        bufferMinutes: 90,
      },
      {
        dayNumber: 3,
        title: "Solang Adventure & Naggar Heritage Castle",
        timeSlot: "09:00 - 16:30",
        activity: "Paragliding at Solang, visit 500-year-old Naggar Castle & Nicholas Roerich art gallery, evening departure",
        location: "Naggar / Solang",
        costEstimateInr: 3000,
        bufferMinutes: 90,
      },
    ],
    proResilienceTips: [
      "Severe Weather Ban: If active landslide alerts exist on NH-3 (DS_011), road travel is blocked. Wait in safe valley hubs.",
      "Himachal Cancellation Matrix: Cancellations >30 days prior yield 75% refund; 15–30 days yield 50%; <5 days are non-refundable.",
      "Winter Tires: December–February trips to Atal Tunnel require 4x4 vehicles with snow chains.",
    ],
  },

  jaipur: {
    id: "dest-jaipur",
    name: "Jaipur (The Pink City)",
    aliases: ["jaipur", "rajasthan", "amer", "hawa mahal", "city palace", "pink city"],
    state: "Rajasthan",
    bestTimeToVisit: "October to March (Warm sunny days and cool pleasant evenings)",
    idealDurationDays: "2 to 4 Days",
    vibeDescription: "Royal Rajputana grandeur with iconic pink sandstone palaces, hilltop forts, artisanal gem bazaars, and vibrant Rajasthani cuisine.",
    transitOptions: [
      {
        mode: "TRAIN",
        title: "Vande Bharat Express (20978)",
        provider: "Indian Railways / North Western Railway",
        duration: "3h 40m (from Delhi Cantt)",
        costEstimateInr: 1250,
        departureHub: "Delhi Cantt (DEC)",
        arrivalHub: "Jaipur Junction (JP)",
        highlights: ["160 km/h corridor beating highway transit time", "Executive Chair Car luxury"],
        resilienceTip: "Most punctual corridor between Delhi and Jaipur with 99.4% on-time record.",
      },
      {
        mode: "CAB",
        title: "Delhi-Jaipur Expressway Highway Cab",
        provider: "Intercity Highway Chauffeur",
        duration: "4h 15m via Delhi-Mumbai Expressway (NE-4)",
        costEstimateInr: 3500,
        departureHub: "Doorstep Pickup Delhi NCR",
        arrivalHub: "Jaipur Resort / Hotel",
        highlights: ["Access-controlled 8-lane expressway with smooth cruising at 120 km/h"],
        resilienceTip: "Ideal fallback when train tickets are waitlisted (Benchmark DS_004).",
      },
    ],
    accommodations: [
      {
        tier: "HERITAGE_RESORT",
        name: "Rambagh Palace / Samode Haveli",
        location: "Bhawani Singh Road, Jaipur",
        pricePerNightInr: 18000,
        vibe: "Original royal residence with peacock gardens, marble verandas, and regal hospitality",
        cancellationPolicy: "100% refundable up to 5 days prior",
        recommendedFor: "Heritage lovers, luxury celebrations",
      },
    ],
    activities: [
      {
        title: "Amer Fort Guided Heritage Tour & Sheesh Mahal",
        category: "CULTURE",
        location: "Amer, Jaipur",
        duration: "3 Hours",
        costInr: 1200,
        highlights: "Explore 16th-century fortress, mirror palace, and panoramic views over Maota Lake.",
      },
    ],
    sample3DayItinerary: [
      {
        dayNumber: 1,
        title: "City Palace, Hawa Mahal & Johari Bazaar Gems",
        timeSlot: "10:00 - 16:00",
        activity: "Royal museum walk at City Palace, photography at Hawa Mahal, artisanal shopping for blue pottery & block prints",
        location: "Old City Pink Quarters",
        costEstimateInr: 2200,
        bufferMinutes: 45,
      },
    ],
    proResilienceTips: [
      "Highway vs Rail: Rail is faster during winter fog (December-January) when expressway morning visibility drops.",
    ],
  },
};

/**
 * Searches the destination knowledge base by fuzzy matching query keywords
 */
export function findDestinationGuide(query: string): DestinationGuide | null {
  if (!query) return null;
  const q = query.toLowerCase();

  for (const guide of Object.values(DESTINATION_GUIDES)) {
    if (guide.aliases.some((alias) => q.includes(alias))) {
      return guide;
    }
  }

  // Check state names
  if (q.includes("goa")) return DESTINATION_GUIDES.goa;
  if (q.includes("manali") || q.includes("himachal") || q.includes("shimla")) return DESTINATION_GUIDES.himachal;
  if (q.includes("jaipur") || q.includes("rajasthan")) return DESTINATION_GUIDES.jaipur;

  return null;
}
