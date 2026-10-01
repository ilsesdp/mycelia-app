import { createClient } from "@/lib/supabase/server";
import { farmTodayStatus } from "@/lib/farmStatus";
import { MapView, type MapPinInput } from "@/components/browse/MapView";
import type { FarmSheetData } from "@/components/browse/FarmPinSheet";
import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// Server Component: ports SCREENS['2.1'] ("Browse — map") and ['2.10']
// ("Filters map view") as one route, the same cat/open params as the list
// view (/) so switching views via MapControls keeps the same filters.
// `pin` selects a farm whose SCREENS['2.2'] bottom-sheet detail renders on
// top, same real data the list view and farm-profile pages use.
export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const sp = await searchParams;
  const categories = toArray(sp.cat);
  const openOnly = sp.open === "1";
  const pinId = typeof sp.pin === "string" ? sp.pin : undefined;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let farmsQuery = supabase
    .from("farms")
    .select(
      `
      id,
      name,
      address,
      today_status,
      farm_categories ( category ),
      farm_hours ( day_of_week, open_time, close_time, closed ),
      products ( id, name, qty, availability, photo_url )
    `
    )
    .eq("published", true)
    .order("name");

  if (categories.length) {
    const { data: matchingFarmIds } = await supabase
      .from("farm_categories")
      .select("farm_id")
      .in("category", categories as Category[]);
    const ids = [...new Set((matchingFarmIds ?? []).map((r) => r.farm_id))];
    farmsQuery = farmsQuery.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }

  const [{ data: farms, error: farmsError }, { data: markets, error: marketsError }] = await Promise.all([
    farmsQuery,
    supabase.from("markets").select("id, name"),
  ]);

  const withStatus = (farms ?? []).map((f) => {
    const { closedEarly, ...status } = farmTodayStatus(f.farm_hours, f.today_status);
    return { ...f, status, closedEarly };
  });

  const visibleFarms = openOnly ? withStatus.filter((f) => f.status.open) : withStatus;

  const pins: MapPinInput[] = [
    ...visibleFarms.map((f) => ({
      id: f.id,
      kind: "farm" as const,
      name: f.name,
      open: f.status.open,
      closedEarly: f.closedEarly,
    })),
    ...(markets ?? []).map((m) => ({
      id: m.id,
      kind: "market" as const,
      name: m.name,
      open: true, // markets have no stored hours/status yet — always shown open
      closedEarly: false,
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
        categories: match.farm_categories.map((c) => c.category),
        status: match.status,
        ready: match.products.filter((p) => p.availability === "ready_now"),
        producing: match.products.filter((p) => p.availability === "producing"),
      };
    }
  }

  return (
    <MapView
      pins={pins}
      activeFilters={{ categories, openOnly }}
      loggedIn={!!user}
      loadError={farmsError?.message ?? marketsError?.message ?? null}
      sheet={sheet}
    />
  );
}
