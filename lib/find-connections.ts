import { Connection, Flight, Layover } from "@/lib/types";
import { getNearbyAirports } from "@/lib/get-nearby-airports";
import { getCachedAllAirports } from "@/lib/server-side-cached-props";
import { loadAirportLocationData } from "@/lib/data/load-airport-location-data";

export const findConnections = async (
  flights: Flight[],
  from: string,
  to: string,
  date: string,
  maxStops = 3,
): Promise<Connection[]> => {
  const connections: Connection[] = [];

  const parsedDate = new Date(date);

  const cachedNearbyAirports: Map<string, Set<string>> = new Map();
  const allAirports = await getCachedAllAirports();
  const allAirportLocationData = await loadAirportLocationData();

  const getCachedNearbyAirport = (iataCode: string): Set<string> => {
    if (cachedNearbyAirports.has(iataCode)) {
      return cachedNearbyAirports.get(iataCode) as Set<string>;
    }

    const nearbyAirports = new Set(
      getNearbyAirports(iataCode, allAirports, allAirportLocationData).map(
        (airport) => airport.code,
      ),
    );

    cachedNearbyAirports.set(iataCode, nearbyAirports);

    return nearbyAirports;
  };

  function dfs(
    currentCode: string,
    path: Flight[],
    stops: number,
    visited = new Set<string>(),
  ) {
    if (stops > maxStops) return;

    const nearbyAirports = getCachedNearbyAirport(currentCode);

    if (currentCode === to || nearbyAirports.has(to)) {
      const layovers = calculateLayovers(path);
      const totalDuration =
        calculateTotalDuration(path) +
        layovers.reduce((acc, layover) => acc + layover.duration, 0);
      const hasAirportChangeLayover = layovers.some(
        (layover) => !layover.isSameAirport,
      );

      connections.push({
        flights: [...path],
        totalDuration,
        layovers,
        hasAirportChangeLayover,
      });
      return;
    }

    for (const flight of flights) {
      if (
        (flight.from.code === currentCode ||
          nearbyAirports.has(flight.from.code)) &&
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

  const nearbyFromStart = getCachedNearbyAirport(from);
  dfs(from, [], 0, new Set([from, ...nearbyFromStart]));
  return connections;
};

function calculateTotalDuration(flights: Flight[]): number {
  return flights.reduce((acc, flight) => acc + flight.durationMinutes, 0);
}

function calculateLayovers(flights: Flight[]): Layover[] {
  const layovers: Layover[] = [];
  for (let i = 0; i < flights.length - 1; i++) {
    const currentFlight = flights[i];
    const nextFlight = flights[i + 1];
    const duration =
      (nextFlight.departure.getTime() - currentFlight.arrival.getTime()) /
      (1000 * 60); // Duration in minutes

    if (currentFlight.to.code === nextFlight.from.code) {
      const layoverAirport = currentFlight.to;

      layovers.push({ isSameAirport: true, airport: layoverAirport, duration });
    } else {
      layovers.push({
        isSameAirport: false,
        arrivalAirport: currentFlight.to,
        departureAirport: nextFlight.from,
        duration,
      });
    }
  }
  return layovers;
}
