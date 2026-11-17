import { NextRequest, NextResponse } from "next/server";
import { getGroundTransportProvider } from "@/core/providers/getGroundTransportProvider.ts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const mode = (searchParams.get("mode") || "driving") as "driving" | "two_wheeler";

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination query parameters are required" },
        { status: 400 }
      );
    }

    const provider = getGroundTransportProvider();
    const route = await provider.calculateRoadRoute(origin, destination, { mode });

    return NextResponse.json({
      success: true,
      provider: provider.name,
      route,
    });
  } catch (error: any) {
    console.error("API /api/geo/directions error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error calculating route" },
      { status: 500 }
    );
  }
}
