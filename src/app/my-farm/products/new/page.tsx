import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId } from "@/lib/myFarm";
import { ProductForm } from "@/components/myfarm/ProductForm";

// Ports SCREENS['4.5'].
export default async function AddProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  return <ProductForm farmId={farmId} product={null} />;
}
