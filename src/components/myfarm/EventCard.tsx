import Link from "next/link";
import { fmtEventDateLabel, fmtEventTimeLabel, type EventRow } from "@/lib/myFarm";

// Ports eventCard() — owner-facing dashboard card (4.9's featured event).
// Tapping it opens the event's own detail view, not the edit form straight
// away — Manage events (4.21) now has its own bulk-select list and no
// longer renders this card, so it always links with backTo=events.
export function EventCard({ ev }: { ev: EventRow }) {
  const dateLabel = fmtEventDateLabel(ev);
  const timeLabel = fmtEventTimeLabel(ev);
  const thumb = ev.photo_url ? (
    <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ev.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  ) : (
    <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)", border: "1px dashed var(--border-subtle)", flexShrink: 0 }} />
  );
  return (
    <Link href={`/my-farm/events/${ev.id}?backTo=events`}>
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: "var(--bg-canvas)",
          cursor: "pointer",
        }}
      >
        {thumb}
        <div style={{ flex: 1 }}>
          <div className="body-m-strong">{ev.name || "Untitled event"}</div>
          <div className="body-s-medium">{dateLabel}</div>
          {timeLabel && <div className="body-s-medium">{timeLabel}</div>}
        </div>
        <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
      </div>
    </Link>
  );
}
