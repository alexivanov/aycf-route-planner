import { NextResponse } from "next/server";
import { getLatestFlightDataUpdateTime } from "@/lib/database-queries";

export async function GET() {
  const latestUpdateTime = await getLatestFlightDataUpdateTime();

  return NextResponse.json(latestUpdateTime?.getTime());
}
