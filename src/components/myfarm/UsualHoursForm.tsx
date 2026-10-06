"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { TimeField } from "@/components/ui/TimeField";
import { createClient } from "@/lib/supabase/client";
import type { HourRow } from "@/lib/farmStatus";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// day_of_week is JS getDay() (0=Sun..6=Sat), Monday-first display order
// matches the prototype's DAY_ORDER / onboarding's hours screen.
const DOW: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

type TimeRange = { open: string; close: string };
// A day can now hold more than one range (split shifts) — closed:true
// means the whole day is closed and ranges is ignored.
type DayDraft = { ranges: TimeRange[]; closed: boolean };

function dbTimeTo12h(t: string | null): string {
  if (!t) return "9:00am";
  const [hStr, m] = t.split(":");
  let h = parseInt(hStr, 10);
  const mer = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m}${mer}`;
}
function to24h(t: string): string | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mer = m[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}:00`;
}

function draftFromHours(hours: HourRow[]): Record<string, DayDraft> {
  const out: Record<string, DayDraft> = {};
  for (const day of DAYS) {
    const rows = hours.filter((x) => x.day_of_week === DOW[day] && !x.closed && x.open_time && x.close_time).sort((a, b) => a.open_time!.localeCompare(b.open_time!));
    out[day] = rows.length
      ? { ranges: rows.map((r) => ({ open: dbTimeTo12h(r.open_time), close: dbTimeTo12h(r.close_time) })), closed: false }
      : { ranges: [{ open: "9:00am", close: "5:00pm" }], closed: true };
  }
  return out;
}

// Ports SCREENS['4.20'] — reuses the T1 hour-row editor against the real
// farm_hours table instead of onboarding's in-memory draft. A day can now
// hold more than one time range (split shifts), matching the onboarding
// hours step.
export function UsualHoursForm({ farmId, initialHours }: { farmId: string; initialHours: HourRow[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [hours, setHours] = useState<Record<string, DayDraft>>(draftFromHours(initialHours));
  const [saving, setSaving] = useState(false);

  function setClosed(day: string, closed: boolean) {
    setHours((h) => ({ ...h, [day]: { ...h[day], closed } }));
  }
  function setRange(day: string, idx: number, patch: Partial<TimeRange>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ranges: h[day].ranges.map((r, i) => (i === idx ? { ...r, ...patch } : r)) } }));
  }
  function addRange(day: string) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ranges: [...h[day].ranges, { open: "9:00am", close: "5:00pm" }] } }));
  }
  function removeRange(day: string, idx: number) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ranges: h[day].ranges.filter((_, i) => i !== idx) } }));
  }

  async function save() {
    setSaving(true);
    const rows: { farm_id: string; day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean }[] = [];
    for (const day of DAYS) {
      const d = hours[day];
      if (d.closed) {
        rows.push({ farm_id: farmId, day_of_week: DOW[day], open_time: null, close_time: null, closed: true });
      } else {
        for (const r of d.ranges) {
          rows.push({ farm_id: farmId, day_of_week: DOW[day], open_time: to24h(r.open), close_time: to24h(r.close), closed: false });
        }
      }
    }
    // A day can now have more than one row, so the old single-row-per-day
    // upsert (onConflict: "farm_id,day_of_week") no longer applies —
    // replace the whole week's rows instead.
    await supabase.from("farm_hours").delete().eq("farm_id", farmId);
    if (rows.length) await supabase.from("farm_hours").insert(rows);
    setSaving(false);
    // Without this, the chip/map status (fetched fresh via router.push's
    // target segment) update, but any already-visited page in this
    // session's Router Cache — most commonly /my-farm/about's Hours box —
    // keeps serving its stale RSC payload until something invalidates it.
    router.refresh();
    router.push("/my-farm");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/my-farm" title="Usual hours" />
      <div>
        {DAYS.map((day) => {
          const h = hours[day];
          return (
            <div key={day} className="hour-day-block">
              <div className="hour-day-row">
                <div className="hour-day-left">
                  <div className="day">{day}</div>
                  {h.closed && <span className="hour-day-closed-label">Closed</span>}
                </div>
                <div className={`toggle ${h.closed ? "" : "on"}`} onClick={() => setClosed(day, !h.closed)}>
                  <div className="track" />
                </div>
              </div>
              {!h.closed && (
                <div className="hour-ranges">
                  {h.ranges.map((r, i) => (
                    <div key={i} className="hour-range-row">
                      <div className="times">
                        <TimeField value={r.open} onChange={(v) => setRange(day, i, { open: v })} />
                        <span className="to-label">to</span>
                        <TimeField value={r.close} onChange={(v) => setRange(day, i, { close: v })} />
                      </div>
                      {h.ranges.length > 1 && (
                        <span className="range-remove" onClick={() => removeRange(day, i)}>
                          ✕
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="add-range-link" onClick={() => addRange(day)}>
                    + Add time range
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save usual hours"}
        </button>
      </div>
    </main>
  );
}
