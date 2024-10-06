import { Airport, Connection, Flight } from "@/lib/types";

export const findConnections = (
  flights: Flight[],
  from: string,
  to: string,
  date: string,
  maxStops = 3,
): Connection[] => {
  const connections: Connection[] = [];

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
};

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
