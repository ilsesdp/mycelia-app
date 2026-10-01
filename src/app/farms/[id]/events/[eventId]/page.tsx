import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { AddToCalendarButton } from "@/components/farm/AddToCalendarButton";

function fmtEventDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function fmtTimeLabel(starts: string | null, ends: string | null): string {
  const fmt = (t: string) => {
    const [hStr, m] = t.split(":");
    let h = parseInt(hStr, 10);
    const mer = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return m === "00" ? `${h}${mer}` : `${h}:${m}${mer}`;
  };
  return [starts, ends].filter(Boolean).map((t) => fmt(t as string)).join(" – ");
}

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

  const [{ data: farm }, { data: event }] = await Promise.all([
    supabase.from("farms").select("name, address").eq("id", id).eq("published", true).maybeSingle(),
    supabase.from("events").select("name, event_date, starts_at, ends_at, notes").eq("id", eventId).eq("farm_id", id).maybeSingle(),
  ]);

  if (!farm || !event) notFound();

  const timeLabel = fmtTimeLabel(event.starts_at, event.ends_at);

  return (
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      <AppBar backHref={`/farms/${id}/events`} />
      <div className="hero" />
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
            {fmtEventDate(event.event_date)}
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
