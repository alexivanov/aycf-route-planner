import {
  getCachedAllFlights,
  getCachedLatestDataUpdateTime,
} from "@/lib/server-side-cached-props";
import { RawData } from "@/components/raw-data/page";
import { parseSerialisedFlightData } from "@/lib/parse-api-connection-data";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Raw Flight Data",
};

const Page = async () => {
  const allFlights = (await getCachedAllFlights()).map(
    parseSerialisedFlightData,
  );
  const latestDataUpdateTime = await getCachedLatestDataUpdateTime();

  return (
    <RawData flights={allFlights} latestDataUpdateTime={latestDataUpdateTime} />
  );
};

export default Page;
