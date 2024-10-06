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
import { Connection } from "@/lib/types";

export const ConnectionCard: FunctionComponent<{
  id: string;
  connection: Connection;
}> = ({ id, connection }) => {
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
            <p>Date: {flight.departure.toDateString()}</p>
            <p>
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
                Layover in{" "}
                {getFullAirportName(connection.layovers[flightIndex].airport)}:{" "}
                {formatDuration(connection.layovers[flightIndex].duration)}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
