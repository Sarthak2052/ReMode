import { NextRequest, NextResponse } from "next/server";
import { sendTravelAlert } from "@/lib/notificationService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      phoneNumber = "918879808016",
      message = "Trip Confirmed: BOM → DEL, all connections normal",
      channel = "whatsapp",
    } = body;

    const result = await sendTravelAlert({
      phoneNumber,
      message,
      channel,
    });

    return NextResponse.json(
      {
        message: "Whapi WhatsApp notification dispatch attempted",
        recipient: phoneNumber,
        result,
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("[api/notifications/test] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch notification" },
      { status: 500 }
    );
  }
}
