import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId } from "@/lib/myFarm";
import { UsualHoursForm } from "@/components/myfarm/UsualHoursForm";

// Ports SCREENS['4.20'] (stand-in, no Figma spec — reuses the T1 hour-row
// pattern, per the prototype's own note).
export default async function UsualHoursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const { data: hours } = await supabase.from("farm_hours").select("day_of_week, open_time, close_time, closed").eq("farm_id", farmId).order("day_of_week");

  return <UsualHoursForm farmId={farmId} initialHours={hours ?? []} />;
}
