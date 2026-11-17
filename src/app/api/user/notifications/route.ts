import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications } from "@/lib/tripService";

export async function GET(req: NextRequest) {
  try {
    const notifications = await getUserNotifications();
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
