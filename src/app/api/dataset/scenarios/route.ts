import { NextResponse } from "next/server";
import { getDatasetStore } from "@/core/DatasetStore";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDatasetStore().getScenarios());
}
