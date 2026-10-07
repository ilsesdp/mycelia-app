import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type EventRow } from "@/lib/myFarm";
import { ManageEventsList } from "@/components/myfarm/ManageEventsList";

// Ports SCREENS['4.21'] (stand-in — no Figma spec).
export default async function ManageEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, starts_at, ends_at, notes, photo_url, date_mode, end_date, all_day, same_time_for_all_dates, datesList:event_dates(id, event_date, starts_at, ends_at)")
    .eq("farm_id", farmId)
    .order("event_date");

  return <ManageEventsList events={(events ?? []) as EventRow[]} />;
}
