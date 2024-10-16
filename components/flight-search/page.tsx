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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Airport, Connection, ConnectionApiResult } from "@/lib/types";
import { ConnectionCard } from "@/components/ui/connection";
import { parseApiConnectionData } from "@/lib/parse-api-connection-data";

const FlightSearchPage: FunctionComponent<{
  airports: Airport[];
  latestDataUpdateTime: number | null;
}> = ({ airports, latestDataUpdateTime }) => {
  const [from, setFrom] = useState<Airport | null>(null);
  const [to, setTo] = useState<Airport | null>(null);
  const [date, setDate] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Please select both departure and arrival airports.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/flights?from=${from.code}&to=${to.code}&date=${date}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as ConnectionApiResult[];
      setConnections(data.map(parseApiConnectionData));
      if (data.length === 0) {
        setError("No flights found for the given route and date.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`An error occurred while fetching flight data`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">AYCF Flight Connection Finder</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
          <CardDescription className="max-w-2xl">
            <div>
              This is very experimental and data is manually updated from
              external sources.{" "}
            </div>
            <div>
              95% percent of this website was AI generated. It should be
              accurate but double check with the Multipass site. 🤷‍♂️
            </div>

            {latestDataUpdateTime && (
              <div className="font-bold">
                Last availability data update:{" "}
                {new Date(latestDataUpdateTime).toString()}
              </div>
            )}

            <div className="mt-3 font-bold">
              Also don&apos;t book flights with &lt;3 hour layover. You will
              miss your flight.
            </div>
            <div className="mt-3">
              Known issues:
              <ul className="list-disc">
                <li>
                  Flight durations are inaccurate (Caravelo still haven&apos;t
                  fixed them on the multipass site)
                </li>
              </ul>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Search for Flights</CardTitle>
          <CardDescription>
            Enter your departure and arrival airports, and travel date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Popover open={openFrom} onOpenChange={setOpenFrom}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openFrom}
                      className="w-full justify-between"
                    >
                      {from
                        ? `${from.code} - ${from.name}`
                        : "Select airport..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup>
                          {airports.map((airport) => (
                            <CommandItem
                              key={airport.code}
                              onSelect={() => {
                                setFrom(airport);
                                setOpenFrom(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  from?.code === airport.code
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {airport.code} - {airport.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Popover open={openTo} onOpenChange={setOpenTo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTo}
                      className="w-full justify-between"
                    >
                      {to ? `${to.code} - ${to.name}` : "Select airport..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup>
                          {airports.map((airport) => {
                            return (
                              <CommandItem
                                key={airport.code}
                                value={airport.code}
                                onSelect={() => {
                                  setTo(airport);
                                  setOpenTo(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    to?.code === airport.code
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {airport.code} - {airport.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
              {loading ? "Searching..." : "Search Flights"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 rounded-md bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {connections.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">
            Available Connections (max 2 stop-overs) ({connections.length})
          </h2>
          {connections.map((connection, index) => (
            <ConnectionCard
              key={index}
              id={(index + 1).toString()}
              connection={connection}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightSearchPage;
