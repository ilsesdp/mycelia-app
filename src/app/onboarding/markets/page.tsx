import { createClient } from "@/lib/supabase/server";
import { MarketsPicker } from "./MarketsPicker";

// Ports SCREENS['1.10'] — server component fetching the real `markets`
// table (public.markets, select-all RLS) instead of the prototype's
// in-memory MARKETS array; selection/navigation lives in the client child.
export default async function MarketsPage() {
  const supabase = await createClient();
  const { data: markets } = await supabase.from("markets").select("id, name, schedule_text").order("name");

  return <MarketsPicker markets={markets ?? []} />;
}
