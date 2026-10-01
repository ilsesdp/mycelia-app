import { createClient } from "@/lib/supabase/server";
import FarmList, { type FarmListItem } from "@/components/FarmList";
import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// Server Component: queries Supabase directly with the visitor's
// (anonymous) RLS context, so this naturally only ever returns published
// farms — enforced by the database, not by an if-check here.
//
// Ports screen 2.7 ("List view") and 2.9 ("Filters list view") from the
// tested hi-fi prototype as one route: with no `cat`/`kind`/`open` params
// it's 2.7 ("N farms near you"); arriving with any of them (as Filters,
// 2.8, will once it's built) makes it 2.9 — active-filter chips + "N farms
// match your filters". `kind`/distance-radius filtering from the
// prototype's full filter set waits on the Filters screen and real
// geolocation; category and open-now already map to real columns, so
// those work today.
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const categories = toArray(sp.cat);
  const openOnly = sp.open === "1";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("farms")
    .select(
      `
      id,
      name,
      address,
      farm_categories ( category ),
      farm_hours ( day_of_week, open_time, close_time, closed )
    `
    )
    .eq("published", true)
    .order("name");

  if (categories.length) {
    // farms whose category set intersects the chosen ones
    const { data: matchingFarmIds } = await supabase
      .from("farm_categories")
      .select("farm_id")
      .in("category", categories as Category[]);
    const ids = [...new Set((matchingFarmIds ?? []).map((r) => r.farm_id))];
    query = query.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: farms, error } = await query;

  const items: FarmListItem[] = (farms ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    address: f.address,
    categories: f.farm_categories.map((c) => c.category),
    hours: f.farm_hours,
  }));

  return (
    <main className="flex flex-col min-h-screen">
      <FarmList
        farms={items}
        activeFilters={{ categories, openOnly }}
        loggedIn={!!user}
        loadError={error?.message ?? null}
      />
    </main>
  );
}
