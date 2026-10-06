import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFarmHeader, resolveBackHref } from "@/lib/farmProfile";
import { FarmProfileShell } from "@/components/farm/FarmProfileShell";
import { AvailRail } from "@/components/myfarm/AvailRail";
import type { ProductRow } from "@/lib/myFarm";

// Ports SCREENS['2.3'] — the farm profile's Products tab (visitor view).
// Shares AvailRail with the owner's own My Farm > Products tab (4.1) so
// the two look identical — same "Our products" header, filter pills, and
// two-column grid — except a visitor never sees the "Manage" link.
export default async function FarmProductsPage({ params, searchParams }: PageProps<"/farms/[id]/products">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [farm, { data: products }] = await Promise.all([
    getFarmHeader(supabase, id),
    supabase.from("products").select("id, name, category, availability, qty, unit, roughly_when, photo_url").eq("farm_id", id).order("sort_order"),
  ]);

  if (!farm) notFound();

  const list = (products ?? []) as ProductRow[];

  return (
    <FarmProfileShell farm={farm} activeTab="Products" backHref={resolveBackHref(sp.from)} loggedIn={!!user}>
      <AvailRail products={list} showManage={false} />
    </FarmProfileShell>
  );
}
