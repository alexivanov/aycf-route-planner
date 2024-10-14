import { loadFlightData } from "@/lib/load-flight-data";
import { Airport } from "@/lib/types";
import FlightSearchPage from "@/components/flight-search/page";

const flights = await loadFlightData();

const latestDataUpdateTime = flights
  ? new Date(Math.max(...flights.map((flight) => flight.createdAt.getTime())))
  : null;

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

const Page = () => {
  return (
    <FlightSearchPage
      airports={allAirports}
      latestDataUpdateTime={latestDataUpdateTime}
    />
  );
};

export default Page;
