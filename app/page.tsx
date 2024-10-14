import { Airport } from "@/lib/types";
import FlightSearchPage from "@/components/flight-search/page";

const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const latestUpdateTimeData = await fetch(
  `${HOST}/api/latest-data-update-time`,
  {
    cache: "no-store",
  },
).then((res) => res.json());

const latestDataUpdateTime = new Date(latestUpdateTimeData);

const allAirports: Airport[] = await fetch(`${HOST}/api/all-airports`, {
  cache: "no-store",
}).then((res) => res.json());

const Page = () => {
  return (
    <FlightSearchPage
      airports={allAirports}
      latestDataUpdateTime={latestDataUpdateTime}
    />
  );
};

export default Page;
