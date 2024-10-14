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
  layovers: { airport: Airport; duration: number }[];
}

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
