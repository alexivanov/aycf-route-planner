import { Airport, AirportLocationData } from "@/lib/types";
import { isPointWithinRadius } from "geolib";

const RADIUS_METERS = 100 * 1000; // 100 km

export const getNearbyAirports = (
  iataCode: string,
  allAirports: Airport[],
  allAirportLocationData: AirportLocationData[],
): Airport[] => {
  const airportLocation = allAirportLocationData.find(
    (entry) => entry.iata == iataCode,
  );

  if (!airportLocation) {
    console.log(`Couldn't determine location for ${iataCode}`);
    return [];
  }

  const airportsToLookFor = new Map(
    allAirports.map((airport) => [airport.code, airport]),
  );

  const mainPoint = {
    longitude: parseFloat(airportLocation.longitude),
    latitude: parseFloat(airportLocation.latitude),
  };

  const nearbyAirports = allAirportLocationData.filter(
    (entry) =>
      entry.iata !== iataCode &&
      airportsToLookFor.has(entry.iata) &&
      isPointWithinRadius(
        {
          longitude: parseFloat(entry.longitude),
          latitude: parseFloat(entry.latitude),
        },
        mainPoint,
        RADIUS_METERS,
      ),
  );

  return nearbyAirports.map(
    (airport) => airportsToLookFor.get(airport.iata) as Airport,
  );
};
