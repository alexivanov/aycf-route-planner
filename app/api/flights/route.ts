import { loadFlightData } from "@/lib/data/load-flight-data";
import { NextResponse } from "next/server";
import { findConnections } from "@/lib/find-connections";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  if (!from || !to || !date) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  const flights = await loadFlightData();

  const connections = await findConnections(flights, from, to, date);

  // Sort connections by arrival time, keeping in mind that some flights may arrive the next day
  connections.sort((a, b) => {
    if (a.flights.length == 1) {
      if (b.flights.length == 1) {
        return (
          a.flights[a.flights.length - 1].arrival.getTime() -
          b.flights[b.flights.length - 1].arrival.getTime()
        );
      }

      return -1;
    }

    if (b.flights.length == 1) {
      return 1;
    }

    return (
      a.flights[a.flights.length - 1].arrival.getTime() -
      b.flights[b.flights.length - 1].arrival.getTime()
    );
  });

  console.log(
    `[route log] Search from ${from} to ${to} on ${date} found ${connections.length} connections`,
  );

  return NextResponse.json(connections);
}
