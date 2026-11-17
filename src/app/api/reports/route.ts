import { NextRequest, NextResponse } from "next/server";
import { antiSpam } from "@/lib/antiSpam";
import { prisma } from "@/lib/prisma";
import { isPrismaAvailable } from "@/lib/tripService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      tripId,
      message,
      text,
      report,
      userId = body.phoneNumber || body.email || req.headers.get("x-user-id") || "default-user",
    } = body;

    const reportText = (message || text || report || "").trim();

    if (!reportText) {
      return NextResponse.json(
        { error: "Report message text cannot be empty." },
        { status: 400 }
      );
    }

    // Backend Anti-Spam Check: Duplicate detection & Rate limiting
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

    // If tripId is provided and Prisma is available, store in trip history
    let savedRecord = null;
    if (tripId && (await isPrismaAvailable())) {
      try {
        savedRecord = await prisma.tripHistory.create({
          data: {
            tripId,
            action: "USER_DISRUPTION_REPORT",
            details: `User report: ${reportText}`,
            items: [],
          },
        });
      } catch (dbErr) {
        console.warn("[api/reports] Prisma tripHistory save skipped:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully.",
      report: {
        id: savedRecord?.id || `rep-${Date.now()}`,
        userId,
        tripId: tripId || null,
        text: reportText,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[api/reports] Error submitting report:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") || "default-user";
  const reports = antiSpam.getUserReports(userId);
  return NextResponse.json({
    userId,
    count: reports.length,
    reports,
  });
}
