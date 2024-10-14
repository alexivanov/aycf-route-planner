import { Airport } from "@/lib/types";
import { ReturnJourneyFinder } from "@/components/return-journey-finder/page";

const Page = async () => {
  const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

  const allAirports : Airport[] = await fetch(`${HOST}/api/all-airports`, {
      cache: "no-store",
    })
    .then((res) => res.json());
  return <ReturnJourneyFinder airports={allAirports} />;
};

export default Page;
