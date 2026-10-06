import { fmtTime, type HourRow } from "@/lib/farmStatus";

const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Display order is Monday-first (matches the prototype's DAY_ORDER); the
// stored day_of_week is JS getDay() (0=Sun..6=Sat), same as farmStatus.ts.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type TimeRange = { open_time: string; close_time: string };
type Group = { days: number[]; closed: boolean; ranges: TimeRange[] };

// A day's sorted list of open ranges (empty = closed), used both to key
// identical days together and to render each day's stacked range lines.
function dayRanges(hours: HourRow[], dow: number): TimeRange[] {
  return hours
    .filter((h) => h.day_of_week === dow && !h.closed && h.open_time && h.close_time)
    .sort((a, b) => a.open_time!.localeCompare(b.open_time!))
    .map((h) => ({ open_time: h.open_time!, close_time: h.close_time! }));
}

function scheduleKey(ranges: TimeRange[]): string {
  if (!ranges.length) return "closed";
  return ranges.map((r) => `${r.open_time}-${r.close_time}`).join(",");
}

// Collapses consecutive days that share the exact same set of time ranges
// (or are all closed) into one row — "Mon – Fri · 9am – 6pm" reads the way
// a person would actually say their hours, instead of repeating the same
// range seven times. A day with split-shift ranges (e.g. 9–12 and 3–7)
// still collapses with another day that has the identical pair.
function groupHours(hours: HourRow[]): Group[] {
  const groups: Group[] = [];
  let lastKey: string | null = null;
  for (const dow of DISPLAY_ORDER) {
    const ranges = dayRanges(hours, dow);
    const key = scheduleKey(ranges);
    if (lastKey === key && groups.length) {
      groups[groups.length - 1].days.push(dow);
    } else {
      groups.push({ days: [dow], closed: key === "closed", ranges });
    }
    lastKey = key;
  }
  return groups;
}

// Ports hoursBox(). Each group's value can now stack more than one line —
// a day with split-shift ranges shows each range on its own line. Uses
// fmtTime()'s lowercase "9am"/"5:30pm" format to match every other screen
// that shows a time (status chips, TodayHoursSheet).
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
              alignItems: "flex-start",
              padding: "12px 0",
              borderBottom: i < groups.length - 1 ? "1px solid var(--border-subtle)" : undefined,
            }}
          >
            <span className="body-m-strong" style={{ color: "var(--text-brand)" }}>
              {label}
            </span>
            {g.closed ? (
              <span className="body-m" style={{ color: "var(--text-secondary)" }}>
                Closed
              </span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                {g.ranges.map((r, ri) => (
                  <span key={ri} className="body-m" style={{ color: "var(--text-secondary)" }}>
                    {fmtTime(r.open_time)} – {fmtTime(r.close_time)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
