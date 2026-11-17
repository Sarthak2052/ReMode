import { NextRequest, NextResponse } from "next/server";
import { getTripById, resetTrip } from "@/lib/tripService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await getTripById(params.id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fresh = await resetTrip(params.id);
    return NextResponse.json(fresh);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset trip" },
      { status: 500 }
    );
  }
}
