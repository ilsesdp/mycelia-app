import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FarmList, { type MarketListItem } from "@/components/FarmList";
import type { FarmListItem } from "@/components/FarmList";
import { parseBrowseFilters } from "@/lib/filters";

// Server Component: queries Supabase directly with the visitor's
// (anonymous) RLS context, so this naturally only ever returns published
// farms — enforced by the database, not by an if-check here.
//
// Ports screen 2.7 ("List view") and 2.9 ("Filters list view") from the
// tested hi-fi prototype as one route: with no filters active it's 2.7
// ("N farms near you"); arriving with any (as set on the Filters screen,
// 2.8) makes it 2.9 — active-filter chips + "N farms match your filters".
// Markets are now listed here too (farmListCard() in the prototype shows
// both kinds in one list) so the "Farms"/"Markets" kind filter has
// something to actually filter between.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const filters = parseBrowseFilters(sp);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The prototype's own entry point is 1.1 (Welcome) for every fresh,
  // logged-out session — SCREENS['1.1'] is its literal initial `screen`
  // state, not something reached by first browsing in as a guest. This
  // route ported 2.7/2.9's content but not that gate, so opening the
  // production link with no session landed straight on the farm list
  // instead of prompting sign up/log in first. A signed-in visitor still
  // sees this list exactly as before.
  if (!user) redirect("/welcome");

  const [{ data: farms, error }, { data: markets, error: marketsError }] = await Promise.all([
    supabase
      .from("farms")
      .select(
        `
        id,
        name,
        address,
        today_status,
        timezone,
        farm_categories ( category ),
        farm_hours ( day_of_week, open_time, close_time, closed ),
        products ( availability )
      `
      )
      .eq("published", true)
      .order("name"),
    supabase.from("markets").select("id, name, location, schedule_text, day_of_week, open_time, close_time, timezone").order("name"),
  ]);

  const items: FarmListItem[] = (farms ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    address: f.address,
    categories: f.farm_categories.map((c) => c.category),
    hours: f.farm_hours,
    todayStatus: f.today_status,
    timezone: f.timezone,
    hasReadyProduct: f.products.some((p) => p.availability === "ready_now"),
  }));

  const marketItems: MarketListItem[] = (markets ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    location: m.location,
    schedule_text: m.schedule_text,
    day_of_week: m.day_of_week,
    open_time: m.open_time,
    close_time: m.close_time,
    timezone: m.timezone,
  }));

  return (
    <main className="flex flex-col min-h-screen">
      <FarmList
        farms={items}
        markets={marketItems}
        filters={filters}
        loggedIn={!!user}
        loadError={error?.message ?? marketsError?.message ?? null}
      />
    </main>
  );
}
