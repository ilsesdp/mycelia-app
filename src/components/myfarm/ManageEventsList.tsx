"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { fmtEventDateLabel, fmtEventTimeLabel, type EventRow } from "@/lib/myFarm";

// Ports SCREENS['4.21'] plus an edit-mode bulk delete, mirroring
// ManageMarketsList: the top-right icon swaps each row's ">" chevron for a
// checkbox, and checking one or more shows a "Delete" bar at the bottom
// instead of "+ Add an event". Deleting an event cascades to its
// event_photos/event_dates rows (confirmed FK ON DELETE CASCADE), so no
// extra cleanup is needed here.
export function ManageEventsList({ events }: { events: EventRow[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitEditing() {
    setEditing(false);
    setSelected(new Set());
  }

  async function deleteSelected() {
    if (!selected.size || deleting) return;
    setDeleting(true);
    await supabase.from("events").delete().in("id", Array.from(selected));
    setDeleting(false);
    exitEditing();
    router.refresh();
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar
        backHref={editing ? undefined : "/my-farm/events"}
        backLabel="Events"
        title="Manage events"
        right={
          events.length > 0 ? (
            <button
              onClick={() => (editing ? exitEditing() : setEditing(true))}
              style={{
                width: 84,
                display: "flex",
                justifyContent: "flex-end",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
              aria-label={editing ? "Cancel" : "Edit events"}
            >
              {editing ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>Cancel</span> : <Icon name="pencil" size={20} />}
            </button>
          ) : undefined
        }
      />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        {events.length === 0 ? (
          <p className="body-m" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px 0" }}>
            No events yet.
          </p>
        ) : (
          events.map((ev, i) => {
            const isSelected = selected.has(ev.id);
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
            const row = (
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)",
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: "var(--bg-canvas)",
                }}
              >
                {thumb}
                <div style={{ flex: 1 }}>
                  <div className="body-m-strong">{ev.name || "Untitled event"}</div>
                  <div className="body-s-medium">{dateLabel}</div>
                  {timeLabel && <div className="body-s-medium">{timeLabel}</div>}
                </div>
                {editing ? (
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      border: `1.5px solid ${isSelected ? "transparent" : "var(--border-strong)"}`,
                      background: isSelected ? "var(--interactive-primary)" : "transparent",
                      color: "var(--text-on-brand)",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>&#8250;</span>
                )}
              </div>
            );
            return (
              <div key={ev.id}>
                {i > 0 && <div style={{ height: 8 }} />}
                {editing ? (
                  <div role="checkbox" aria-checked={isSelected} tabIndex={0} onClick={() => toggle(ev.id)} style={{ cursor: "pointer" }}>
                    {row}
                  </div>
                ) : (
                  <Link href={`/my-farm/events/${ev.id}?backTo=manage`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                    {row}
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
      <div style={{ padding: "12px 24px 24px" }}>
        {editing ? (
          <button className="btn btn-danger" disabled={!selected.size || deleting} onClick={deleteSelected}>
            {deleting ? "Deleting…" : selected.size ? `Delete ${selected.size} event${selected.size > 1 ? "s" : ""}` : "Select events to delete"}
          </button>
        ) : (
          <Link href="/my-farm/events/new?backTo=manage" className="btn btn-primary">
            + Add an event
          </Link>
        )}
      </div>
    </main>
  );
}
