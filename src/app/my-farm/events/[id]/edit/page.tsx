import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type EventRow } from "@/lib/myFarm";
import { EventForm } from "@/components/myfarm/EventForm";

// Ports SCREENS['4.16'] in edit mode, opened from the owner's event detail
// view (/my-farm/events/[id]) via its edit/pencil icon — `backTo` carries
// whether that detail view was reached from the dashboard or Manage events,
// so Save/Delete return to the right list.
export default async function EditEventPage({ params, searchParams }: PageProps<"/my-farm/events/[id]/edit">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const [{ data: event }, { data: eventPhotos }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, name, event_date, starts_at, ends_at, notes, photo_url, date_mode, end_date, all_day, same_time_for_all_dates, datesList:event_dates(id, event_date, starts_at, ends_at)"
      )
      .eq("id", id)
      .eq("farm_id", farmId)
      .maybeSingle(),
    supabase.from("event_photos").select("id, url").eq("event_id", id).order("sort_order"),
  ]);
  if (!event) notFound();

  return (
    <EventForm
      farmId={farmId}
      event={event as EventRow}
      photos={eventPhotos ?? []}
      backTo={typeof sp.backTo === "string" ? sp.backTo : "events"}
    />
  );
}
