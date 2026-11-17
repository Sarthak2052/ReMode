import { NextRequest, NextResponse } from "next/server";
import { injectDisruption, injectCustomDisruption, resetTrip } from "@/lib/tripService";
import { antiSpam } from "@/lib/antiSpam";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const scenarioId = Number(body.scenarioId || 1);
    const userPhone = body.phoneNumber || body.phone;
    const userId = body.userId || userPhone || req.headers.get("x-user-id") || params.id;
    const reportText = body.message || body.description || `Disruption Scenario ${scenarioId}`;

    // Only apply rate limiting to user-entered crowdsourced reports.
    // Benchmark simulations from the dashboard must never be blocked by anti-spam.
    const isBenchmarkSimulation = body.scenarioId !== undefined;
    if (!isBenchmarkSimulation && (body.message || body.description)) {
      const spamCheck = antiSpam.validateAndRecord(userId, reportText);
      if (!spamCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: spamCheck.error,
            reason: spamCheck.reason,
            similarity: spamCheck.similarity,
          },
          { status: 429 }
        );
      }
    }

    // If caller provided bookingId or explicit disruption type (e.g. from AeroDataBox worker)
    if (body.bookingId || body.type) {
      const result = await injectCustomDisruption(params.id, {
        bookingId: body.bookingId,
        type: body.type || "DELAY",
        source: body.source || "CARRIER_ALERT",
        delayMinutes: body.delayMinutes !== undefined ? Number(body.delayMinutes) : undefined,
        description: body.description,
      }, userPhone);
      return NextResponse.json(result);
    }

    const result = await injectDisruption(params.id, scenarioId, userPhone);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to inject disruption" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fresh = await resetTrip(params.id);
    return NextResponse.json({ success: true, trip: fresh });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to clear disruption" },
      { status: 500 }
    );
  }
}
