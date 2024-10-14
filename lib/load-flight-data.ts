import { Airport, Flight, Price } from "./types";
import { loadFlightDataFromDb } from "@/lib/database-queries";

const landsNextDay = (
  date: string,
  takeoffTime: string,
  landingTime: string,
) => {
  const departure = new Date(`${date} ${takeoffTime}`);
  const landing = new Date(`${date} ${landingTime}`);
  return departure.getTime() > landing.getTime();
};

const getDepartureTime = (date: string, takeoffTime: string): Date => {
  return new Date(`${date} ${takeoffTime}`);
};

const getArrivalTime = (
  date: string,
  takeoffTime: string,
  landingTime: string,
): Date => {
  const arrival = new Date(`${date} ${landingTime}`);
  if (landsNextDay(date, takeoffTime, landingTime)) {
    arrival.setDate(arrival.getDate() + 1);
  }
  return arrival;
};

const parseDurationMinutes = (duration: string): number => {
  const [hours, minutes] = duration.split(":");
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

// AUH (Abu Dhabi)
export const parseAirport = (airport: string): Airport => {
  const code = airport.slice(0, 3);
  const name = airport.slice(5, -1);

  return { code, name };
};

export const toDbAirportName = (airport: Airport): string => {
  return `${airport.code} (${airport.name})`;
};

// Price: 42.00AED
const parsePrice = (price: string): Price => {
  const amount = parseFloat(price.slice(0, -3));
  const currency = price.slice(-3);
  return { amount, currency };
};

export const loadFlightData = async (): Promise<Flight[]> => {
  return await loadFlightDataFromDb();
};

export const parseFlights = (data: string): Omit<Flight, "createdAt">[] => {
  const flights: Omit<Flight, "createdAt">[] = [];
  const alLines = data.split("\n").map((line) => line.trim());

  // Find the first line of flight data, it will start with 'Date:'

  const firstFlightIndex = alLines.findIndex((line) =>
    line.startsWith("Date:"),
  );
  const lines = alLines.slice(firstFlightIndex);

  for (let i = 0; i < lines.length; i += 8) {
    if (lines[i].startsWith("Date:")) {
      const date = lines[i].split(": ")[1];
      const takeoffTime = lines[i + 1].split(": ")[1];
      const landingTime = lines[i + 2].split(": ")[1];

      const departure = getDepartureTime(date, takeoffTime);
      const arrival = getArrivalTime(date, takeoffTime, landingTime);

      const durationMinutes = parseDurationMinutes(lines[i + 3].split(": ")[1]);

      const from = parseAirport(lines[i + 4].split(": ")[1]);
      const to = parseAirport(lines[i + 5].split(": ")[1]);

      const price = parsePrice(lines[i + 6].split(": ")[1]);

      flights.push({
        departure,
        arrival,
        durationMinutes,
        from,
        to,
        price,
      });
    } else {
      console.error("Invalid flight data format");
    }
  }

  const flightsFoundLine = alLines.find((line) =>
    line.startsWith("Flights found:"),
  );

  if (!flightsFoundLine) {
    throw new Error("Invalid flight data format");
  }

  const flightsFound = parseInt(flightsFoundLine.split(": ")[1], 10);

  if (flightsFound !== flights.length) {
    throw new Error(
      `Invalid flight data format. Expected ${flightsFound} flights, got ${flights.length}`,
    );
  }

  return flights;
};
