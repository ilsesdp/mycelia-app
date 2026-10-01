import { fmtTime, type HourRow } from "@/lib/farmStatus";

const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Display order is Monday-first (matches the prototype's DAY_ORDER); the
// stored day_of_week is JS getDay() (0=Sun..6=Sat), same as farmStatus.ts.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Ports hoursBox().
export function HoursBox({ hours }: { hours: HourRow[] }) {
  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "0 12px" }}>
      {DISPLAY_ORDER.map((dow, i) => {
        const h = hours.find((x) => x.day_of_week === dow);
        const closed = !h || h.closed || !h.open_time || !h.close_time;
        return (
          <div
            key={dow}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: i < DISPLAY_ORDER.length - 1 ? "1px solid var(--border-subtle)" : undefined,
            }}
          >
            <span className="body-m" style={{ color: "var(--text-primary)" }}>
              {DAY_FULL[dow]}
            </span>
            <span className="body-m">{closed ? "Closed" : `${fmtTime(h.open_time!)} – ${fmtTime(h.close_time!)}`}</span>
          </div>
        );
      })}
    </div>
  );
}
