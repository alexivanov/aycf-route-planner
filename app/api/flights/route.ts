import { loadFlightData } from "@/lib/load-flight-data";
import { Airport, Connection, Flight } from "@/lib/types";
import { NextResponse } from "next/server";

function findConnections(
  flights: Flight[],
  from: string,
  to: string,
  date: string,
): Connection[] {
  const connections: Connection[] = [];
  const maxStops = 3; // Limit to 2 stops (3 flights max)

  const parsedDate = new Date(date);

  function dfs(
    currentCode: string,
    path: Flight[],
    stops: number,
    visited = new Set<string>(),
  ) {
    if (stops > maxStops) return;

    if (currentCode === to) {
      const layovers = calculateLayovers(path);
      const totalDuration =
        calculateTotalDuration(path) +
        layovers.reduce((acc, layover) => acc + layover.duration, 0);
      connections.push({
        flights: [...path],
        totalDuration,
        layovers,
      });
      return;
    }

    for (const flight of flights) {
      if (
        flight.from.code === currentCode &&
        flight.departure >= parsedDate &&
        !visited.has(flight.to.code)
      ) {
        const lastFlight = path[path.length - 1];
        if (
          !lastFlight ||
          lastFlight.arrival.getTime() < flight.departure.getTime()
        ) {
          dfs(
            flight.to.code,
            [...path, flight],
            stops + 1,
            new Set([...visited, flight.to.code]),
          );
        }
      }
    }
  }

  dfs(from, [], 0, new Set([from]));
  return connections;
}

function calculateTotalDuration(flights: Flight[]): number {
  return flights.reduce((acc, flight) => acc + flight.durationMinutes, 0);
}

function calculateLayovers(
  flights: Flight[],
): { airport: Airport; duration: number }[] {
  const layovers = [];
  for (let i = 0; i < flights.length - 1; i++) {
    const currentFlight = flights[i];
    const nextFlight = flights[i + 1];
    const layoverAirport = currentFlight.to;
    const duration =
      (nextFlight.departure.getTime() - currentFlight.arrival.getTime()) /
      (1000 * 60); // Duration in minutes
    layovers.push({ airport: layoverAirport, duration });
  }
  return layovers;
}

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

  const connections = findConnections(flights, from, to, date);

  // Sort connections by arrival time, keeping in mind that some flights may arrive the next day
  connections.sort((a, b) => {
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
