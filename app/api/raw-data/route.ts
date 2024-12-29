import { loadFlightData } from "@/lib/load-flight-data";
import { NextResponse } from "next/server";

export async function GET() {
  const flights = await loadFlightData();

  console.log(`Raw data request`);

  return NextResponse.json(flights);
}
