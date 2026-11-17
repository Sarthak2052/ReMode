import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/tripService";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || undefined;

    const user = await getUserProfile(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, priorityPreference, phone, homeAirport } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: name || undefined,
          phone: phone || undefined,
          homeAirport: homeAirport || undefined,
        },
        create: {
          email,
          name: name || email.split("@")[0].replace(".", " "),
          phone: phone || "+91 98200 00000",
          homeAirport: homeAirport || "BOM",
          avoidNightTravel: false,
          carrierLoyalty: ["IndiGo", "Taj Hotels"],
          priorityWeights: {
            costWeight: 0.3,
            timeWeight: 0.5,
            convenienceWeight: 0.2,
          },
        },
        include: {
          trips: true,
          notifications: true,
        },
      });

      return NextResponse.json(user, { status: 200 });
    } catch (dbErr) {
      return NextResponse.json({
        id: "usr-guest-local",
        email,
        name: name || email.split("@")[0].replace(".", " "),
        phone: phone || "+91 98200 00000",
        homeAirport: homeAirport || "BOM",
        trips: [],
        notifications: [],
      }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUserProfile(user.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}
