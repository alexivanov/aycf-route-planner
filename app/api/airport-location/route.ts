import { NextResponse } from "next/server";
import { getAirportLocation } from "@/lib/get-airport-location";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iataCode = searchParams.get("iataCode");

  if (!iataCode) {
    return NextResponse.json(
      { error: "iataCode is required" },
      { status: 400 },
    );
  }

  const location = await getAirportLocation(iataCode);

  if (!location) {
    return NextResponse.json({ error: "Airport not found" }, { status: 404 });
  }

  return NextResponse.json(location);
}
