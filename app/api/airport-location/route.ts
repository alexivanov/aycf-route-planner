import { NextResponse } from "next/server";
import { parse } from "csv-parse";
import * as fs from "node:fs";
import { AirportLocationData } from "@/lib/types";

const AIRPORT_LOCATION_DATA_PATH = "data/airport-location-data.csv";

const loadAirportLocationData = async () => {
  // Read from CSV file, and return it as an array of objects
  const text = fs.readFileSync(AIRPORT_LOCATION_DATA_PATH, "utf-8");
  return await new Promise<AirportLocationData[]>((resolve, reject) => {
    parse(text, { columns: true }, (err, records: AirportLocationData[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    });
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iataCode = searchParams.get("iataCode");

  if (!iataCode) {
    return NextResponse.json(
      { error: "iataCode is required" },
      { status: 400 },
    );
  }

  const airportLocationData = await loadAirportLocationData();
  const data = airportLocationData.find((item) => item.iata === iataCode);

  if (!data) {
    return NextResponse.json({ error: "Airport not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
