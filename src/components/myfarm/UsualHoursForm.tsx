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

type DayDraft = { open: string; close: string; closed: boolean };

function dbTimeTo12h(t: string | null): string {
  if (!t) return "9:00 AM";
  const [hStr, m] = t.split(":");
  let h = parseInt(hStr, 10);
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${mer}`;
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
    const h = hours.find((x) => x.day_of_week === DOW[day]);
    out[day] = h && !h.closed && h.open_time && h.close_time ? { open: dbTimeTo12h(h.open_time), close: dbTimeTo12h(h.close_time), closed: false } : { open: "9:00 AM", close: "5:00 PM", closed: true };
  }
  return out;
}

// Ports SCREENS['4.20'] — reuses the T1 hour-row editor against the real
// farm_hours table instead of onboarding's in-memory draft.
export function UsualHoursForm({ farmId, initialHours }: { farmId: string; initialHours: HourRow[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [hours, setHours] = useState<Record<string, DayDraft>>(draftFromHours(initialHours));
  const [saving, setSaving] = useState(false);

  function setDay(day: string, patch: Partial<DayDraft>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));
  }

  async function save() {
    setSaving(true);
    const rows = DAYS.map((day) => ({
      farm_id: farmId,
      day_of_week: DOW[day],
      closed: hours[day].closed,
      open_time: hours[day].closed ? null : to24h(hours[day].open),
      close_time: hours[day].closed ? null : to24h(hours[day].close),
    }));
    await supabase.from("farm_hours").upsert(rows, { onConflict: "farm_id,day_of_week" });
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
            <div key={day} className={`hour-row ${h.closed ? "closed-row" : ""}`}>
              <div className="day">{day}</div>
              {h.closed ? (
                <span className="closed-label">Closed</span>
              ) : (
                <div className="times">
                  <TimeField value={h.open} onChange={(v) => setDay(day, { open: v })} />
                  <span className="to-label">to</span>
                  <TimeField value={h.close} onChange={(v) => setDay(day, { close: v })} />
                </div>
              )}
              <div className={`toggle ${h.closed ? "" : "on"}`} onClick={() => setDay(day, { closed: !h.closed })}>
                <div className="track" />
              </div>
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
