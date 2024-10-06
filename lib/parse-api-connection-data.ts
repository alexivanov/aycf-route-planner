import { Connection, ConnectionApiResult } from "@/lib/types";

export const parseApiConnectionData = (
  data: ConnectionApiResult,
): Connection => {
  return {
    ...data,
    flights: data.flights.map((flight) => ({
      ...flight,
      departure: new Date(flight.departure),
      arrival: new Date(flight.arrival),
    })),
  };
};
