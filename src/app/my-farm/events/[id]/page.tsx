import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, fmtEventDateLabel, fmtEventTimeLabel, type EventRow } from "@/lib/myFarm";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { AddToCalendarButton } from "@/components/farm/AddToCalendarButton";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";

// Owner-facing event detail view — what tapping the event the owner created
// now opens (from the 4.9 dashboard card or the 4.21 Manage list), instead
// of dropping straight into the edit form. Mirrors the public event detail
// (farms/[id]/events/[eventId]) but has no `published` gate — an owner can
// view/manage events before their farm goes live — and its pencil icon in
// the AppBar is the only way into the edit form now (edit/page.tsx).
export default async function MyFarmEventDetailPage({ params, searchParams }: PageProps<"/my-farm/events/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const backTo = typeof sp.backTo === "string" ? sp.backTo : "events";

  const [{ data: farm }, { data: eventRaw }, { data: eventPhotos }] = await Promise.all([
    supabase.from("farms").select("name, address").eq("id", farmId).maybeSingle(),
    supabase
      .from("events")
      .select(
        "name, event_date, starts_at, ends_at, notes, date_mode, end_date, all_day, same_time_for_all_dates, datesList:event_dates(id, event_date, starts_at, ends_at)"
      )
      .eq("id", id)
      .eq("farm_id", farmId)
      .maybeSingle(),
    supabase.from("event_photos").select("id, url").eq("event_id", id).order("sort_order"),
  ]);

  if (!farm || !eventRaw) notFound();
  const event = eventRaw as unknown as EventRow;

  const timeLabel = fmtEventTimeLabel(event);
  const backHref = `/my-farm/events${backTo === "manage" ? "/manage" : ""}`;

  return (
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      <AppBar
        backHref={backHref}
        backLabel={backTo === "manage" ? "Manage" : "Events"}
        right={
          <Link
            href={`/my-farm/events/${id}/edit?backTo=${backTo}`}
            style={{ width: 84, display: "flex", justifyContent: "flex-end", color: "var(--text-primary)" }}
            aria-label="Edit event"
          >
            <Icon name="pencil" size={20} />
          </Link>
        }
      />
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
      <BottomNav active="Profile" loggedIn />
    </main>
  );
}
