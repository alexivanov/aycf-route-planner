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

  revalidateTag("flight-data");

  return NextResponse.json({ success: true });
}
