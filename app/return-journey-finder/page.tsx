import { ReturnJourneyFinder } from "@/components/return-journey-finder/page";
import { getCachedAllAirports } from "@/lib/server-side-cached-props";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Return Journey Finder",
};

const Page = async () => {
  const allAirports = await getCachedAllAirports();

  return <ReturnJourneyFinder airports={allAirports} />;
};

export default Page;
