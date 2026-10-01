import { createClient } from "@/lib/supabase/server";
import { farmTodayStatus } from "@/lib/farmStatus";
import { parseBrowseFilters, type BrowseEntry } from "@/lib/filters";
import { FiltersView } from "@/components/filters/FiltersView";

// Ports SCREENS['2.8'] — the Filters screen, reached from the list view's
// or the map view's filter button (`from` says which, same role as the
// prototype's S.lastMapView) and landing back on that same view with the
// chosen filters applied.
export default async function FiltersPage({ searchParams }: PageProps<"/filters">) {
  const sp = await searchParams;
  const filters = parseBrowseFilters(sp);
  const from = sp.from === "map" ? "map" : "list";

  const supabase = await createClient();

  const [{ data: farms }, { data: markets }] = await Promise.all([
    supabase
      .from("farms")
      .select(
        `
        id,
        today_status,
        farm_categories ( category ),
        farm_hours ( day_of_week, open_time, close_time, closed ),
        products ( availability )
      `
      )
      .eq("published", true),
    supabase.from("markets").select("id"),
  ]);

  const entries: BrowseEntry[] = [
    ...(farms ?? []).map((f) => ({
      kind: "farm" as const,
      categories: f.farm_categories.map((c) => c.category),
      open: farmTodayStatus(f.farm_hours, f.today_status).open,
      hasReadyProduct: f.products.some((p) => p.availability === "ready_now"),
    })),
    ...(markets ?? []).map(() => ({
      kind: "market" as const,
      categories: [] as string[],
      open: true,
      hasReadyProduct: false,
    })),
  ];

  return <FiltersView initialFilters={filters} entries={entries} from={from} />;
}
