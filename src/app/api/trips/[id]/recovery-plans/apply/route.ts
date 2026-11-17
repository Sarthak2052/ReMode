import { NextRequest, NextResponse } from "next/server";
import { applyRecoveryPlan } from "@/lib/tripService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { planId, plan, confirmed, phoneNumber, phone } = await req.json();

    if (!confirmed) {
      return NextResponse.json(
        {
          error:
            "Confirmation required. Explicit user approval needed before committing itinerary rebooking.",
        },
        { status: 400 }
      );
    }

    const userPhone = phoneNumber || phone;
    const result = await applyRecoveryPlan(params.id, planId, plan, userPhone);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to apply recovery plan" },
      { status: 400 }
    );
  }
}
