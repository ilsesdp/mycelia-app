import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type ProductRow } from "@/lib/myFarm";
import { AppBar } from "@/components/ui/AppBar";
import { ProductRowList } from "@/components/myfarm/ProductRowList";
import { SavedToast } from "@/components/myfarm/SavedToast";

// Ports SCREENS['4.3'] (and the 4.11 "saved" toast via ?saved=).
export default async function ManageProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, availability, qty, unit, roughly_when, photo_url")
    .eq("farm_id", farmId)
    .order("sort_order");

  return (
    <main className="flex flex-col" style={{ height: "100dvh", position: "relative" }}>
      <AppBar backHref="/my-farm" backLabel="My farm" title="Manage products" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, minHeight: 0, paddingBottom: 100, overflowY: "auto" }}>
        <ProductRowList products={(products ?? []) as ProductRow[]} />
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 24px 20px", background: "#fff", borderTop: "1px solid var(--border-subtle)" }}>
        <Link href="/my-farm/products/new" className="btn btn-primary">
          + Add another product
        </Link>
      </div>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
    </main>
  );
}
