import { loadFlightData } from "@/lib/data/load-flight-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const flights = await loadFlightData();

  console.log(`Raw data request`);

  return NextResponse.json(flights);
}
