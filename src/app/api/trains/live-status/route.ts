import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTrain = searchParams.get("trainNo") || searchParams.get("trainNumber") || "";
    const trainNo = rawTrain.replace(/[^0-9]/g, "");
    const startDay = searchParams.get("startDay") || "0";

    if (!trainNo) {
      return NextResponse.json(
        { error: "Missing or invalid trainNo query parameter (e.g. ?trainNo=20978)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.IRCTC1_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "IRCTC1_KEY is not configured in server environment" },
        { status: 500 }
      );
    }

    const url = `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?startDay=${startDay}&trainNo=${trainNo}`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "irctc1.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream IRCTC API returned HTTP ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Empty response received from IRCTC API" },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in live train status API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
