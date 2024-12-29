export interface Flight {
  // Local time of the departure airport, callers should ignore the time zone
  departure: Date;
  // Local time of the arrival airport, callers should ignore the time zone
  arrival: Date;
  durationMinutes: number;
  from: Airport;
  to: Airport;
  price: Price;

  createdAt: Date;
}

export interface FlightApiResult
  extends Omit<Flight, "departure" | "arrival" | "createdAt"> {
  departure: string;
  arrival: string;

  createdAt: string;
}

export interface Airport {
  code: string;
  name: string;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Connection {
  flights: Omit<Flight, "createdAt">[];
  totalDuration: number;
  layovers: Layover[];
  hasAirportChangeLayover: boolean;
}

export interface SameAirportLayover {
  isSameAirport: true;
  airport: Airport;
  duration: number;
}

export interface AirportChangeLayover {
  isSameAirport: false;
  arrivalAirport: Airport;
  departureAirport: Airport;
  duration: number;
}

export type Layover = SameAirportLayover | AirportChangeLayover;

export interface ConnectionApiResult extends Omit<Connection, "flights"> {
  flights: FlightApiResult[];
}

export interface Destination {
  airport: Airport;
  connections: Connection[];
}

export interface DestinationApiResult extends Omit<Destination, "connections"> {
  connections: ConnectionApiResult[];
}

export interface AirportLocationData {
  country_code: string;
  region_name: string;
  iata: string;
  icao: string;
  airport: string;
  latitude: string;
  longitude: string;
}
