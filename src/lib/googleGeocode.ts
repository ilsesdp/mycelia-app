// Server-only. Turns a free-text address into a real lat/lng via Google's
// Geocoding API — this is what makes "2.1 mi" on a farm/market card a real
// computed distance instead of nothing (see geo.ts/DistanceLabel.tsx, which
// already do the real haversine math and simply render nothing when
// lat/lng are null, which is the case for every farm/market today).
//
// Requires GOOGLE_MAPS_API_KEY as a server-side environment variable (set
// it in Vercel's Project Settings → Environment Variables — never commit it
// or put it in NEXT_PUBLIC_*, since that would ship it to every visitor's
// browser). Needs the "Geocoding API" enabled on that key's Google Cloud
// project. Never import this file from a "use client" component — call it
// from a server component, server action, or route handler only.
export type GeocodeResult = { lat: number; lng: number; formattedAddress: string };

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const trimmed = address.trim();
  if (!key || !trimmed) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${key}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: string;
    results?: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }[];
  };
  if (data.status !== "OK" || !data.results?.length) return null;

  const top = data.results[0];
  return {
    lat: top.geometry.location.lat,
    lng: top.geometry.location.lng,
    formattedAddress: top.formatted_address,
  };
}
