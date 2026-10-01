// Straight-line (haversine) distance in miles between the visitor's
// geolocation and a farm/market's stored lat/lng. Real coordinates: no
// fake/randomized distance is ever shown — see mapPins.ts's own note that
// farms.lat/lng (and now markets.lat/lng) exist for a future geocoding
// integration that isn't wired up yet (no Places/Geocoding API key
// configured, the same constraint already explained for address lookup).
// Until something populates those columns, this simply has nothing to
// compute from and renders nothing, rather than a misleading number.
export function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8; // Earth radius, miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(mi: number): string {
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

// "1420 Willow Creek Rd, Pecatonica, IL" -> "1420 Willow Creek Rd" — the
// abbreviated form used on compact cards (the map pin's drawer sheet),
// versus the full address shown on the farm/market's own page.
export function abbreviateAddress(address: string): string {
  return address.split(",")[0].trim();
}
