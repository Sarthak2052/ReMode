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

    // Fetch active train itinerary items across active trips
    const activeTrains = await prisma.itineraryItem.findMany({
      where: {
        type: "TRAIN",
        trip: {
          status: { in: ["ACTIVE", "DISRUPTED"] },
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

    const bookings = activeTrains.map((train) => {
      // Clean train number from referenceNumber (e.g. "12003" or "20978")
      const rawTrain = train.referenceNumber || "12003";
      const depDate = train.departureTime
        ? train.departureTime.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      return {
        id: train.id,
        tripId: train.tripId,
        trainNumber: rawTrain,
        date: depDate,
        source: train.source,
        destination: train.destination,
        status: train.status,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        tripTitle: train.trip.title,
      };
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching active train bookings:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
