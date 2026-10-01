"use client";

import { useGeolocation } from "@/lib/useGeolocation";
import { distanceMiles, formatDistance } from "@/lib/geo";

// Distance from the visitor's real browser geolocation to a farm/market's
// stored lat/lng, shown as " · 2.1 mi" next to its address. Renders
// nothing when either side is missing — no permission yet, denied, or (the
// common case today) the farm/market has no real coordinates on file — see
// geo.ts's note on why that's the honest behavior rather than a guess.
export function DistanceLabel({ lat, lng }: { lat: number | null; lng: number | null }) {
  const { status, coords } = useGeolocation();

  if (status !== "granted" || !coords || lat == null || lng == null) return null;

  const mi = distanceMiles(coords.lat, coords.lng, lat, lng);
  return <>&nbsp;· {formatDistance(mi)}</>;
}
