import { loadFlightData } from "@/lib/load-flight-data";
import { Airport } from "@/lib/types";
import { ReturnJourneyFinder } from "@/components/return-journey-finder/page";

const Page = async () => {
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
  return <ReturnJourneyFinder airports={allAirports} />;
};

export default Page;
