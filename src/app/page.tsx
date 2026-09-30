import { createClient } from "@/lib/supabase/server";
import FarmList, { type FarmListItem } from "@/components/FarmList";

// Server Component: queries Supabase directly with the visitor's
// (anonymous) RLS context, so this naturally only ever returns published
// farms — enforced by the database, not by an if-check here.
//
// Layout below ports screen 2.7 ("List view") from the tested hi-fi
// prototype (index.html) — same search bar, same farmListCard() shape,
// same token values (see globals.css). The map view (2.1) is a bigger
// lift (stylized map art + pins + geolocation) and comes after this.
export default async function HomePage() {
  const supabase = await createClient();

  const { data: farms, error } = await supabase
    .from("farms")
    .select(
      `
      id,
      name,
      address,
      today_status,
      today_status_note,
      farm_categories ( category )
    `
    )
    .eq("published", true)
    .order("name");

  const items: FarmListItem[] = (farms ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    address: f.address,
    categories: f.farm_categories.map((c) => c.category),
    todayStatus: f.today_status,
    todayStatusNote: f.today_status_note,
  }));

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3 bg-bg-canvas">
        <h1 className="title-l text-text-primary">Mycelia</h1>
        {error && (
          <p className="body-s" style={{ color: "var(--text-danger)" }}>
            Couldn&apos;t load farms: {error.message}
          </p>
        )}
      </div>
      <FarmList farms={items} />
    </main>
  );
}
