import { NextRequest, NextResponse } from "next/server";
import { getRecoveryData } from "@/lib/tripService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getRecoveryData(params.id);
    return NextResponse.json(data.impact);
  } catch (error: any) {
    // When no disruption is active on the trip, return null with 200 OK instead of throwing 400
    return NextResponse.json(null, { status: 200 });
  }
}
