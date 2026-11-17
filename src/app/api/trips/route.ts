import { NextRequest, NextResponse } from "next/server";
import { getAllTrips, createTrip } from "@/lib/tripService";

export async function GET() {
  try {
    const trips = await getAllTrips();
    return NextResponse.json(trips);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.destination) {
      return NextResponse.json(
        { error: "Trip title and destination are required" },
        { status: 400 }
      );
    }

    const newTrip = await createTrip(body);
    return NextResponse.json(newTrip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create trip" },
      { status: 400 }
    );
  }
}
