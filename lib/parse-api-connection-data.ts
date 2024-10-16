import {
  Connection,
  ConnectionApiResult,
  Flight,
  FlightApiResult,
} from "@/lib/types";

export const parseApiConnectionData = (
  data: ConnectionApiResult,
): Connection => {
  return {
    ...data,
    flights: data.flights.map(parseSerialisedFlightData),
  };
};

export const parseSerialisedFlightData = (flight: FlightApiResult): Flight => ({
  ...flight,
  departure: new Date(flight.departure),
  arrival: new Date(flight.arrival),
  createdAt: new Date(flight.createdAt),
});
