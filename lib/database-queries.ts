import { Flight } from "@/lib/types";
import prisma from "@/lib/db";
import { parseAirport, toDbAirportName } from "./load-flight-data";

export const loadFlightDataFromDb = async (): Promise<Flight[]> => {
  const flightsData = await prisma.activeFlight.findMany({
    orderBy: [{ createdAt: "asc" }, { from: "asc" }, { departure: "asc" }],
  });

  return flightsData.map((flightData) => ({
    departure: flightData.departure,
    arrival: flightData.arrival,
    durationMinutes: flightData.duration,
    from: parseAirport(flightData.from),
    to: parseAirport(flightData.to),
    price: {
      amount: flightData.price.toNumber(),
      currency: flightData.priceCurrency,
    },
    createdAt: flightData.createdAt,
  }));
};

// Replaces the existing Active Flight data in the database with the new data.
// The current active flights will be inserted as historical flights.
export const saveNewFlightsData = async (
  flights: Omit<Flight, "createdAt">[],
) => {
  const updateTimestamp = new Date();
  const activeFlights = await prisma.activeFlight.findMany();
  await prisma.historicalFlight.createMany({
    data: activeFlights.map((flight) => ({
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      from: flight.from,
      to: flight.to,
      price: flight.price,
      priceCurrency: flight.priceCurrency,
      addedAt: flight.createdAt,
      removedAt: updateTimestamp,
    })),
  });

  await prisma.activeFlight.deleteMany();

  const minNewDataFlightDate = new Date(
    Math.min(...flights.map((flight) => flight.departure.getTime())),
  );
  minNewDataFlightDate.setHours(0, 0, 0, 0);

  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);

  // Find flights which are between today and minNewDataFlightDate and add them to active flights
  // This is to ensure that we don't lose any flights which are still valid but not in the new data
  const stillActiveFlightsNotInNewData = activeFlights.filter(
    (flight) =>
      flight.departure >= todayAtMidnight &&
      flight.departure < minNewDataFlightDate,
  );

  const newActiveFlights = [
    ...stillActiveFlightsNotInNewData,
    ...flights.map((flight) => ({
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.durationMinutes,
      from: toDbAirportName(flight.from),
      to: toDbAirportName(flight.to),
      price: flight.price.amount,
      priceCurrency: flight.price.currency,
      createdAt: updateTimestamp,
    })),
  ];

  await prisma.activeFlight.createMany({
    data: newActiveFlights,
  });
};

export const getLatestFlightDataUpdateTime = async (): Promise<
  number | null
> => {
  const latestFlight = await prisma.activeFlight.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return latestFlight?.createdAt.getTime() ?? null;
};
