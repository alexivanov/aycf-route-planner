import { Airport } from "./types";

export const getFullAirportName = (airport: Airport) =>
  `${airport.code} (${airport.name})`;
