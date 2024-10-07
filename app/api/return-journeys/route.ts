import { loadFlightData } from "@/lib/load-flight-data";
import { NextResponse } from "next/server";
import { Airport, Connection, Destination, Flight } from "@/lib/types";

const MINIMUM_DURATION_BETWEEN_FLIGHTS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origins = searchParams.get("origins");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!origins || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  try {
    new Date(startDate);
    new Date(endDate);
  } catch {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Make endDate end of day
  endDateObj.setHours(23, 59, 59, 999);

  const fromAirports = new Set(origins.split(","));

  const flights = await loadFlightData();

  const airportsByCode = flights.reduce<Record<string, Airport>>(
    (acc, flight) => {
      if (!acc[flight.from.code]) {
        acc[flight.from.code] = flight.from;
      }
      if (!acc[flight.to.code]) {
        acc[flight.to.code] = flight.to;
      }
      return acc;
    },
    {},
  );

  // destination -> {departureFlights: Flight[], arrivalFlight[]}
  const allDestinationResults: Map<
    string,
    { departureFlights: Flight[]; arrivalFlights: Flight[] }
  > = flights.reduce((acc, flight) => {
    if (
      !fromAirports.has(flight.from.code) &&
      !fromAirports.has(flight.to.code)
    ) {
      return acc;
    }

    // just in case ignore flights that start and end in an origin airport
    if (
      fromAirports.has(flight.from.code) &&
      fromAirports.has(flight.to.code)
    ) {
      return acc;
    }

    // Limit to flights within the date range
    if (
      flight.departure.getTime() < startDateObj.getTime() ||
      flight.arrival.getTime() > endDateObj.getTime()
    ) {
      return acc;
    }

    if (!acc.has(flight.from.code) && !fromAirports.has(flight.from.code)) {
      acc.set(flight.from.code, {
        departureFlights: [],
        arrivalFlights: [],
      });
    }

    if (!acc.has(flight.to.code) && !fromAirports.has(flight.to.code)) {
      acc.set(flight.to.code, {
        departureFlights: [],
        arrivalFlights: [],
      });
    }

    if (fromAirports.has(flight.from.code)) {
      acc.get(flight.to.code).departureFlights.push(flight);
    }

    if (fromAirports.has(flight.to.code)) {
      acc.get(flight.from.code).arrivalFlights.push(flight);
    }

    return acc;
  }, new Map());

  // Build all possible connections
  const destinations: Destination[] = [];
  for (const [
    code,
    { departureFlights, arrivalFlights },
  ] of allDestinationResults) {
    const connections: Connection[] = [];

    for (const departureFlight of departureFlights) {
      for (const arrivalFlight of arrivalFlights) {
        const timeBetweenFlights =
          arrivalFlight.departure.getTime() - departureFlight.arrival.getTime();
        if (
          timeBetweenFlights > MINIMUM_DURATION_BETWEEN_FLIGHTS // arrival is after departure and at lest 3 houurs
        ) {
          connections.push({
            flights: [departureFlight, arrivalFlight],
            totalDuration:
              departureFlight.durationMinutes + arrivalFlight.durationMinutes,
            layovers: [
              {
                airport: airportsByCode[arrivalFlight.from.code],
                duration:
                  (arrivalFlight.departure.getTime() -
                    departureFlight.arrival.getTime()) /
                  1000 /
                  60,
              },
            ],
          });
        }
      }
    }

    if (connections.length > 0) {
      destinations.push({
        airport: airportsByCode[code],
        connections,
      });
    }
  }

  // Sort connections by arrival time, keeping in mind that some flights may arrive the next day
  destinations.sort((a, b) => {
    return a.airport.code.localeCompare(b.airport.code);
  });

  console.log(
    `[route log] Return flight search from ${origins} between ${startDate} and ${endDate} - found ${destinations.length} destinations`,
  );

  return NextResponse.json(destinations);
}
