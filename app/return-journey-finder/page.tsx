import { ReturnJourneyFinder } from "@/components/return-journey-finder/page";
import { getCachedAllAirports } from "@/lib/server-side-cached-props";

const Page = async () => {
  const allAirports = await getCachedAllAirports();

  return <ReturnJourneyFinder airports={allAirports} />;
};

export default Page;
