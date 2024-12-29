import { loadAirportLocationData } from "./data/load-airport-location-data";
import { AirportLocationData } from "./types";

export const getAirportLocation = async (
  iataCode: string,
): Promise<AirportLocationData | null> => {
  const airportLocationData = await loadAirportLocationData();
  const location = airportLocationData.find((item) => item.iata === iataCode);

  return location ?? null;
};
