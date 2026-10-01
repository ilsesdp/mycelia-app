import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type ProductRow } from "@/lib/myFarm";
import { ProductForm } from "@/components/myfarm/ProductForm";

// Ports SCREENS['4.4'].
export default async function EditProductPage({ params }: PageProps<"/my-farm/products/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const { data: product } = await supabase
    .from("products")
    .select("id, name, category, availability, qty, unit, roughly_when, photo_url")
    .eq("id", id)
    .eq("farm_id", farmId)
    .maybeSingle();
  if (!product) notFound();

  return <ProductForm farmId={farmId} product={product as ProductRow} />;
}
