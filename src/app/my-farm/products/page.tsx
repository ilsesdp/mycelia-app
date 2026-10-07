import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type ProductRow } from "@/lib/myFarm";
import { ManageProductsList } from "@/components/myfarm/ManageProductsList";

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

  return <ManageProductsList products={(products ?? []) as ProductRow[]} />;
}
