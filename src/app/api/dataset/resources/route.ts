import { NextRequest, NextResponse } from "next/server";
import { getDatasetStore } from "@/core/DatasetStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const store = getDatasetStore();
  const resources = store.getResources({
    mode: params.get("mode") ?? undefined,
    sourceCity: params.get("sourceCity") ?? undefined,
    destinationCity: params.get("destinationCity") ?? undefined,
    limit: Number(params.get("limit") ?? 50),
    offset: Number(params.get("offset") ?? 0),
  });

  return NextResponse.json({ resources, count: resources.length });
}
