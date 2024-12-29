import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration, formatFlightTime } from "@/lib/format-times";
import { getFullAirportName } from "@/lib/get-full-airport-name";
import { FunctionComponent } from "react";
import { Airport, Connection, Layover } from "@/lib/types";

import cx from "classnames";

const LayoverBody: FunctionComponent<{ layover: Layover }> = ({ layover }) => {
  if (layover.isSameAirport) {
    return (
      <>
        Layover in {getFullAirportName(layover.airport)}:{" "}
        {formatDuration(layover.duration)}
      </>
    );
  }

  return (
    <p className="font-bold text-red-700">
      Change from {getFullAirportName(layover.arrivalAirport)} to{" "}
      {getFullAirportName(layover.departureAirport)}:{" "}
      {formatDuration(layover.duration)}
    </p>
  );
};

export const ConnectionCard: FunctionComponent<{
  id: string;
  connection: Connection;
  from: Airport;
  to: Airport;
}> = ({ id, connection, from, to }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Connection {id}</CardTitle>
        <CardDescription>
          Total Duration: {formatDuration(connection.totalDuration)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connection.flights.map((flight, flightIndex) => (
          <div key={flightIndex} className="mb-4 rounded-md bg-gray-50 p-4">
            <p className="font-semibold">Flight {flightIndex + 1}:</p>
            <p>Date: {flight.departure.toUTCString().substring(0, 16)}</p>
            <p
              className={cx({
                "font-bold text-red-700":
                  (flightIndex == 0 && flight.from.code != from.code) ||
                  (flightIndex == connection.flights.length - 1 &&
                    flight.to.code != to.code),
              })}
            >
              From: {getFullAirportName(flight.from)} to{" "}
              {getFullAirportName(flight.to)}
            </p>
            <p>
              Takeoff: {formatFlightTime(flight.departure)} | Landing:{" "}
              {formatFlightTime(flight.arrival)}
            </p>
            <p>Duration: {formatDuration(flight.durationMinutes)}</p>
            <p>
              Price: {flight.price.amount} {flight.price.currency}
            </p>
            {connection.layovers[flightIndex] && (
              <p
                className={`mt-2 text-sm ${connection.layovers[flightIndex].duration <= 30 ? "font-bold text-red-700" : "text-gray-600"}`}
              >
                <LayoverBody layover={connection.layovers[flightIndex]} />
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
