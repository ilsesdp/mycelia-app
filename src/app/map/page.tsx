import { createClient } from "@/lib/supabase/server";
import { farmTodayStatus } from "@/lib/farmStatus";
import { parseBrowseFilters, matchesBrowseFilters } from "@/lib/filters";
import { MapView, type MapPinInput } from "@/components/browse/MapView";
import type { FarmSheetData } from "@/components/browse/FarmPinSheet";

// Server Component: ports SCREENS['2.1'] ("Browse — map") and ['2.10']
// ("Filters map view") as one route, the same filters the list view (/)
// uses so switching views via MapControls keeps the same active filters.
// `pin` selects a farm whose SCREENS['2.2'] bottom-sheet detail renders on
// top, same real data the list view and farm-profile pages use.
export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const sp = await searchParams;
  const filters = parseBrowseFilters(sp);
  const pinId = typeof sp.pin === "string" ? sp.pin : undefined;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: farms, error: farmsError }, { data: markets, error: marketsError }] = await Promise.all([
    supabase
      .from("farms")
      .select(
        `
      id,
      owner_id,
      name,
      address,
      lat,
      lng,
      today_status,
      cover_photo_url,
      timezone,
      farm_categories ( category ),
      farm_hours ( day_of_week, open_time, close_time, closed ),
      products ( id, name, qty, availability, photo_url )
    `
      )
      .eq("published", true)
      .order("name"),
    supabase.from("markets").select("id, name"),
  ]);

  const withStatus = (farms ?? []).map((f) => {
    const { closedEarly, ...status } = farmTodayStatus(f.farm_hours, f.today_status, f.timezone);
    const categories = f.farm_categories.map((c) => c.category);
    return {
      ...f,
      status,
      closedEarly,
      categories,
      hasReadyProduct: f.products.some((p) => p.availability === "ready_now"),
    };
  });

  // The signed-in visitor's own farm (if any) isn't given its own pin —
  // it's not a place to go "find", it's where they already are, so it's
  // represented by the "You are here" marker instead (see ownFarm
  // below), never both.
  const ownFarm = user ? withStatus.find((f) => f.owner_id === user.id) : undefined;

  const visibleFarms = withStatus.filter(
    (f) =>
      f.id !== ownFarm?.id &&
      matchesBrowseFilters({ kind: "farm", categories: f.categories, open: f.status.open, hasReadyProduct: f.hasReadyProduct }, filters)
  );
  const visibleMarkets = (markets ?? []).filter(() =>
    matchesBrowseFilters({ kind: "market", categories: [], open: true, hasReadyProduct: false }, filters)
  );

  const pins: MapPinInput[] = [
    // Raw hours + manual override, not the precomputed open/closedEarly
    // above (those exist for server-side filtering, via matchesBrowseFilters
    // — see MapPin's comment in MapArt.tsx for why the pin itself needs the
    // raw data instead).
    ...visibleFarms.map((f) => ({
      id: f.id,
      kind: "farm" as const,
      name: f.name,
      hours: f.farm_hours,
      todayStatus: f.today_status,
      timezone: f.timezone,
    })),
    ...visibleMarkets.map((m) => ({
      id: m.id,
      kind: "market" as const,
      name: m.name,
      // Markets have no stored hours/status yet, and their pin's icon
      // never varies by state anyway (see pinImageSrc in lib/mapPins.ts).
      hours: [],
      todayStatus: null,
      timezone: "America/Chicago",
    })),
  ];

  let sheet: FarmSheetData | null = null;
  if (pinId) {
    const match = withStatus.find((f) => f.id === pinId);
    if (match) {
      sheet = {
        id: match.id,
        name: match.name,
        address: match.address,
        lat: match.lat,
        lng: match.lng,
        categories: match.categories,
        hours: match.farm_hours,
        todayStatus: match.today_status,
        timezone: match.timezone,
        products: match.products,
        coverPhotoUrl: match.cover_photo_url,
      };
    }
  }

  return (
    <MapView
      pins={pins}
      filters={filters}
      loggedIn={!!user}
      loadError={farmsError?.message ?? marketsError?.message ?? null}
      sheet={sheet}
      ownFarm={ownFarm ? { name: ownFarm.name, hours: ownFarm.farm_hours, todayStatus: ownFarm.today_status, timezone: ownFarm.timezone } : null}
    />
  );
}
