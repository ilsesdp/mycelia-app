"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { Icon } from "@/components/ui/Icon";
import { TimeField } from "@/components/ui/TimeField";
import { useOnboarding, type DayHours, type TimeRange } from "@/lib/onboarding/context";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Ports SCREENS['1.9'] — first screen of sub-batch 2c. Two quick-setup
// presets rewrite the whole week at once; any per-day edit after that
// switches the mode to "custom", same as the prototype. A day can now hold
// more than one time range (split shifts), so each open day gets its own
// list of ranges with an "Add time range" control instead of one fixed
// open/close pair.
export default function HoursPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  function applyWeekday() {
    const hours: Record<string, DayHours> = { ...state.hours };
    for (const d of DAYS) hours[d] = { ranges: [{ open: "09:00 AM", close: "05:00 PM" }], closed: false };
    hours.Sat = { ...hours.Sat, closed: true };
    hours.Sun = { ...hours.Sun, closed: true };
    update({ hours, hoursMode: "weekday" });
  }

  function setClosed(day: string, closed: boolean) {
    update({ hours: { ...state.hours, [day]: { ...state.hours[day], closed } }, hoursMode: "custom" });
  }

  function setRange(day: string, idx: number, patch: Partial<TimeRange>) {
    const ranges = state.hours[day].ranges.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    update({ hours: { ...state.hours, [day]: { ...state.hours[day], ranges } }, hoursMode: "custom" });
  }

  function addRange(day: string) {
    const ranges = [...state.hours[day].ranges, { open: "09:00 AM", close: "05:00 PM" }];
    update({ hours: { ...state.hours, [day]: { ...state.hours[day], ranges } }, hoursMode: "custom" });
  }

  function removeRange(day: string, idx: number) {
    const ranges = state.hours[day].ranges.filter((_, i) => i !== idx);
    update({ hours: { ...state.hours, [day]: { ...state.hours[day], ranges } }, hoursMode: "custom" });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/products" />
      <div className="px-4 pt-4">
        <StepHeader step={5} title="When are you open?" subtitle="Set your regular hours so growers and customers know when they can reach you" />
        <div className="label-caps">Quick setup</div>
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`qs-card ${state.hoursMode === "weekday" ? "selected" : ""}`} onClick={applyWeekday}>
            <div className="qs-badge">✓</div>
            <div className="qs-icon-well">
              <Icon name="calendar" size={22} />
            </div>
            <div className="body-s-medium" style={{ color: "var(--text-primary)" }}>
              Mon–Fri, 9–5
            </div>
            <div className="caption">Weekdays only</div>
          </button>
          <button className={`qs-card ${state.hoursMode === "custom" ? "selected" : ""}`} onClick={() => update({ hoursMode: "custom" })}>
            <div className="qs-badge">✓</div>
            <div className="qs-icon-well">
              <Icon name="gear" size={22} />
            </div>
            <div className="body-s-medium" style={{ color: "var(--text-primary)" }}>
              Custom
            </div>
            <div className="caption">Set your hours</div>
          </button>
        </div>
        <div style={{ height: 24 }} />
        <div className="label-caps">Your hours</div>
      </div>
      <div>
        {DAYS.map((day) => {
          const h = state.hours[day];
          return (
            <div key={day} className="hour-day-block">
              <div className="hour-day-row">
                <div className="day">{day}</div>
                {h.closed && <span className="closed-label">Closed</span>}
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
      <div className="px-4 pt-5 pb-6">
        <Button variant="primary" onClick={() => router.push("/onboarding/markets")}>
          Continue
        </Button>
        <div style={{ height: 12 }} />
        <Button variant="ghost" onClick={() => router.push("/onboarding/markets")}>
          Skip
        </Button>
      </div>
    </main>
  );
}
