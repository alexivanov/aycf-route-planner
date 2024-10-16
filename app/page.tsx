import FlightSearchPage from "@/components/flight-search/page";
import {
  getCachedAllAirports,
  getCachedLatestDataUpdateTime,
} from "@/lib/server-side-cached-props";

export const dynamic = "force-dynamic";

const Page = async () => {
  const allAirports = await getCachedAllAirports();
  const latestDataUpdateTime = await getCachedLatestDataUpdateTime();

  return (
    <FlightSearchPage
      airports={allAirports}
      latestDataUpdateTime={latestDataUpdateTime}
    />
  );
};

export default Page;
