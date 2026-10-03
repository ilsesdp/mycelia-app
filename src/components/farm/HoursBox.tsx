import { fmtTime, type HourRow } from "@/lib/farmStatus";

const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Display order is Monday-first (matches the prototype's DAY_ORDER); the
// stored day_of_week is JS getDay() (0=Sun..6=Sat), same as farmStatus.ts.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type Group = { days: number[]; closed: boolean; open_time: string | null; close_time: string | null };

function scheduleKey(h: HourRow | undefined): string {
  if (!h || h.closed || !h.open_time || !h.close_time) return "closed";
  return `${h.open_time}-${h.close_time}`;
}

// Collapses consecutive days that share the exact same open/close time (or
// are all closed) into one row — "Mon – Fri · 9am – 6pm" reads the way a
// person would actually say their hours, instead of repeating the same
// range seven times.
function groupHours(hours: HourRow[]): Group[] {
  const groups: Group[] = [];
  let lastKey: string | null = null;
  for (const dow of DISPLAY_ORDER) {
    const h = hours.find((x) => x.day_of_week === dow);
    const key = scheduleKey(h);
    if (lastKey === key && groups.length) {
      groups[groups.length - 1].days.push(dow);
    } else {
      groups.push({ days: [dow], closed: key === "closed", open_time: h?.open_time ?? null, close_time: h?.close_time ?? null });
    }
    lastKey = key;
  }
  return groups;
}

// Ports hoursBox().
export function HoursBox({ hours }: { hours: HourRow[] }) {
  const groups = groupHours(hours);
  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "0 12px" }}>
      {groups.map((g, i) => {
        const first = g.days[0];
        const last = g.days[g.days.length - 1];
        const label = g.days.length === 1 ? DAY_FULL[first] : `${DAY_ABBR[first]} – ${DAY_ABBR[last]}`;
        return (
          <div
            key={first}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: i < groups.length - 1 ? "1px solid var(--border-subtle)" : undefined,
            }}
          >
            <span className="body-m-strong" style={{ color: "var(--text-brand)" }}>
              {label}
            </span>
            <span className="body-m" style={{ color: "var(--text-secondary)" }}>
              {g.closed ? "Closed" : `${fmtTime(g.open_time!)} – ${fmtTime(g.close_time!)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
