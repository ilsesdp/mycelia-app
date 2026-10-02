import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFarmHeader, resolveBackHref } from "@/lib/farmProfile";
import { FarmProfileShell } from "@/components/farm/FarmProfileShell";

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

// Ports SCREENS['2.5'] — the farm profile's Events tab. Shows the next
// upcoming event (event_date >= today) and the farm's real selected
// markets (farm_markets), replacing the prototype's single hardcoded
// "Stephenson County Market" row.
export default async function FarmEventsPage({ params, searchParams }: PageProps<"/farms/[id]/events">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [farm, { data: events }, { data: farmMarkets }] = await Promise.all([
    getFarmHeader(supabase, id),
    supabase
      .from("events")
      .select("id, name, event_date, starts_at, ends_at")
      .eq("farm_id", id)
      .gte("event_date", today)
      .order("event_date")
      .limit(1),
    supabase.from("farm_markets").select("markets ( id, name, location, schedule_text )").eq("farm_id", id),
  ]);

  if (!farm) notFound();

  const event = events?.[0] ?? null;
  const markets = (farmMarkets ?? []).map((row) => row.markets).filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <FarmProfileShell farm={farm} activeTab="Events" backHref={resolveBackHref(sp.from)} loggedIn={!!user}>
      <div className="label-caps">Upcoming events</div>
      <div style={{ height: 4 }} />
      {event ? (
        <Link
          href={`/farms/${farm.id}/events/${event.id}`}
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: 16,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--bg-subtle)", border: "1px dashed var(--border-subtle)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="body-m-strong">{event.name}</div>
            <div className="body-s-medium">{fmtEventDate(event.event_date)}</div>
            {(event.starts_at || event.ends_at) && <div className="body-s-medium">{fmtTimeLabel(event.starts_at, event.ends_at)}</div>}
          </div>
          <span>&#8250;</span>
        </Link>
      ) : (
        <p className="body-m" style={{ color: "var(--text-tertiary)" }}>
          No upcoming events listed.
        </p>
      )}

      <div style={{ height: 20 }} />
      <div className="label-caps">Also find us at</div>
      <div style={{ height: 8 }} />
      {markets.length === 0 ? (
        <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
          Not listed at any markets yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {markets.map((m) => (
            <Link
              key={m.id}
              href={`/markets/${m.id}`}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "12px 16px",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <Image src="/icons/icon-market.svg" alt="" width={32} height={32} />
              <div style={{ flex: 1 }}>
                <div className="title-m" style={{ fontSize: 18, lineHeight: "24px", color: "var(--text-primary)" }}>
                  {m.name}
                </div>
                {m.location && <div className="body-s">{m.location}</div>}
                {m.schedule_text && <div className="body-s">{m.schedule_text}</div>}
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
            </Link>
          ))}
        </div>
      )}
    </FarmProfileShell>
  );
}
