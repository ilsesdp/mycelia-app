import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmIdentity, type ProductRow } from "@/lib/myFarm";
import { OwnerShell } from "@/components/myfarm/OwnerShell";
import { AvailRail } from "@/components/myfarm/AvailRail";
import { EmptyProducts } from "@/components/myfarm/EmptyProducts";
import { SavedToast } from "@/components/myfarm/SavedToast";

// Ports SCREENS['4.1'] (owner), SCREENS['4.13'] (empty state) and
// SCREENS['4.2'] (public preview, via ?preview=1) — one route for all
// three since they share the same data and only the rendering mode
// differs, mirroring the prototype's own S.ownerPreview flag.
export default async function MyFarmPage({ searchParams }: PageProps<"/my-farm">) {
  const sp = await searchParams;
  const preview = sp.preview === "1";
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
    <OwnerShell farm={farm} activeTab="Products" preview={preview}>
      {!preview && list.length === 0 ? (
        <EmptyProducts />
      ) : (
        <AvailRail products={list} showManage={!preview} />
      )}
      {!preview && (
        <Suspense fallback={null}>
          <SavedToast />
        </Suspense>
      )}
    </OwnerShell>
  );
}
