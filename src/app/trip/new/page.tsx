"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  Plane,
  Car,
  Hotel,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  DollarSign,
  Luggage,
  Train,
  CheckCircle2,
  Zap,
  Sliders,
  User,
  Phone,
  Briefcase,
  Navigation,
  Compass,
  Bus,
  Award,
} from "lucide-react";
import { ItineraryItem, ItemType, Priority } from "@/types";
import { AnimatedCloudPlanesBackground } from "@/components/AnimatedCloudPlanesBackground";
import {
  CatalogOption,
  getRouteTransportCatalog,
  getRouteRecommendedTemplate,
} from "@/core/dataset/routeCatalogs";

interface IndianRoutePreset {
  id: string;
  badge: string;
  badgeColor: string;
  fromCity: string;
  toCity: string;
  routeCode: string;
  title: string;
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerName: string;
  priority: "SPEED" | "LOWEST_COST" | "MIN_CHANGES" | "BALANCED";
  duration: string;
  primaryMode: string;
  icon: any;
  tripIdRedirect?: string;
  highlight: string;
}

const INDIAN_ROUTE_PRESETS: IndianRoutePreset[] = [
  {
    id: "bom-blr",
    badge: "Tech Summit",
    badgeColor: "bg-[#EAF5FF] text-[#1C6FD9] border-[#74BCFB]/40",
    fromCity: "Mumbai",
    toCity: "Bengaluru",
    routeCode: "BOM → BLR",
    title: "Bengaluru Global AI & Tech Summit",
    source: "Mumbai (BOM T2)",
    destination: "Bengaluru, Karnataka",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    travelerName: "Dr. Aarav Sharma",
    priority: "SPEED",
    duration: "4 Days • 3 Nights",
    primaryMode: "Domestic Flight + Chauffeur",
    icon: Plane,
    highlight: "Keynote anchor protection & priority transit",
  },
  {
    id: "del-jai",
    badge: "CleanTech Conclave",
    badgeColor: "bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]",
    fromCity: "Delhi",
    toCity: "Jaipur",
    routeCode: "DEL → JAI",
    title: "Jaipur Heritage & CleanTech Conclave",
    source: "Delhi (DEL T3)",
    destination: "Jaipur, Rajasthan",
    startDate: "2026-10-20",
    endDate: "2026-10-23",
    travelerName: "Priya Patel",
    priority: "LOWEST_COST",
    duration: "4 Days • 3 Nights",
    primaryMode: "Expressway Highway & Rail",
    icon: Car,
    highlight: "Cost-optimized intercity link with refund tiers",
  },
  {
    id: "bom-him",
    badge: "10D Himalayan Circuit",
    badgeColor: "bg-[#E6FBF7] text-[#047857] border-[#A7F3D0]",
    fromCity: "Mumbai",
    toCity: "Himachal & Amritsar",
    routeCode: "CSMT → SML/ASR",
    title: "10D/10N Himachal Expedition (Shimla • Manali • Kasol • Amritsar)",
    source: "Mumbai (CSMT)",
    destination: "Himachal Pradesh & Amritsar",
    startDate: "2026-10-15",
    endDate: "2026-10-25",
    travelerName: "Aarav Sharma",
    priority: "BALANCED",
    duration: "10 Days • 10 Nights",
    primaryMode: "Toy Train + Volvo + Rafting",
    icon: Compass,
    tripIdRedirect: "trip-himachal-10d",
    highlight: "Scenic heritage mountain railway & multi-modal circuit",
  },
  {
    id: "hyd-blr",
    badge: "Vande Bharat Semi-High Speed",
    badgeColor: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
    fromCity: "Hyderabad",
    toCity: "Bengaluru",
    routeCode: "HYD → BLR",
    title: "Deccan Cross-Hub Business Review",
    source: "Hyderabad (HYD)",
    destination: "Bengaluru (BLR)",
    startDate: "2026-11-05",
    endDate: "2026-11-08",
    travelerName: "Rohan Varma",
    priority: "MIN_CHANGES",
    duration: "4 Days • 3 Nights",
    primaryMode: "VB 20703 (160 km/h Corridor)",
    icon: Train,
    highlight: "Preserves stable bookings with 98.4% rail punctuality",
  },
  {
    id: "pnq-goa",
    badge: "Executive Offsite",
    badgeColor: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]",
    fromCity: "Pune",
    toCity: "Goa",
    routeCode: "PNQ → GOI",
    title: "Goa Coastal Leadership Offsite",
    source: "Pune (PNQ)",
    destination: "Goa (GOI)",
    startDate: "2026-11-12",
    endDate: "2026-11-15",
    travelerName: "Ananya Deshmukh",
    priority: "BALANCED",
    duration: "4 Days • 3 Nights",
    primaryMode: "Air & Coastal Luxury Stay",
    icon: Hotel,
    highlight: "Balanced cushion for coastal conferences & dinner debriefs",
  },
  {
    id: "del-bom",
    badge: "Financial Trunk",
    badgeColor: "bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]",
    fromCity: "Delhi",
    toCity: "Mumbai",
    routeCode: "DEL → BOM",
    title: "Mumbai Financial Capital Summit",
    source: "Delhi (DEL T3)",
    destination: "Mumbai (BOM T2)",
    startDate: "2026-11-18",
    endDate: "2026-11-20",
    travelerName: "Vikram Malhotra",
    priority: "SPEED",
    duration: "3 Days • 2 Nights",
    primaryMode: "High-Frequency Metro & Air",
    icon: Briefcase,
    highlight: "Rapid airport routing safeguarding key meetings",
  },
];


const TRANSPORT_MODES: {
  type: ItemType;
  label: string;
  title: string;
  icon: any;
  iconEmoji: string;
  countBadge: string;
}[] = [
  {
    type: "TRAIN",
    label: "Train (Express/VB)",
    title: "Indian Rail & High-Speed Vande Bharat",
    icon: Train,
    iconEmoji: "🚆",
    countBadge: "5 Trains Available",
  },
  {
    type: "FLIGHT",
    label: "Flight (Domestic)",
    title: "Domestic Flights & Airlines",
    icon: Plane,
    iconEmoji: "✈️",
    countBadge: "4 Flights Available",
  },
  {
    type: "TRANSFER",
    label: "Cab / EV Transfer",
    title: "Airport Chauffeurs & EV Cabs",
    icon: Car,
    iconEmoji: "🚕",
    countBadge: "4 Cabs Available",
  },
  {
    type: "HOTEL",
    label: "Hotel & Stay",
    title: "Executive 5-Star & Heritage Hotels",
    icon: Hotel,
    iconEmoji: "🏨",
    countBadge: "4 Hotels Available",
  },
  {
    type: "ACTIVITY",
    label: "Volvo / Excursion",
    title: "Intercity Volvo Coaches & Excursions",
    icon: Bus,
    iconEmoji: "⛰️",
    countBadge: "3 Coaches Available",
  },
];

const INDIAN_TRANSPORT_CATALOG: Partial<Record<ItemType, CatalogOption[]>> = {
  TRAIN: [
    {
      id: "opt-trn-1",
      type: "TRAIN",
      title: "Vande Bharat Express (20703)",
      provider: "Indian Railways / IRCTC",
      referenceNumber: "IRCTC-VB-20703",
      startTime: "05:45",
      endTime: "14:00",
      departureLocation: "KSR Bengaluru (SBC)",
      arrivalLocation: "Kacheguda / Hyderabad (KCG)",
      location: "SBC Platform 1",
      cost: 2450,
      priority: "HIGH",
      bufferMinutes: 90,
      classBadge: "Executive Chair Car (EC)",
      tagline: "160 km/h Semi-High Speed corridor with 180° rotating ergonomic seats",
      features: [
        "98.4% Punctuality Track Record",
        "Onboard Hot Gourmet Breakfast & Lunch",
        "Bio-Vacuum Aerodynamic Coaches",
      ],
      metadata: { trainNumber: "20703", seat: "EC-E1" },
    },
    {
      id: "opt-trn-2",
      type: "TRAIN",
      title: "Mumbai CSMT Rajdhani Express (22221)",
      provider: "Indian Railways / IRCTC",
      referenceNumber: "IRCTC-RD-22221",
      startTime: "16:00",
      endTime: "09:55",
      departureLocation: "Mumbai CSMT",
      arrivalLocation: "Hazrat Nizamuddin / Delhi (NZM)",
      location: "CSMT Platform 18",
      cost: 3850,
      priority: "HIGH",
      bufferMinutes: 120,
      classBadge: "1st AC / 2nd AC Suite",
      tagline: "Flagship overnight express connecting financial and national capitals",
      features: [
        "Complimentary Multi-course Dinner",
        "Sanitized Bedroll & Attendant Call",
        "Priority Track Clearance",
      ],
      metadata: { trainNumber: "22221", seat: "H1-04" },
    },
    {
      id: "opt-trn-3",
      type: "TRAIN",
      title: "Amritsar Shatabdi Express (12013)",
      provider: "Indian Railways / IRCTC",
      referenceNumber: "IRCTC-SHT-12013",
      startTime: "16:30",
      endTime: "22:45",
      departureLocation: "New Delhi (NDLS)",
      arrivalLocation: "Amritsar Junction (ASR)",
      location: "NDLS Platform 1",
      cost: 1480,
      priority: "MEDIUM",
      bufferMinutes: 60,
      classBadge: "AC Chair Car (CC)",
      tagline: "Fast superfast evening intercity connection across Punjab plains",
      features: [
        "Complimentary Evening Tea & Snacks",
        "Speed: 130 km/h Corridor",
        "Wide Panoramic Windows",
      ],
      metadata: { trainNumber: "12013", seat: "C4-22" },
    },
    {
      id: "opt-trn-4",
      type: "TRAIN",
      title: "Paschim Superfast Express (12926)",
      provider: "Indian Railways / IRCTC",
      referenceNumber: "IRCTC-PS-12926",
      startTime: "07:20",
      endTime: "14:45",
      departureLocation: "Amritsar Junction (ASR)",
      arrivalLocation: "Mumbai Central (MMCT)",
      location: "ASR Platform 2",
      cost: 2100,
      priority: "HIGH",
      bufferMinutes: 90,
      classBadge: "3rd AC (3A)",
      tagline: "Benchmark DS_007 artery train from Punjab through Delhi to Mumbai",
      features: [
        "Pantry Car & E-Catering Enabled",
        "Side-Lower Laptop Charging Ports",
        "Confirmed Berth Guarantee",
      ],
      metadata: { trainNumber: "12926", seat: "B2-35" },
    },
    {
      id: "opt-trn-5",
      type: "TRAIN",
      title: "Kalka Shimla Himalayan Toy Train (52453)",
      provider: "Northern Railway (Heritage)",
      referenceNumber: "IRCTC-TOY-52453",
      startTime: "06:20",
      endTime: "11:35",
      departureLocation: "Kalka Junction (KLK)",
      arrivalLocation: "Shimla Station (SML)",
      location: "KLK Narrow Gauge Platform",
      cost: 650,
      priority: "MEDIUM",
      bufferMinutes: 45,
      classBadge: "First Class Heritage Railcar",
      tagline: "UNESCO World Heritage mountain railway ascending 102 tunnels into pine forests",
      features: [
        "Spectacular Shivalik Hill Panoramas",
        "Heritage Steam Nostalgia",
        "Continuous Moderate Gradient",
      ],
      metadata: { trainNumber: "52453", seat: "FC-12" },
    },
  ],
  FLIGHT: [
    {
      id: "opt-flt-1",
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
      priority: "HIGH",
      bufferMinutes: 75,
      classBadge: "Economy Non-Stop",
      tagline: "Punctual morning executive corridor connecting Mumbai & Bengaluru",
      features: [
        "Airbus A321neo Modern Aircraft",
        "DigiYatra Express Biometric Gate",
        "Terminal 2 Aerobridge Arrival",
      ],
      metadata: { flightNumber: "6E-512", seat: "4F" },
    },
    {
      id: "opt-flt-2",
      type: "FLIGHT",
      title: "Air India AI-804 (DEL T3 → BOM T2)",
      provider: "Air India",
      referenceNumber: "AI804-DELBOM",
      startTime: "07:00",
      endTime: "09:15",
      departureLocation: "Delhi (DEL T3)",
      arrivalLocation: "Mumbai (BOM T2)",
      location: "BOM Terminal 2 Arrivals",
      cost: 6200,
      priority: "HIGH",
      bufferMinutes: 80,
      classBadge: "Economy Premium",
      tagline: "Twin-aisle widebody flight with complimentary hot breakfast",
      features: [
        "Boeing 787 Dreamliner",
        "Seatback Entertainment Screens",
        "25kg Checked Baggage Allowance",
      ],
      metadata: { flightNumber: "AI-804", seat: "12A" },
    },
    {
      id: "opt-flt-3",
      type: "FLIGHT",
      title: "Akasa Air QP-1372 (BLR T2 → BOM T1)",
      provider: "Akasa Air",
      referenceNumber: "QP1372-BLRBOM",
      startTime: "11:30",
      endTime: "13:10",
      departureLocation: "Bengaluru (BLR T2)",
      arrivalLocation: "Mumbai (BOM T1)",
      location: "BOM Terminal 1 Arrivals",
      cost: 4800,
      priority: "MEDIUM",
      bufferMinutes: 60,
      classBadge: "Economy Saver",
      tagline: "Eco-friendly fuel-efficient fleet with USB-A & USB-C ports at every seat",
      features: [
        "Boeing 737 MAX Aircraft",
        "Fresh Café Akasa Meal Selection",
        "Rapid 30-min Gate Turnaround",
      ],
      metadata: { flightNumber: "QP-1372", seat: "8C" },
    },
    {
      id: "opt-flt-4",
      type: "FLIGHT",
      title: "Vistara UK-812 (DEL T3 → BLR T2)",
      provider: "Vistara / Tata SIA",
      referenceNumber: "UK812-DELBLR",
      startTime: "09:15",
      endTime: "12:00",
      departureLocation: "Delhi (DEL T3)",
      arrivalLocation: "Bengaluru (BLR T2)",
      location: "BLR Terminal 2 Arrivals",
      cost: 6800,
      priority: "HIGH",
      bufferMinutes: 90,
      classBadge: "Premium Economy",
      tagline: "Full-service luxury hospitality with lounge access and priority luggage",
      features: [
        "Priority Boarding & Luggage Drop",
        "Extra 3-inch Legroom",
        "Chef-Curated In-flight Dining",
      ],
      metadata: { flightNumber: "UK-812", seat: "3D" },
    },
  ],
  TRANSFER: [
    {
      id: "opt-trf-1",
      type: "TRANSFER",
      title: "Kempegowda Airport Priority EV Cab (BluSmart)",
      provider: "BluSmart / Executive EV Fleet",
      referenceNumber: "EV-BLR-9921",
      startTime: "10:00",
      endTime: "11:15",
      departureLocation: "BLR Terminal 2 Pickup",
      arrivalLocation: "Palace Grounds, Bengaluru",
      location: "Palace Grounds Gate 4",
      cost: 1850,
      priority: "MEDIUM",
      bufferMinutes: 45,
      classBadge: "Executive Electric Sedan",
      tagline: "100% on-time pickup with zero driver cancellation and zero surge pricing",
      features: [
        "Dedicated Fast-Track Airport EV Lane",
        "Silent Eco-friendly Ride",
        "Direct Highway Toll Included",
      ],
      metadata: { vehicle: "MG ZS EV Sedan" },
    },
    {
      id: "opt-trf-2",
      type: "TRANSFER",
      title: "Executive Chauffeur Innova Crysta",
      provider: "Mumbai Premium Chauffeur",
      referenceNumber: "CHAUFFEUR-BOM-01",
      startTime: "10:00",
      endTime: "10:45",
      departureLocation: "Mumbai (BOM T2 Arrivals)",
      arrivalLocation: "Bandra Kurla Complex (BKC)",
      location: "BKC Financial Tower G-Block",
      cost: 2400,
      priority: "MEDIUM",
      bufferMinutes: 45,
      classBadge: "Luxury SUV Chauffeur",
      tagline: "Uniformed driver with curbside iPad nameplate greeting and AC pre-cooled",
      features: [
        "Chilled Bottled Water & Mints",
        "High-Speed Wi-Fi Dongle",
        "Bandra-Worli Sea Link Pass",
      ],
      metadata: { vehicle: "Toyota Innova Crysta" },
    },
    {
      id: "opt-trf-3",
      type: "TRANSFER",
      title: "Delhi Airport Express Metro (Orange Line)",
      provider: "Delhi Metro Rail Corp (DMRC)",
      referenceNumber: "DMRC-ORANGE-01",
      startTime: "09:30",
      endTime: "09:55",
      departureLocation: "DEL Terminal 3 Metro Station",
      arrivalLocation: "New Delhi Railway Station (NDLS)",
      location: "NDLS Metro Interchange Gate 1",
      cost: 60,
      priority: "MEDIUM",
      bufferMinutes: 30,
      classBadge: "High-Speed Rapid Rail",
      tagline: "Bypasses all Dhaula Kuan road traffic with 100% arrival certainty",
      features: [
        "Zero Road Traffic Delay Risk",
        "Trains Every 10 Minutes",
        "Direct Air-to-Rail Baggage Trolley",
      ],
      metadata: { transitMode: "Metro Rail" },
    },
    {
      id: "opt-trf-4",
      type: "TRANSFER",
      title: "Himalayan 4x4 Mountain Transfer",
      provider: "Himachal Tourism Chauffeur",
      referenceNumber: "HIM-4X4-TRANSFER",
      startTime: "08:00",
      endTime: "14:00",
      departureLocation: "Chandigarh Airport (IXC)",
      arrivalLocation: "Manali Mall Road",
      location: "Manali Town Center",
      cost: 4500,
      priority: "MEDIUM",
      bufferMinutes: 60,
      classBadge: "All-Weather 4WD SUV",
      tagline: "Professional mountain driver experienced with Himalayan passes and weather bypasses",
      features: [
        "All-Weather 4-Wheel Drive",
        "Heated Passenger Cabin",
        "Scenic River Viewpoint Halts",
      ],
      metadata: { vehicle: "Mahindra Scorpio 4x4" },
    },
  ],
  HOTEL: [
    {
      id: "opt-htl-1",
      type: "HOTEL",
      title: "The Oberoi Bengaluru",
      provider: "The Oberoi Group",
      referenceNumber: "OBR-BLR-401",
      startTime: "14:30",
      endTime: "15:15",
      departureLocation: "37-39 MG Road, Bengaluru",
      arrivalLocation: "37-39 MG Road, Bengaluru",
      location: "37-39 MG Road, Bengaluru",
      cost: 12500,
      priority: "MEDIUM",
      bufferMinutes: 180,
      classBadge: "5-Star Luxury Garden Premier",
      tagline: "Centrally located luxury sanctuary amidst centuries-old landscaped rain trees",
      features: [
        "24-hr Executive Cloakroom & Bag Drop",
        "Ultra-Fast Fiber Internet",
        "Express Curbside Check-in",
      ],
      metadata: { roomType: "Deluxe Garden View Room" },
    },
    {
      id: "opt-htl-2",
      type: "HOTEL",
      title: "Taj West End Bengaluru",
      provider: "Taj Hotels / IHCL",
      referenceNumber: "TAJ-BLR-881",
      startTime: "14:00",
      endTime: "15:00",
      departureLocation: "Race Course Road, Bengaluru",
      arrivalLocation: "Race Course Road, Bengaluru",
      location: "Race Course Road, Bengaluru",
      cost: 15000,
      priority: "MEDIUM",
      bufferMinutes: 180,
      classBadge: "Heritage Luxury Villa Resort",
      tagline: "20-acre lush heritage estate only 10 minutes from Palace Grounds venue",
      features: [
        "Dedicated Butler Concierge",
        "Close Proximity to Keynote Pavilion",
        "Historic Garden Verandah",
      ],
      metadata: { roomType: "Heritage Grand Room" },
    },
    {
      id: "opt-htl-3",
      type: "HOTEL",
      title: "Grand Hyatt Mumbai Hotel & Residences",
      provider: "Hyatt Hotels",
      referenceNumber: "HYATT-BOM-102",
      startTime: "15:00",
      endTime: "15:45",
      departureLocation: "BKC / Santacruz East, Mumbai",
      arrivalLocation: "BKC / Santacruz East, Mumbai",
      location: "Vakola, Santacruz East, Mumbai",
      cost: 14000,
      priority: "MEDIUM",
      bufferMinutes: 180,
      classBadge: "5-Star Club King Suite",
      tagline: "Located 10 mins from BOM T2 with integrated luxury convention center",
      features: [
        "Executive Club Lounge Privileges",
        "Acoustic Soundproof Glazing",
        "24-hr Chauffeur Standby",
      ],
      metadata: { roomType: "Grand Club Suite" },
    },
    {
      id: "opt-htl-4",
      type: "HOTEL",
      title: "Club Mahindra White Meadows Manali",
      provider: "Club Mahindra Resorts",
      referenceNumber: "CM-MANALI-304",
      startTime: "13:00",
      endTime: "14:00",
      departureLocation: "Prini, Manali, Himachal Pradesh",
      arrivalLocation: "Prini, Manali, Himachal Pradesh",
      location: "Prini, Naggar Road, Manali",
      cost: 8500,
      priority: "MEDIUM",
      bufferMinutes: 180,
      classBadge: "Himalayan Alpine Suite",
      tagline: "Serene alpine property overlooking snow-capped Pir Panjal ranges and pine groves",
      features: [
        "Private Balcony River View",
        "Radiant Central Heating",
        "Cozy Fireplace Lounge",
      ],
      metadata: { roomType: "Deluxe Himalayan Suite" },
    },
  ],
  EVENT: [
    {
      id: "opt-evt-1",
      type: "EVENT",
      title: "India AI Innovation Summit Opening Keynote",
      provider: "NASSCOM / Tech Council",
      referenceNumber: "KEYNOTE-IND-01",
      startTime: "12:00",
      endTime: "13:30",
      departureLocation: "Palace Grounds, Bengaluru",
      arrivalLocation: "Palace Grounds, Bengaluru",
      location: "Grand Ball Pavilion, Palace Grounds Gate 4",
      cost: 0,
      priority: "CRITICAL",
      bufferMinutes: 90,
      classBadge: "🔒 CRITICAL Anchor Commitment",
      tagline: "Inaugural keynote address on Enterprise Agentic AI. CANNOT be missed or rescheduled.",
      features: [
        "3,000+ CXO & Investor Audience",
        "Live Global Keynote Webcast",
        "Mandatory Anchor Protocol",
      ],
      notes: "CRITICAL COMMITMENT: Delivering inaugural keynote address. CANNOT be rescheduled.",
      metadata: { dressCode: "Formal Business", luggageDropOffAvailable: true },
    },
    {
      id: "opt-evt-2",
      type: "EVENT",
      title: "Global CleanTech & Energy Transition Keynote",
      provider: "India Energy & Tech Forum",
      referenceNumber: "KEYNOTE-CLEANTECH-02",
      startTime: "16:30",
      endTime: "18:00",
      departureLocation: "Grand Hyatt Convention Center, Mumbai",
      arrivalLocation: "Grand Hyatt Convention Center, Mumbai",
      location: "Grand Ballroom A, Grand Hyatt Mumbai",
      cost: 0,
      priority: "CRITICAL",
      bufferMinutes: 90,
      classBadge: "🔒 CRITICAL Anchor Commitment",
      tagline: "Opening speech for international delegates. Hard constraint in recovery engine.",
      features: [
        "VIP Green Room Access",
        "Zero Delay Tolerance Margin",
        "Global Media Coverage",
      ],
      notes: "CRITICAL EVENT: Traveler is delivering opening keynote speech at 16:30. CANNOT be missed.",
      metadata: { dressCode: "Business Formal" },
    },
    {
      id: "opt-evt-3",
      type: "EVENT",
      title: "Executive Venture Roundtable & Board Dinner",
      provider: "The Gateway Hotel / Karavalli",
      referenceNumber: "DINNER-KARAVALLI-01",
      startTime: "19:30",
      endTime: "21:30",
      departureLocation: "66 Residency Road, Bengaluru",
      arrivalLocation: "66 Residency Road, Bengaluru",
      location: "Karavalli Private Dining Room",
      cost: 6500,
      priority: "LOW",
      bufferMinutes: 660,
      classBadge: "HIGH Priority Leadership Dinner",
      tagline: "Exclusive private debrief dinner with senior technology partners and venture directors",
      features: [
        "Iconic Coastal Heritage Dining",
        "Private Intimate Courtyard",
        "Post-Summit Strategic Debrief",
      ],
      metadata: { dressCode: "Smart Casual" },
    },
  ],
  ACTIVITY: [
    {
      id: "opt-act-1",
      type: "ACTIVITY",
      title: "HPTDC Super Luxury Volvo Multi-Axle AC",
      provider: "Himachal Tourism (HPTDC)",
      referenceNumber: "HPTDC-VOLVO-801",
      startTime: "21:30",
      endTime: "06:30",
      departureLocation: "Delhi ISBT Kashmiri Gate",
      arrivalLocation: "Shimla Old Bus Stand",
      location: "Shimla Victory Tunnel Terminal",
      cost: 1150,
      priority: "MEDIUM",
      bufferMinutes: 60,
      classBadge: "Volvo Semi-Sleeper AC Coach",
      tagline: "State-tourism operated overnight hill coach with verified mountain suspension",
      features: [
        "Pneumatic Air Suspension",
        "Reclining Ergonomic Calf Rests",
        "Complimentary Packaged Water",
      ],
      metadata: { busType: "Volvo Multi-Axle B11R" },
    },
    {
      id: "opt-act-2",
      type: "ACTIVITY",
      title: "KSRTC Airavat Club Class Multi-Axle Volvo",
      provider: "Karnataka State RTC (KSRTC)",
      referenceNumber: "KSRTC-AIRAVAT-991",
      startTime: "22:00",
      endTime: "06:30",
      departureLocation: "Bengaluru Kempegowda Bus Stand",
      arrivalLocation: "Hyderabad MGBS",
      location: "MGBS Hyderabad Terminal 1",
      cost: 1250,
      priority: "MEDIUM",
      bufferMinutes: 60,
      classBadge: "Airavat Club Class Sleeper",
      tagline: "High-reliability overnight expressway service on NH-44 corridor",
      features: [
        "Individual USB & Reading Lights",
        "Live GPS Tracking Link",
        "Sanitized Pillow & Fleece Blanket",
      ],
      metadata: { busType: "Scania Metrolink Multi-Axle" },
    },
    {
      id: "opt-act-3",
      type: "ACTIVITY",
      title: "Beas River Grade-III White Water Rafting",
      provider: "Himalayan River Adventures (Kullu)",
      referenceNumber: "HIM-RAFTING-KULLU",
      startTime: "10:00",
      endTime: "12:30",
      departureLocation: "Pirdi Rafting Base, Kullu",
      arrivalLocation: "Jhiri River Camp, Himachal",
      location: "Beas River Basin, Kullu Valley",
      cost: 1400,
      priority: "LOW",
      bufferMinutes: 45,
      classBadge: "Himalayan Adventure Excursion",
      tagline: "14 km adrenaline-pumping descent through Class II & III rapids of River Beas",
      features: [
        "Certified Himalayan Raft Captains",
        "Full Immersion Thermal Wetsuits",
        "High-Res GoPro Video Clip Included",
      ],
      metadata: { rapidGrade: "Grade III" },
    },
  ],
};

export default function NewTripPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoaded } = useAuth();

  // Multi-step Page Wizard state: Step 1 (Route & Details) -> Step 2 (Itinerary Assembly)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Transport category selected in Step 3 (defaults to TRAIN)
  const [selectedTransportWay, setSelectedTransportWay] = useState<ItemType>("TRAIN");
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const getStoredUser = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("remode_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch {}
    }
    return null;
  };

  // Form Fields - Defaulted to Indian locations and carriers
  const [title, setTitle] = useState("Bengaluru Global AI & Tech Summit");
  const [source, setSource] = useState("Mumbai (BOM T2)");
  const [destination, setDestination] = useState("Bengaluru, Karnataka");
  const [startDate, setStartDate] = useState("2026-10-15");
  const [endDate, setEndDate] = useState("2026-10-18");
  const [travelerName, setTravelerName] = useState(() => user?.name || getStoredUser()?.name || "");
  const [travelerPhone, setTravelerPhone] = useState(() => user?.phone || getStoredUser()?.phone || "");
  const [priorityPreference, setPriorityPreference] = useState<
    "SPEED" | "LOWEST_COST" | "MIN_CHANGES" | "BALANCED"
  >("SPEED");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("bom-blr");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync traveler name and phone when user profile is loaded
  useEffect(() => {
    const activeName = user?.name || getStoredUser()?.name;
    const activePhone = user?.phone || getStoredUser()?.phone;
    if (activeName) {
      setTravelerName(activeName);
    }
    if (activePhone) {
      setTravelerPhone(activePhone);
    }
  }, [user]);

  // Auth Protection Effect: unauthenticated users cannot access trip creation
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace("/login?redirect=/trip/new");
    }
  }, [isLoaded, isAuthenticated, router]);

  // Configured Itinerary Items - defaults to the recommended template for the initial corridor
  const [items, setItems] = useState<Partial<ItineraryItem>[]>(() => {
    const defaultTemplate = getRouteRecommendedTemplate(
      "Mumbai (BOM T2)",
      "Bengaluru, Karnataka",
      "Bengaluru Global AI & Tech Summit"
    );
    return defaultTemplate.map((item, idx) => ({
      ...item,
      id: `leg-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
    }));
  });

  // Dynamic Route-Aware Transport Catalog based on user's selected Source & Destination
  const activeCatalog = getRouteTransportCatalog(source, destination);
  const cleanDestName = destination.split("(")[0].split(",")[0].trim() || "Destination";

  // Real-Time Live Train Search based on user's Source & Destination
  const [liveTrains, setLiveTrains] = useState<CatalogOption[] | null>(null);
  const [isLoadingLiveTrains, setIsLoadingLiveTrains] = useState(false);
  const [liveTrainMeta, setLiveTrainMeta] = useState<{
    isLiveApi: boolean;
    sourceType?: string;
    fromCode?: string;
    toCode?: string;
    sourceName?: string;
    destName?: string;
  } | null>(null);

  // Real-Time Live Flight Search based on user's Source & Destination
  const [liveFlights, setLiveFlights] = useState<CatalogOption[] | null>(null);
  const [isLoadingLiveFlights, setIsLoadingLiveFlights] = useState(false);
  const [liveFlightMeta, setLiveFlightMeta] = useState<{
    isLiveApi: boolean;
    sourceType?: string;
    fromAirport?: string;
    toAirport?: string;
    sourceName?: string;
    destName?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!source || !destination) return;

    async function fetchLiveTrains() {
      setIsLoadingLiveTrains(true);
      try {
        const res = await fetch(
          `/api/trains/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(startDate || "")}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.trains && Array.isArray(data.trains)) {
            setLiveTrains(data.trains);
            setLiveTrainMeta({
              isLiveApi: data.isLiveApi,
              sourceType: data.sourceType,
              fromCode: data.fromCode,
              toCode: data.toCode,
              sourceName: data.source,
              destName: data.destination,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch live trains for route:", err);
      } finally {
        if (isMounted) setIsLoadingLiveTrains(false);
      }
    }

    async function fetchLiveFlights() {
      setIsLoadingLiveFlights(true);
      try {
        const res = await fetch(
          `/api/flights/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(startDate || "")}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.flights && Array.isArray(data.flights)) {
            setLiveFlights(data.flights);
            setLiveFlightMeta({
              isLiveApi: data.isLiveApi,
              sourceType: data.sourceType,
              fromAirport: data.fromAirport || data.fromCode,
              toAirport: data.toAirport || data.toCode,
              sourceName: data.source,
              destName: data.destination,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch live flights for route:", err);
      } finally {
        if (isMounted) setIsLoadingLiveFlights(false);
      }
    }

    fetchLiveTrains();
    fetchLiveFlights();
    return () => {
      isMounted = false;
    };
  }, [source, destination, startDate]);

  // If session is verifying or user is not logged in, present clean Auth Required Guard
  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EAF5FF] text-[#0F1B2B] flex flex-col selection:bg-[#4FA8F8] selection:text-white relative overflow-hidden">
        <AnimatedCloudPlanesBackground />
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white border-2 border-[#1C6FD9]/30 rounded-3xl p-8 shadow-[0_12px_36px_rgba(28,111,217,0.12)] text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF5FF] border border-[#74BCFB]/40 flex items-center justify-center text-[#1C6FD9] mb-4 shadow-sm animate-pulse">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1C6FD9] bg-[#EAF5FF] px-2.5 py-1 rounded-full border border-[#74BCFB]/30 mb-2">
              Protected Feature
            </span>
            <h2 className="font-sans font-bold text-2xl text-[#0F1B2B] mb-2">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5B70] mb-6 leading-relaxed">
              Please sign in to your ReMode account to configure itineraries, access multi-modal route catalogs, and arm disruption recovery shields.
            </p>
            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={() => router.push("/login?redirect=/trip/new")}
                className="w-full py-3 px-5 rounded-xl bg-[#1C6FD9] hover:bg-[#155EC0] text-white font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(28,111,217,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Log In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/signup?redirect=/trip/new")}
                className="w-full py-2.5 px-5 rounded-xl bg-white hover:bg-[#F4FAFF] text-[#1C6FD9] border-2 border-[#1C6FD9]/30 font-bold text-sm transition-all cursor-pointer"
              >
                Create New Account
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Apply a preset - Quick-Fill Sample Corridors
  const applyPreset = (preset: typeof INDIAN_ROUTE_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    if (preset.tripIdRedirect) {
      try {
        localStorage.setItem("remode_active_trip_id", preset.tripIdRedirect);
      } catch {}
      router.push(`/dashboard?tripId=${preset.tripIdRedirect}`);
      return;
    }
    setTitle(preset.title);
    setSource(preset.source);
    setDestination(preset.destination);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);

    // CRITICAL: Do NOT use static preset names/phones. Retain the user's entered sign-up data
    const activeName = user?.name || getStoredUser()?.name || travelerName;
    const activePhone = user?.phone || getStoredUser()?.phone || travelerPhone;
    if (activeName) setTravelerName(activeName);
    if (activePhone) setTravelerPhone(activePhone);

    setPriorityPreference(preset.priority);
    // Auto-populate recommended itinerary template with unique IDs so the trip has its full itinerary
    const template = getRouteRecommendedTemplate(preset.source, preset.destination, preset.title);
    const freshItems = template.map((item, idx) => ({
      ...item,
      id: `leg-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setItems(freshItems);
  };

  // Self input / custom itinerary - blanks the route form for direct traveler entry while preserving user sign-up credentials
  const handleSelfInput = () => {
    setSelectedPresetId("custom");
    setTitle("");
    setSource("");
    setDestination("");
    setStartDate("");
    setEndDate("");

    // CRITICAL: Retain the user's entered sign-up name and phone
    const activeName = user?.name || getStoredUser()?.name || travelerName;
    const activePhone = user?.phone || getStoredUser()?.phone || travelerPhone;
    setTravelerName(activeName || "");
    setTravelerPhone(activePhone || "");
    setItems([]);
  };

  const addItem = (type: ItemType) => {
    const newId = `leg-${Date.now()}`;
    const cleanSrc = source.split("(")[0].trim() || "Departure City";
    const cleanDst = destination.split("(")[0].trim() || "Arrival City";
    const isGoa = destination.toLowerCase().includes("goa") || source.toLowerCase().includes("goa");

    let defaultTitle = `New ${type.toLowerCase()} leg`;
    let defaultCost = 3500;

    if (type === "FLIGHT") {
      defaultTitle = isGoa
        ? "IndiGo 6E-6321 (PNQ → GOX Mopa)"
        : `IndiGo Direct Flight (${cleanSrc} → ${cleanDst})`;
      defaultCost = isGoa ? 3850 : 4200;
    } else if (type === "TRAIN") {
      defaultTitle = isGoa
        ? "Vande Bharat Express (20670) Pune ➔ Madgaon"
        : `${cleanSrc} ➔ ${cleanDst} Vande Bharat Express`;
      defaultCost = isGoa ? 1850 : 1950;
    } else if (type === "TRANSFER") {
      defaultTitle = isGoa
        ? "Goa Airport Priority EV Chauffeur"
        : `${cleanDst} Priority Executive Chauffeur`;
      defaultCost = isGoa ? 1450 : 1250;
    } else if (type === "HOTEL") {
      defaultTitle = isGoa
        ? "Taj Exotica Resort & Spa, Goa"
        : `${cleanDst} 5-Star Luxury Executive Stay`;
      defaultCost = isGoa ? 14500 : 9500;
    } else if (type === "EVENT") {
      defaultTitle = isGoa
        ? "Goa Coastal Leadership Offsite & Business Conclave"
        : `${cleanDst} Business Event`;
      defaultCost = 0;
    } else if (type === "ACTIVITY") {
      defaultTitle = isGoa
        ? "IntrCity SmartBus Multi-Axle Volvo AC Sleeper"
        : `${cleanSrc} to ${cleanDst} Luxury Volvo AC Sleeper`;
      defaultCost = 1250;
    }

    const defaultItem: Partial<ItineraryItem> = {
      id: newId,
      type,
      title: defaultTitle,
      provider: "Verified Provider",
      referenceNumber: `IND-${Math.floor(1000 + Math.random() * 9000)}`,
      startTime: "14:00",
      endTime: "15:00",
      departureLocation: source || "Departure City",
      arrivalLocation: destination || "Arrival City",
      location: destination || "City Hub",
      cost: defaultCost,
      currency: "INR",
      priority: type === "EVENT" ? "CRITICAL" : "MEDIUM",
      bufferMinutes: 45,
      metadata: { hasLuggage: type === "FLIGHT" },
    };
    setItems((prev) => [...prev, defaultItem]);
  };

  const isOptionInSequence = (opt: CatalogOption) => {
    return items.some(
      (item) =>
        (Boolean(item.referenceNumber) && item.referenceNumber === opt.referenceNumber) ||
        (Boolean(item.title) && item.title === opt.title)
    );
  };

  const toggleCatalogOption = (opt: CatalogOption) => {
    const existingIndex = items.findIndex(
      (item) =>
        (Boolean(item.referenceNumber) && item.referenceNumber === opt.referenceNumber) ||
        (Boolean(item.title) && item.title === opt.title)
    );

    if (existingIndex >= 0) {
      setItems((prev) => prev.filter((_, idx) => idx !== existingIndex));
      setAddedNotification(`Removed "${opt.title}" from sequence.`);
      setTimeout(() => setAddedNotification(null), 3000);
      return;
    }

    const newLeg: Partial<ItineraryItem> = {
      id: `leg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: opt.type,
      title: opt.title,
      provider: opt.provider,
      referenceNumber: opt.referenceNumber,
      startTime: opt.startTime,
      endTime: opt.endTime,
      departureLocation: opt.departureLocation || source,
      arrivalLocation: opt.arrivalLocation || destination,
      location: opt.location || destination,
      cost: opt.cost,
      currency: "INR",
      priority: opt.priority,
      bufferMinutes: opt.bufferMinutes,
      notes: opt.notes,
      metadata: opt.metadata || {},
    };
    setItems((prev) => [...prev, newLeg]);
    setAddedNotification(`Added "${opt.title}" to your itinerary sequence!`);
    setTimeout(() => setAddedNotification(null), 3500);
  };

  const loadRecommendedRouteTemplate = () => {
    const template = getRouteRecommendedTemplate(source, destination, title);
    setItems(template);
    setAddedNotification(`Loaded recommended ${template.length}-leg template for ${destination}!`);
    setTimeout(() => setAddedNotification(null), 3500);
  };

  const removeItem = (id?: string) => {
    if (!id) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          if (field.startsWith("metadata.")) {
            const metaKey = field.split(".")[1];
            return {
              ...item,
              metadata: {
                ...(item.metadata || {}),
                [metaKey]: value,
              },
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Keyboard Enter navigation between steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Don't trigger if user is in a textarea or explicitly submitting
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      e.preventDefault();
      if (currentStep === 1) {
        goToStep2();
      } else if (currentStep === 2) {
        handleSubmit();
      }
    }
  };

  const goToStep2 = () => {
    if (!title.trim() || !destination.trim() || !source.trim()) {
      alert("Please specify the trip name, source, and destination.");
      return;
    }
    if (!travelerName.trim()) {
      alert("Please provide the traveler full name.");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) {
      alert("Please configure at least one itinerary leg before creating the trip.");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedTripId = `trip-${Date.now()}`;
      const payload = {
        id: generatedTripId,
        title,
        source,
        destination,
        startDate,
        endDate,
        userEmail: user?.email || getStoredUser()?.email,
        userPhone: travelerPhone,
        phone: travelerPhone,
        traveler: {
          name: travelerName,
          phone: travelerPhone,
          email: user?.email || getStoredUser()?.email,
          priorityPreference,
        },
        items: items.map((item, index) => ({
          ...item,
          tripId: generatedTripId,
          status: "NORMAL",
          isFlexible: item.priority !== "CRITICAL",
          dependencies: index > 0 && items[index - 1].id ? [items[index - 1].id!] : [],
          cancellationPolicy: [
            { thresholdHours: 24, refundPercent: 100 },
            { thresholdHours: 2, refundPercent: 50 },
          ],
        })),
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create trip");
      }

      const createdTrip = await res.json();

      try {
        localStorage.setItem("remode_active_trip_id", generatedTripId);
        if (createdTrip) {
          localStorage.setItem(`remode_cached_trip_${generatedTripId}`, JSON.stringify(createdTrip));
        }
      } catch (e) {
        console.error(e);
      }
      router.push(`/dashboard?tripId=${generatedTripId}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to create trip. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen text-[#0F1B2B] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#4FA8F8] selection:text-white"
      onKeyDown={handleKeyDown}
    >
      <AnimatedCloudPlanesBackground />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-14 flex-1 w-full space-y-5 sm:space-y-6 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 shadow-xs mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                Travel Intake
              </span>
            </div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-[32px] text-white tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(6,38,74,0.45)]">
              Enter Journey Details
            </h1>
            <p className="text-xs sm:text-[13.5px] text-white mt-1.5 font-medium leading-relaxed max-w-2xl drop-shadow-[0_1.5px_4px_rgba(6,38,74,0.7)]">
              Provide your upcoming travel schedule and bookings so ReMode can actively monitor each leg and protect your journey against disruptions.
            </p>
          </div>
        </div>

        {/* STEP PROGRESS INDICATOR (Step 1 -> Step 2) */}
        <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-2 sm:p-2.5 shadow-[0_8px_32px_rgba(10,61,115,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 text-left cursor-pointer ${
                currentStep === 1
                  ? "bg-white text-[#1C6FD9] border-white shadow-[0_4px_18px_rgba(10,61,115,0.18)] scale-[1.005]"
                  : "bg-white/15 text-white/95 border-white/25 hover:bg-white/25"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${
                  currentStep === 1
                    ? "bg-[#1C6FD9] text-white"
                    : "bg-white/30 text-white"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    currentStep === 1 ? "text-[#1C6FD9]" : "text-white/80"
                  }`}
                >
                  Step 1 of 2
                </div>
                <div className="font-sans font-bold text-xs sm:text-sm truncate">
                  Journey & Traveler Info
                </div>
              </div>
            </button>

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => goToStep2()}
              className={`p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 text-left cursor-pointer ${
                currentStep === 2
                  ? "bg-white text-[#1C6FD9] border-white shadow-[0_4px_18px_rgba(10,61,115,0.18)] scale-[1.005]"
                  : "bg-white/15 text-white/95 border-white/25 hover:bg-white/25"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs ${
                  currentStep === 2
                    ? "bg-[#1C6FD9] text-white"
                    : "bg-white/30 text-white"
                }`}
              >
                2
              </div>
              <div className="min-w-0">
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    currentStep === 2 ? "text-[#1C6FD9]" : "text-white/80"
                  }`}
                >
                  Step 2 of 2
                </div>
                <div className="font-sans font-bold text-xs sm:text-sm truncate">
                  Journey Bookings & Legs
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: JOURNEY DETAILS & SCHEDULE                             */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToStep2();
            }}
            className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-7 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-[#0F1B2B] tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#1C6FD9]" />
                  <span>Journey Information & Schedule</span>
                </h2>
                <p className="text-xs text-[#4A5B70] mt-1 font-medium">
                  Enter your trip purpose, departure origin, destination, and travel dates to register your itinerary.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1C6FD9] bg-[#EAF5FF] px-3 py-1 rounded-full border border-[#74BCFB]/40 self-start sm:self-auto">
                Step 1 of 2
              </span>
            </div>

            {/* Quick-Fill Sample Corridors or Self Input Option */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F1B2B] flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#1C6FD9]" />
                    <span>Quick-Fill Sample Corridors or Enter Custom Info</span>
                  </label>
                  <p className="text-[11px] text-[#4A5B70] mt-0.5">
                    Select a sample route to auto-populate, or choose Self Input to write your own journey from scratch.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSelfInput}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer ${
                    selectedPresetId === "custom" || (!title && !source && !destination)
                      ? "bg-[#1C6FD9] text-white border-[#1C6FD9] shadow-[0_2px_8px_rgba(28,111,217,0.25)] ring-2 ring-[#1C6FD9]/20"
                      : "bg-white hover:bg-[#F2F8FF] text-[#1C6FD9] border-[#74BCFB]/40"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>✏️ Self Input (Write your own info)</span>
                  {(selectedPresetId === "custom" || (!title && !source && !destination)) && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-bold">Active</span>
                  )}
                </button>
              </div>

              {/* 6 Minimal, Compact Corridor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {INDIAN_ROUTE_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id || (source === p.source && destination === p.destination && title === p.title);
                  const IconComp = p.icon;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-b from-[#F2F8FF] to-white border-[#1C6FD9] ring-2 ring-[#1C6FD9]/20 shadow-[0_4px_14px_rgba(28,111,217,0.12)]"
                          : "bg-white/80 hover:bg-white border-[#74BCFB]/30 hover:border-[#1C6FD9]/50 shadow-[0_2px_6px_rgba(10,61,115,0.03)] hover:shadow-[0_4px_12px_rgba(28,111,217,0.08)]"
                      }`}
                    >
                      {/* Top Row: Cities & Badge */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1 font-bold text-xs text-[#0F1B2B] truncate group-hover:text-[#1C6FD9] transition-colors">
                          <IconComp className="w-3 h-3 text-[#1C6FD9] shrink-0" />
                          <span className="truncate">{p.fromCity}</span>
                          <span className="text-gray-400 font-normal">→</span>
                          <span className="truncate">{p.toCity}</span>
                        </div>
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${p.badgeColor}`}
                        >
                          {p.badge}
                        </span>
                      </div>

                      {/* Middle: Short Title */}
                      <div className="text-[11px] font-medium text-[#4A5B70] truncate mb-2">
                        {p.title}
                      </div>

                      {/* Bottom: Mode & Duration + Indicator */}
                      <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px]">
                        <span className="text-[#5C5470] font-mono truncate max-w-[70%]">
                          {p.duration} • {p.primaryMode}
                        </span>
                        <span
                          className={`font-bold transition-colors ${
                            isSelected ? "text-[#1C6FD9]" : "text-gray-400 group-hover:text-[#1C6FD9]"
                          }`}
                        >
                          {isSelected ? "Active ✓" : "Load →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form Sections */}
            <div className="space-y-5 pt-2">
              {/* Section 1: Trip Identity & Traveler */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FBFF]/80 border border-[#74BCFB]/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#74BCFB]/20">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#1C6FD9]" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0F1B2B]">
                      Trip Purpose & Traveler
                    </h3>
                  </div>
                  {selectedPresetId === "custom" && (
                    <span className="text-[10px] font-bold text-[#1C6FD9] bg-[#EAF5FF] px-2 py-0.5 rounded-full border border-[#74BCFB]/30">
                      Self Input Mode
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Trip Purpose / Name</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-[#718298] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all placeholder:text-[#8A9BA8]"
                        placeholder="e.g. Client Onsite Meeting, Tech Summit, or Personal Journey"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Traveler Full Name</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#718298] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={travelerName}
                        onChange={(e) => {
                          setTravelerName(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all placeholder:text-[#8A9BA8]"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Phone No. (Alerts)</span>
                        <span className="text-[#FF5A5A]">*</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                        WhatsApp & SMS
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#718298] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={travelerPhone}
                        onChange={(e) => {
                          setTravelerPhone(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all placeholder:text-[#8A9BA8]"
                        placeholder="+91 98200 12345"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Route Endpoints & Schedule */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FBFF]/80 border border-[#74BCFB]/30 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#74BCFB]/20">
                  <Navigation className="w-4 h-4 text-[#1C6FD9]" />
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0F1B2B]">
                    Travel Endpoints & Dates
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Departure Origin (City or Airport)</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <Navigation className="w-4 h-4 text-[#1C6FD9] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={source}
                        onChange={(e) => {
                          setSource(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all placeholder:text-[#8A9BA8]"
                        placeholder="e.g. Mumbai (BOM T2) or Delhi (DEL T3)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Arrival Destination (City or Region)</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#2CD9B8] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all placeholder:text-[#8A9BA8]"
                        placeholder="e.g. Bengaluru, Karnataka or Goa (GOI)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Departure Date</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#718298] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0F1B2B] mb-1.5 flex items-center gap-1.5">
                      <span>Return / Conclusion Date</span>
                      <span className="text-[#FF5A5A]">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#718298] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setSelectedPresetId("custom");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#74BCFB]/40 text-sm font-semibold text-[#0F1B2B] bg-white focus:bg-white focus:outline-none focus:border-[#1C6FD9] focus:ring-3 focus:ring-[#1C6FD9]/15 shadow-xs transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-[#5C5470] font-medium flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-gray-100 border text-[11px] font-mono font-bold">
                  ↵ Enter
                </span>
                <span>Press Enter to save details & add journey legs</span>
              </span>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#1C6FD9] to-[#2F8BF5] hover:from-[#155EC0] hover:to-[#1C6FD9] text-white font-bold text-sm tracking-wide shadow-[0_4px_16px_rgba(28,111,217,0.32)] hover:shadow-[0_6px_22px_rgba(28,111,217,0.42)] transition-all flex items-center justify-center gap-2 self-end sm:self-auto hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Next: Enter Journey Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: CONFIGURE ITINERARY LEGS (MANUAL TRANSPORT PICK)       */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
            {/* Added Notification Toast */}
            {addedNotification && (
              <div className="bg-gradient-to-r from-[#2CD9B8]/20 to-[#4FA8F8]/20 border border-[#2CD9B8]/60 text-[#0A3D73] px-4 py-3 rounded-2xl flex items-center justify-between shadow-[0_4px_16px_rgba(44,217,184,0.2)] animate-bounce">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#0A3D73]" />
                  <span>{addedNotification}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-[#2CD9B8] text-[#0A3D73] px-2.5 py-0.5 rounded-full shadow-sm">
                  Added to Sequence ↓
                </span>
              </div>
            )}

            <div className="bg-white/95 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(10,61,115,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-7 animate-fadeIn">
              {/* Header matching Step 1 layout and typography */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl text-[#0F1B2B] tracking-tight flex items-center gap-2">
                    <Train className="w-5 h-5 text-[#1C6FD9]" />
                    <span>Journey Bookings & Legs</span>
                  </h2>
                  <p className="text-xs text-[#4A5B70] mt-1 font-medium">
                    Select your transport modes below to log your booked trains, flights, cabs, stays, or events for active disruption monitoring.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-nowrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1C6FD9] bg-[#EAF5FF] px-2.5 py-0.5 rounded-full border border-[#74BCFB]/40 whitespace-nowrap shrink-0">
                    Step 2 of 2
                  </span>
                  <button
                    type="button"
                    onClick={loadRecommendedRouteTemplate}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white border border-slate-200 hover:border-[#1C6FD9]/40 text-[11px] font-semibold text-[#4A5B70] hover:text-[#1C6FD9] transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                    title={`Auto-fills suggested ${cleanDestName} template`}
                  >
                    Load {cleanDestName} Template
                  </button>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SECTION A: TRANSPORT WAYS PICKER (MANUAL SELECTION)       */}
              {/* -------------------------------------------------------- */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-sans font-extrabold text-base sm:text-lg text-[#0F1B2B] tracking-tight flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#1C6FD9]" />
                      <span>1. Manually Select Transport Way:</span>
                    </h3>
                    <p className="text-xs text-[#4A5B70] mt-0.5 font-medium">
                      Select a transport mode below to load available choices for your route.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {TRANSPORT_MODES.map((mode) => {
                    const isSelected = selectedTransportWay === mode.type;
                    const ModeIcon = mode.icon;

                    return (
                      <button
                        key={mode.type}
                        type="button"
                        onClick={() => setSelectedTransportWay(mode.type)}
                        className={`p-3 rounded-xl border transition-all duration-150 flex flex-col items-center justify-between text-center relative group cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-b from-[#F2F8FF] to-white border-[#1C6FD9] ring-2 ring-[#1C6FD9]/20 shadow-[0_4px_14px_rgba(28,111,217,0.14)]"
                            : "bg-white/80 hover:bg-white text-[#0F1B2B] border-[#74BCFB]/30 hover:border-[#1C6FD9]/50 shadow-[0_2px_6px_rgba(10,61,115,0.03)] hover:shadow-[0_4px_12px_rgba(28,111,217,0.08)]"
                        }`}
                      >
                        {/* Modern Lucide Vector Icon Capsule */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 mb-2 ${
                            isSelected
                              ? "bg-[#1C6FD9] text-white shadow-[0_3px_10px_rgba(28,111,217,0.35)] scale-105"
                              : "bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/30 group-hover:bg-[#DDF0FF] group-hover:scale-105"
                          }`}
                        >
                          <ModeIcon className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        <div className="font-sans font-bold text-xs leading-tight mb-1 text-[#0F1B2B] group-hover:text-[#1C6FD9] transition-colors">
                          {mode.label}
                        </div>

                        <div
                          className={`text-[9.5px] font-sans font-semibold px-2 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-[#1C6FD9] text-white"
                              : "bg-[#F2F8FF] border border-[#74BCFB]/30 text-[#0A3D73]"
                          }`}
                        >
                          {mode.type === "TRAIN" && liveTrains
                            ? `${liveTrains.length} Real Trains`
                            : mode.type === "FLIGHT" && liveFlights
                            ? `${liveFlights.length} Real Flights`
                            : mode.countBadge}
                        </div>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1C6FD9] text-white flex items-center justify-center shadow-xs">
                            <span className="text-[9px] font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* SECTION B: AVAILABLE CHOICES CARDS FOR SELECTED WAY      */}
              {/* -------------------------------------------------------- */}
              <div className="bg-white/80 backdrop-blur-md border border-[#74BCFB]/30 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(10,61,115,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EAF5FF] border border-[#74BCFB]/40 flex items-center justify-center text-[#1C6FD9] shrink-0">
                      {React.createElement(
                        TRANSPORT_MODES.find((m) => m.type === selectedTransportWay)?.icon || Train,
                        { className: "w-4 h-4 text-[#1C6FD9]" }
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans font-bold text-sm sm:text-base text-[#0F1B2B]">
                          Available {TRANSPORT_MODES.find((m) => m.type === selectedTransportWay)?.label} Options for {cleanDestName}
                        </h3>
                        {selectedTransportWay === "TRAIN" && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6FBF7] text-[#059669] border border-[#10B981]/40 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                            <span>{liveTrainMeta?.isLiveApi ? "Live IRCTC API" : "📡 Real-Time Timetable Sync"}</span>
                            {liveTrainMeta?.fromCode && liveTrainMeta?.toCode && (
                              <span className="font-mono text-[#047857]">({liveTrainMeta.fromCode} ➔ {liveTrainMeta.toCode})</span>
                            )}
                          </span>
                        )}
                        {selectedTransportWay === "FLIGHT" && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF5FF] text-[#1C6FD9] border border-[#1C6FD9]/40 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#1C6FD9] animate-ping" />
                            <span>{liveFlightMeta?.isLiveApi ? "Live AeroDataBox API" : "✈️ Real Aviation Radar"}</span>
                            {liveFlightMeta?.fromAirport && liveFlightMeta?.toAirport && (
                              <span className="font-mono text-[#0A3D73]">({liveFlightMeta.fromAirport} ➔ {liveFlightMeta.toAirport})</span>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4A5B70] mt-0.5">
                        {selectedTransportWay === "TRAIN" && (liveTrainMeta?.sourceName || liveTrainMeta?.destName)
                          ? `Displaying verified real-time trains operating directly between ${liveTrainMeta.sourceName || source} and ${liveTrainMeta.destName || destination}.`
                          : selectedTransportWay === "FLIGHT" && (liveFlightMeta?.sourceName || liveFlightMeta?.destName)
                          ? `Displaying verified real-time flight departures operating directly between ${liveFlightMeta.sourceName || source} and ${liveFlightMeta.destName || destination}.`
                          : "Click any card to add it directly to your itinerary sequence below."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option Cards Grid */}
                {(isLoadingLiveTrains && selectedTransportWay === "TRAIN") || (isLoadingLiveFlights && selectedTransportWay === "FLIGHT") ? (
                  <div className="p-8 text-center bg-white/80 rounded-2xl border border-dashed border-[#74BCFB]/50">
                    <div className="w-8 h-8 border-3 border-[#1C6FD9] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#0F1B2B]">
                      {selectedTransportWay === "TRAIN"
                        ? `Connecting to Live IRCTC API & verified timetable for ${source} ➔ ${destination}...`
                        : `Connecting to Live AeroDataBox Aviation API for ${source} ➔ ${destination}...`}
                    </p>
                    <p className="text-[10px] text-[#5C5470] mt-0.5">
                      {selectedTransportWay === "TRAIN"
                        ? "Fetching running trains, station codes, and seat class availability"
                        : "Fetching live departures, airline flight numbers, and terminal gates"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {((selectedTransportWay === "TRAIN" && liveTrains && liveTrains.length > 0
                      ? liveTrains
                      : selectedTransportWay === "FLIGHT" && liveFlights && liveFlights.length > 0
                      ? liveFlights
                      : activeCatalog[selectedTransportWay] || [])).map((option) => {
                      const isAdded = isOptionInSequence(option);

                      return (
                      <div
                        key={option.id}
                        className={`bg-white/95 border rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between gap-3 group ${
                          isAdded
                            ? "border-[#10B981]/50 shadow-[0_4px_16px_rgba(16,185,129,0.12)] ring-1 ring-[#10B981]/30"
                            : "border-[#74BCFB]/35 hover:border-[#1C6FD9]/60 shadow-sm hover:shadow-[0_8px_24px_rgba(28,111,217,0.12)]"
                        }`}
                      >
                        {/* Top Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#74BCFB]/35 bg-[#EAF5FF] text-[#0A3D73]">
                              {option.classBadge}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#0F1B2B] bg-[#FFF9E6] border border-[#FFC94D]/50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#1C6FD9]" />
                              <span>{option.startTime} – {option.endTime}</span>
                            </span>
                          </div>

                          {/* Title & Provider */}
                          <h4 className="font-sans font-bold text-sm sm:text-base text-[#0F1B2B] group-hover:text-[#1C6FD9] transition-colors leading-snug">
                            {option.title}
                          </h4>
                          <div className="text-[11px] font-medium text-[#5C5470] mt-0.5 flex items-center gap-1.5">
                            <span>{option.provider}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{option.referenceNumber}</span>
                          </div>

                          {/* Route Endpoints */}
                          <div className="my-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#74BCFB]/25 text-xs font-semibold flex items-center justify-between text-[#0F1B2B]">
                            <div className="flex items-center gap-1 truncate max-w-[45%]">
                              <MapPin className="w-3 h-3 text-[#1C6FD9] shrink-0" />
                              <span className="truncate">{option.departureLocation}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <div className="flex items-center gap-1 truncate max-w-[45%] text-right justify-end">
                              <span className="truncate">{option.arrivalLocation}</span>
                              <MapPin className="w-3 h-3 text-[#2CD9B8] shrink-0" />
                            </div>
                          </div>

                          {/* Tagline */}
                          <p className="text-[11px] text-[#4A5B70] leading-relaxed italic mb-2">
                            &ldquo;{option.tagline}&rdquo;
                          </p>

                          {/* Feature bullets */}
                          <div className="space-y-1 mb-2">
                            {option.features.map((feat, fIdx) => (
                              <div key={fIdx} className="text-[10.5px] font-medium text-[#0F1B2B] flex items-center gap-1.5">
                                <span className="text-[#10B981] font-bold">✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-[#0F1B2B]">
                              {option.cost === 0 ? "Included / ₹0" : `₹${option.cost.toLocaleString("en-IN")}`}
                            </div>
                            <div className="text-[10px] font-medium text-[#5C5470] flex items-center gap-1">
                              <span>⏱️ {option.bufferMinutes}m buffer</span>
                              {option.priority === "CRITICAL" && (
                                <span className="text-[#C13A1F] font-bold whitespace-nowrap">CRITICAL</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={() => {
                              if (!isAdded) {
                                toggleCatalogOption(option);
                              }
                            }}
                            className={`py-2 px-3.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                              isAdded
                                ? "bg-[#E6FBF7] text-[#059669] border border-[#10B981]/40 shadow-xs cursor-default"
                                : "bg-gradient-to-r from-[#1C6FD9] to-[#2F8BF5] hover:from-[#155EC0] hover:to-[#1C6FD9] text-white shadow-[0_4px_12px_rgba(28,111,217,0.25)] active:scale-95 cursor-pointer"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Select Sequence</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
              )}
            </div>

              {/* -------------------------------------------------------- */}
              {/* SECTION C: CONFIGURED ITINERARY SEQUENCE (YOUR NODES)    */}
              {/* -------------------------------------------------------- */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-sans font-extrabold text-base sm:text-lg text-[#0F1B2B] tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1C6FD9]" />
                      <span>2. Your Configured Itinerary Sequence</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5FF] text-[#1C6FD9] border border-[#74BCFB]/40 text-xs font-mono font-bold">
                        {items.length} {items.length === 1 ? "Leg" : "Legs"}
                      </span>
                    </h3>
                    <p className="text-xs text-[#4A5B70] mt-0.5 font-medium">
                      Review, reorder, or edit details for each node before submitting to the Recovery Engine.
                    </p>
                  </div>

                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setItems([])}
                      className="text-xs font-bold text-[#C13A1F] hover:underline self-start sm:self-auto"
                    >
                      Clear All Legs
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-[#74BCFB]/40 bg-[#F4FAFF] space-y-3 max-w-xl mx-auto">
                    <div className="text-3xl">🧭</div>
                    <div className="font-bold text-sm text-[#0F1B2B]">
                      No itinerary nodes added yet.
                    </div>
                    <p className="text-xs text-[#5C5470] max-w-md mx-auto">
                      Select a transport way above to add verified options for your trip from{" "}
                      <strong className="text-[#0F1B2B]">{source}</strong> to{" "}
                      <strong className="text-[#0F1B2B]">{destination}</strong>, or click below to load our recommended itinerary.
                    </p>
                    <button
                      type="button"
                      onClick={loadRecommendedRouteTemplate}
                      className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F2F8FF] border border-[#74BCFB]/40 text-xs font-semibold text-[#1C6FD9] shadow-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#1C6FD9]" />
                      <span>Load Suggested {cleanDestName} Template</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border transition-all relative flex flex-col gap-4 ${
                          item.priority === "CRITICAL"
                            ? "bg-gradient-to-r from-[#FFFBF2] to-white border-[#FFC94D] shadow-[0_4px_16px_rgba(255,201,77,0.25)]"
                            : "bg-white/95 border-[#74BCFB]/35 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1C6FD9] to-[#2F8BF5] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                              {index + 1}
                            </span>

                            {/* Mode Badge (Static, no dropdown menu) */}
                            {(() => {
                              const itemMode = TRANSPORT_MODES.find((m) => m.type === item.type) || TRANSPORT_MODES[0];
                              const ItemModeIcon = itemMode.icon;
                              return (
                                <div className="px-2.5 py-1.5 rounded-xl border border-[#74BCFB]/35 bg-[#F0F7FF] text-[#0F1B2B] flex items-center gap-2 text-xs font-bold shrink-0">
                                  <div className="w-5 h-5 rounded-lg bg-white text-[#1C6FD9] border border-[#74BCFB]/30 flex items-center justify-center shrink-0 shadow-xs">
                                    <ItemModeIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                                  </div>
                                  <span className="font-sans font-bold tracking-tight">{itemMode.label}</span>
                                </div>
                              );
                            })()}

                            {/* Critical Toggle */}
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-1 rounded-full border border-[#FFC94D]/60 bg-[#FFF9E6] whitespace-nowrap shrink-0 select-none">
                              <input
                                type="checkbox"
                                checked={item.priority === "CRITICAL"}
                                onChange={(e) =>
                                  updateItem(item.id!, "priority", e.target.checked ? "CRITICAL" : "MEDIUM")
                                }
                                className="w-3.5 h-3.5 rounded border-[#FFC94D] text-[#1C6FD9] focus:ring-0 cursor-pointer"
                              />
                              <span className={`whitespace-nowrap ${item.priority === "CRITICAL" ? "text-[#C13A1F]" : "text-[#0F1B2B]"}`}>
                                CRITICAL (Cannot Miss)
                              </span>
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-[#C13A1F] transition-all self-end sm:self-auto p-1 cursor-pointer shrink-0"
                            title="Remove this leg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div className="lg:col-span-2">
                            <label className="block font-semibold text-gray-600 mb-1">
                              Leg Title / Transport Provider
                            </label>
                            <input
                              type="text"
                              value={item.title || ""}
                              onChange={(e) => updateItem(item.id!, "title", e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#74BCFB]/40 font-semibold bg-[#F4FAFF] text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">
                              Timing (Departure - Arrival)
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={item.startTime || ""}
                                onChange={(e) => updateItem(item.id!, "startTime", e.target.value)}
                                placeholder="08:00"
                                className="w-full px-2 py-2 rounded-xl border border-[#74BCFB]/40 font-mono text-center font-bold text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                              />
                              <span>–</span>
                              <input
                                type="text"
                                value={item.endTime || ""}
                                onChange={(e) => updateItem(item.id!, "endTime", e.target.value)}
                                placeholder="09:40"
                                className="w-full px-2 py-2 rounded-xl border border-[#74BCFB]/40 font-mono text-center font-bold text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-600 mb-1">
                              Cost (₹ INR)
                            </label>
                            <input
                              type="number"
                              value={item.cost || 0}
                              onChange={(e) => updateItem(item.id!, "cost", Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-[#74BCFB]/40 font-bold text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Secondary Row: Route endpoints and buffer */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-gray-100">
                          <div>
                            <label className="block font-semibold text-gray-500 mb-0.5">
                              Departure Location / Terminal
                            </label>
                            <input
                              type="text"
                              value={item.departureLocation || ""}
                              onChange={(e) => updateItem(item.id!, "departureLocation", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-[#74BCFB]/30 font-medium text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-500 mb-0.5">
                              Arrival Location / Venue
                            </label>
                            <input
                              type="text"
                              value={item.arrivalLocation || ""}
                              onChange={(e) => updateItem(item.id!, "arrivalLocation", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-[#74BCFB]/30 font-medium text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-gray-500 mb-0.5">
                              Buffer Minutes Before Next Leg
                            </label>
                            <input
                              type="number"
                              value={item.bufferMinutes || 45}
                              onChange={(e) => updateItem(item.id!, "bufferMinutes", Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-[#74BCFB]/30 font-bold text-[#0F1B2B] focus:border-[#1C6FD9] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Navigation Buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-5 text-xs font-bold rounded-xl bg-white hover:bg-[#F2F8FF] border border-[#74BCFB]/40 text-[#0A3D73] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Journey & Traveler Details</span>
                </button>

                <div className="flex items-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3.5 px-7 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#1C6FD9] via-[#2F8BF5] to-[#4FA8F8] hover:from-[#155EC0] hover:to-[#2F8BF5] text-white shadow-[0_6px_20px_rgba(28,111,217,0.35)] transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                  >
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">↵ Enter</span>
                    {isSubmitting ? (
                      <span>Starting Monitoring...</span>
                    ) : (
                      <span>Monitor Journey</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
