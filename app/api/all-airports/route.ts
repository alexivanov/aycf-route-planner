import { loadFlightData } from "@/lib/load-flight-data";
import { NextResponse } from "next/server";
import { Airport } from "@/lib/types";

export async function GET() {
  const flights = await loadFlightData();

  const allAirports = flights
    .reduce<Airport[]>((acc, flight) => {
      if (!acc.find((airport) => airport.code === flight.from.code)) {
        acc.push(flight.from);
      }
      if (!acc.find((airport) => airport.code === flight.to.code)) {
        acc.push(flight.to);
      }
      return acc;
    }, [])
    .sort((a, b) => a.code.localeCompare(b.code));

  return NextResponse.json(allAirports);
}
