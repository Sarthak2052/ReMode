import { NextRequest, NextResponse } from "next/server";
import { getProactiveRiskAlerts } from "@/lib/tripService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alerts = await getProactiveRiskAlerts(params.id);
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch risk alerts" },
      { status: 500 }
    );
  }
}
