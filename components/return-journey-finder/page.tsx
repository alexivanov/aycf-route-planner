"use client";

import { FunctionComponent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { Airport, Destination, DestinationApiResult } from "@/lib/types";
import { getFullAirportName } from "@/lib/get-full-airport-name";
import { parseApiConnectionData } from "@/lib/parse-api-connection-data";
import { formatDuration, formatFlightTime } from "@/lib/format-times";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export const ReturnJourneyFinder: FunctionComponent<{
  airports: Airport[];
}> = ({ airports }) => {
  const [selectedAirports, setSelectedAirports] = useState<Airport[]>([]);
  const [startDate, setStartDate] = useState("LTN");
  const [endDate, setEndDate] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAirports.length < 1) {
      setError("Please select at least one airport.");
      return;
    }
    setLoading(true);
    setError(null);
    setDestinations([]);

    try {
      const origins = selectedAirports.map((airport) => airport.code).join(",");
      const response = await fetch(
        `/api/return-journeys?origins=${origins}&startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
      const data = (await response.json()) as DestinationApiResult[];
      if (!Array.isArray(data)) {
        throw new Error("Invalid data received from server");
      }
      setDestinations(
        data.map((destination) => ({
          ...destination,
          connections: destination.connections.map(parseApiConnectionData),
        })),
      );
      if (data.length === 0) {
        setError("No return journeys found for the given airports and dates.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`An error occurred while fetching journey data`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Return Journey Finder</h1>
      <Card>
        <CardHeader>
          <CardTitle>Search for Return Journeys</CardTitle>
          <CardDescription>
            Select one or more departure airports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="origins">Origin Airports</Label>
              <MultiSelect
                options={airports}
                selected={selectedAirports}
                onChange={setSelectedAirports}
                placeholder="Select airports..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  // Max in 3 days
                  max={
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  // Max in 3 days
                  max={
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search Journeys"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {destinations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Available Destinations with Return Journeys {destinations.length}{" "}
            destinations found
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {destinations.map((destination) => (
              <AccordionItem
                key={destination.airport.code}
                value={destination.airport.code}
                className="mb-4"
              >
                <div>
                  <AccordionTrigger>
                    <h3 className="font-semibold text-xl">
                      {getFullAirportName(destination.airport)} (
                      {destination.connections.length} option
                      {destination.connections.length > 1 && "s"})
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    {destination.connections.map((connection, index) => (
                      <div
                        key={`${destination.airport.code}-${index}`}
                        className="flex row basis-1/2"
                      >
                        <Card className="mb-4 mt-2">
                          <CardHeader>
                            <CardDescription>
                              Time in {destination.airport.name}:{" "}
                              {formatDuration(connection.layovers[0].duration)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {connection.flights.map((flight, flightIndex) => (
                                <div
                                  key={flightIndex}
                                  className="mb-4 rounded-md bg-gray-50 p-4"
                                >
                                  <p className="font-semibold">
                                    {flightIndex == 0 ? "Outbound" : "Return"}
                                  </p>
                                  <p>Date: {flight.departure.toDateString()}</p>
                                  <p>
                                    From: {getFullAirportName(flight.from)} to{" "}
                                    {getFullAirportName(flight.to)}
                                  </p>
                                  <p>
                                    Takeoff:{" "}
                                    {formatFlightTime(flight.departure)} |
                                    Landing: {formatFlightTime(flight.arrival)}
                                  </p>
                                  <p>
                                    Duration:{" "}
                                    {formatDuration(flight.durationMinutes)}
                                  </p>
                                  <p>
                                    Price: {flight.price.amount}{" "}
                                    {flight.price.currency}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};
