import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Server Component: runs on the server, queries Supabase directly with the
// visitor's (anonymous) RLS context — so this naturally only ever returns
// published farms, enforced by the database, not by an if-check here.
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
      farm_categories ( category ),
      products ( availability )
    `
    )
    .eq("published", true)
    .order("name");

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="font-display font-black text-4xl text-text-primary">
          Mycelia
        </h1>
        <p className="text-text-secondary mt-1">
          Growers near you, straight from the database.
        </p>
      </header>

      {error && (
        <p className="text-sm text-[--color-field-red-700]">
          Couldn&apos;t load farms: {error.message}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {farms?.map((farm) => {
          const readyCount = farm.products.filter(
            (p) => p.availability === "ready_now"
          ).length;
          return (
            <li key={farm.id}>
              <Link
                href={`/farms/${farm.id}`}
                className="block rounded-xl border border-border-subtle bg-bg-raised p-4 hover:border-interactive-accent transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display font-semibold text-lg text-text-primary">
                    {farm.name}
                  </span>
                  {readyCount > 0 && (
                    <span className="shrink-0 rounded-full bg-[--color-golden-harvest-500] text-[--color-neutral-900] text-xs font-semibold px-2.5 py-1">
                      {readyCount} ready now
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {farm.address}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {farm.farm_categories.map(({ category }) => (
                    <span
                      key={category}
                      className="text-xs px-2 py-0.5 rounded-full bg-bg-subtle text-text-secondary"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {farms?.length === 0 && (
        <p className="text-text-secondary">No published farms yet.</p>
      )}
    </main>
  );
}
