import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId } from "@/lib/myFarm";
import { AddMarketForm } from "@/components/myfarm/AddMarketForm";

// Ports the "+ Add a market" button on SCREENS['4.22'] — the prototype
// reuses 1.17 (onboarding's add-market form) with a dynamic back target;
// this is that same form against the real tables, standalone from the
// onboarding flow's in-memory draft context.
export default async function AddMarketPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  return <AddMarketForm farmId={farmId} />;
}
