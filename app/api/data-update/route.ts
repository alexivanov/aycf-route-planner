import { saveNewFlightsData } from "@/lib/database-queries";
import { parseFlights } from "@/lib/load-flight-data";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  const expectedAuth = process.env.DATA_UPDATE_AUTH;

  if (!expectedAuth) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  if (auth !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedDataFileUrl_ = (await request.formData()).get("fileUrl");

  if (!updatedDataFileUrl_) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  let updatedDataFileUrl: string;
  try {
    updatedDataFileUrl = parseDataFileUrl(updatedDataFileUrl_ as string);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const updatedData = await fetch(updatedDataFileUrl as string).then((res) =>
    res.text(),
  );

  const flights = parseFlights(updatedData);

  await saveNewFlightsData(flights);

  console.log(`Found ${flights.length} flights in the updated data`);

  revalidateTag("all-airports");
  revalidateTag("latest-data-update-time");

  return NextResponse.json({ success: true });
}

const parseDataFileUrl = (data: string): string => {
  try {
    const url = new URL(data);

    // Check if it's a pastebin URL and add the raw URL if it is
    if (
      url.hostname === "pastebin.com" &&
      url.pathname.startsWith("/") &&
      !url.pathname.includes("/raw/")
    ) {
      return `https://pastebin.com/raw/${url.pathname.slice(1)}`;
    }

    return url.toString();
  } catch {
    throw new Error("Invalid URL");
  }
};
