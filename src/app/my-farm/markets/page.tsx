import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmMarkets } from "@/lib/myFarm";
import { ManageMarketsList } from "@/components/myfarm/ManageMarketsList";

// Ports SCREENS['4.22'] (stand-in — no Figma spec).
export default async function ManageMarketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const markets = await getMyFarmMarkets(supabase, farmId);

  return <ManageMarketsList farmId={farmId} markets={markets} />;
}
