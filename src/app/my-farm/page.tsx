import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmIdentity, type ProductRow } from "@/lib/myFarm";
import { OwnerShell } from "@/components/myfarm/OwnerShell";
import { AvailRail } from "@/components/myfarm/AvailRail";
import { EmptyProducts } from "@/components/myfarm/EmptyProducts";
import { SavedToast } from "@/components/myfarm/SavedToast";

// Ports SCREENS['4.1'] (owner) and SCREENS['4.13'] (empty state). The
// public-preview render (formerly SCREENS['4.2'] via ?preview=1) has been
// removed — the only farm preview left is onboarding's own Preview screen.
export default async function MyFarmPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const [farm, { data: products }] = await Promise.all([
    getMyFarmIdentity(supabase, farmId),
    supabase.from("products").select("id, name, category, availability, qty, unit, roughly_when, photo_url").eq("farm_id", farmId).order("sort_order"),
  ]);
  if (!farm) redirect("/settings");

  const list = (products ?? []) as ProductRow[];

  return (
    <OwnerShell farm={farm} activeTab="Products">
      {list.length === 0 ? <EmptyProducts /> : <AvailRail products={list} />}
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
    </OwnerShell>
  );
}
