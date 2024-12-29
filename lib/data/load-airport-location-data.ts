import path from "node:path";
import fs from "node:fs";
import { AirportLocationData } from "@/lib/types";
import { parse } from "csv-parse";

const AIRPORT_LOCATION_DATA_PATH = "data/airport-location-data.csv";

export const loadAirportLocationData = async () => {
  // Read from CSV file, and return it as an array of objects
  const filePath = path.join(process.cwd(), AIRPORT_LOCATION_DATA_PATH);
  const text = fs.readFileSync(filePath, "utf-8");
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
