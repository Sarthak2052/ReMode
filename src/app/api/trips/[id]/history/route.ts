import { NextRequest, NextResponse } from "next/server";
import { getTripHistoryTimeline } from "@/lib/tripService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const history = await getTripHistoryTimeline(params.id);
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch trip history" },
      { status: 500 }
    );
  }
}
