"use client";

import { FunctionComponent, useState } from "react";
import { Flight } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

const SPACER = "------------------------------------------------------";

const parseFlightData = (flights: Flight[]): string => {
  let data: string = "";

  data += `${SPACER}\nFlights found: ${flights.length}\n${SPACER}\n`;

  //Date: 2024-10-02
  // Takeoff: 16:40
  // Landing: 22:10
  // Duration: 05:30
  // From: AUH (Abu Dhabi)
  // To: ALA (Almaty)
  // Price: 42.00AED

  for (const flight of flights) {
    data += `Date: ${flight.departure.toISOString().substring(0, 10)}\n`;
    data += `Takeoff: ${flight.departure.toISOString().substring(11, 16)}\n`;
    data += `Landing: ${flight.arrival.toISOString().substring(11, 16)}\n`;
    data += `Duration: ${Math.floor(flight.durationMinutes / 60)
      .toString(10)
      .padStart(
        2,
        "0",
      )}:${(flight.durationMinutes % 60).toString(10).padStart(2, "0")}\n`;
    data += `From: ${flight.from.code} (${flight.from.name})\n`;
    data += `To: ${flight.to.code} (${flight.to.name})\n`;
    data += `Price: ${flight.price.amount}${flight.price.currency}\n`;
    data += "\n";
  }

  data += SPACER;

  return data;
};

export const RawData: FunctionComponent<{
  flights: Flight[];
  latestDataUpdateTime: number | null;
}> = ({ flights, latestDataUpdateTime }) => {
  const [copied, setCopied] = useState(false);

  const flightData = parseFlightData(flights);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(flightData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Raw Flight Data</h1>
      <Card>
        <CardHeader>
          <CardTitle>Flight Data</CardTitle>
          <CardDescription>
            <div>Raw flight data from the server</div>
            {latestDataUpdateTime && (
              <div>
                The was last updated at{" "}
                {new Date(latestDataUpdateTime).toString()}.
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Button
              className="absolute top-2 right-2 z-10"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
            <pre className="p-4 bg-muted rounded-md overflow-y-auto">
              <code>{flightData}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
