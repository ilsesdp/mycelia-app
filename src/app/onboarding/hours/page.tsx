"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { Icon } from "@/components/ui/Icon";
import { TimeField } from "@/components/ui/TimeField";
import { useOnboarding, type DayHours } from "@/lib/onboarding/context";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Ports SCREENS['1.9'] — first screen of sub-batch 2c. Three quick-setup
// presets rewrite the whole week at once; any per-day edit after that
// switches the mode to "custom", same as the prototype.
export default function HoursPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  function applyWeekday() {
    const hours: Record<string, DayHours> = { ...state.hours };
    for (const d of DAYS) hours[d] = { open: "09:00 AM", close: "05:00 PM", closed: false };
    hours.Sat = { ...hours.Sat, closed: true };
    hours.Sun = { ...hours.Sun, closed: true };
    update({ hours, hoursMode: "weekday" });
  }

  function apply247() {
    const hours: Record<string, DayHours> = {};
    for (const d of DAYS) hours[d] = { open: "12:00 AM", close: "11:59 PM", closed: false };
    update({ hours, hoursMode: "24-7" });
  }

  function setDay(day: string, patch: Partial<DayHours>) {
    update({ hours: { ...state.hours, [day]: { ...state.hours[day], ...patch } }, hoursMode: "custom" });
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
          <button className={`qs-card ${state.hoursMode === "24-7" ? "selected" : ""}`} onClick={apply247}>
            <div className="qs-badge">✓</div>
            <div className="qs-icon-well">
              <Icon name="clock" size={22} />
            </div>
            <div className="body-s-medium" style={{ color: "var(--text-primary)" }}>
              Open 24/7
            </div>
            <div className="caption">Every day, all day</div>
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
