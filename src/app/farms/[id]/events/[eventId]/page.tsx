import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { AddToCalendarButton } from "@/components/farm/AddToCalendarButton";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { fmtEventDateLabel, fmtEventTimeLabel, type EventRow } from "@/lib/myFarm";

// Ports SCREENS['2.13'] — event detail, always reached from the farm's
// Events tab (2.5) in this build, so the back arrow always returns there
// (the prototype's S.eventDetailBackTo exists for other entry points this
// app doesn't have yet).
export default async function EventDetailPage({ params }: PageProps<"/farms/[id]/events/[eventId]">) {
  const { id, eventId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: farm }, { data: eventRaw }, { data: eventPhotos }] = await Promise.all([
    supabase.from("farms").select("name, address").eq("id", id).eq("published", true).maybeSingle(),
    supabase
      .from("events")
      .select(
        "name, event_date, starts_at, ends_at, notes, date_mode, end_date, all_day, same_time_for_all_dates, datesList:event_dates(id, event_date, starts_at, ends_at)"
      )
      .eq("id", eventId)
      .eq("farm_id", id)
      .maybeSingle(),
    supabase.from("event_photos").select("id, url").eq("event_id", eventId).order("sort_order"),
  ]);

  if (!farm || !eventRaw) notFound();
  const event = eventRaw as unknown as EventRow;

  const timeLabel = fmtEventTimeLabel(event);

  return (
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      <AppBar backHref={`/farms/${id}/events`} />
      <PhotoCarousel photos={eventPhotos ?? []} />
      <div className="px-4" style={{ flex: 1 }}>
        <div style={{ height: 16 }} />
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          {event.name}
        </div>
        <div style={{ height: 4 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
          <Icon name="pin" size={20} />
          {farm.name} · {farm.address}
        </div>
        <div style={{ height: 4 }} />
        <div className="statuschip" style={{ padding: "0 12px" }}>
          <span className="dot" />
          <span className="body-s-strong" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            {fmtEventDateLabel(event)}
            {timeLabel ? ` · ${timeLabel}` : ""}
          </span>
        </div>
        <div style={{ height: 12 }} />
        {event.notes && <p className="body-s">{event.notes}</p>}
        <div style={{ height: 20 }} />
        <DirectionsButton address={farm.address} />
        <div style={{ height: 24 }} />
        <AddToCalendarButton event={event} farmName={farm.name} farmAddress={farm.address} />
      </div>
      <BottomNav active="Map" loggedIn={!!user} />
    </main>
  );
}
