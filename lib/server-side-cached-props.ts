import { unstable_cache } from "next/cache";
import { loadFlightData } from "@/lib/data/load-flight-data";
import { Airport } from "@/lib/types";
import { getLatestFlightDataUpdateTime } from "@/lib/database-queries";

export const getCachedAllAirports = unstable_cache(
  async () => {
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
    return allAirports;
  },
  ["all-airports"],
  { tags: ["flight-data"] },
);

export const getCachedLatestDataUpdateTime = unstable_cache(
  async () => {
    return await getLatestFlightDataUpdateTime();
  },
  ["latest-data-update-time"],
  { tags: ["flight-data"] },
);

export const getCachedAllFlights = unstable_cache(
  async () => {
    const flightData = await loadFlightData();

    return flightData.map((flight) => ({
      departure: flight.departure.toISOString(),
      arrival: flight.arrival.toISOString(),
      durationMinutes: flight.durationMinutes,
      from: flight.from,
      to: flight.to,
      price: flight.price,
      createdAt: flight.createdAt.toISOString(),
    }));
  },
  ["all-flights"],
  { tags: ["flight-data"] },
);
