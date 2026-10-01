import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/googleGeocode";

// Thin server-side proxy so client components (onboarding's address search,
// Edit profile, Add a market) can get a real lat/lng without the Google API
// key ever reaching the browser. Returns { result: null } — not an error —
// when the key isn't configured yet or the address doesn't resolve, so
// callers can fall back to "no coordinates on file" rather than breaking.
export async function POST(req: NextRequest) {
  let address: unknown;
  try {
    ({ address } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof address !== "string" || !address.trim()) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const result = await geocodeAddress(address);
  return NextResponse.json({ result });
}
