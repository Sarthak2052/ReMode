import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const incomingSecret = req.headers.get("x-internal-secret");

    if (internalSecret && incomingSecret !== internalSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-internal-secret" },
        { status: 401 }
      );
    }

    // Fetch active flight itinerary items across active trips
    const activeFlights = await prisma.itineraryItem.findMany({
      where: {
        type: "FLIGHT",
        trip: {
          status: "ACTIVE",
        },
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { departureTime: "asc" },
    });

    const bookings = activeFlights.map((flight) => {
      // Clean flight number from referenceNumber (e.g. "6E-2415" -> "6E2415")
      const rawFlight = flight.referenceNumber || "AI-804";
      const depDate = flight.departureTime
        ? flight.departureTime.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      return {
        id: flight.id,
        tripId: flight.tripId,
        flightNumber: rawFlight,
        date: depDate,
        source: flight.source,
        destination: flight.destination,
        status: flight.status,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        tripTitle: flight.trip.title,
      };
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching active flight bookings:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
