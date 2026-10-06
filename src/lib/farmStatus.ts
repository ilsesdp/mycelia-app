const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export type HourRow = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

// The real fix for the map-pin/status-chip timezone bug: farms.timezone and
// markets.timezone (IANA names, e.g. "America/Chicago") now store each
// farm/market's own timezone, so "today" and "now" can be computed exactly
// for that farm — not approximated from the server's UTC clock or a
// visitor's local clock (see the now-removed comments this replaces in
// StatusChip.tsx/MapArt.tsx/map/page.tsx). Intl.DateTimeFormat with an
// explicit `timeZone` works the same in the browser and in Node, so this is
// safe to call from either a Server Component or a client component.
export function nowInTimezone(timeZone: string, at: Date = new Date()): { dayOfWeek: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);

  let weekday = "";
  let hour = 0;
  let minute = 0;
  for (const part of parts) {
    if (part.type === "weekday") weekday = part.value;
    else if (part.type === "hour") hour = parseInt(part.value, 10);
    else if (part.type === "minute") minute = parseInt(part.value, 10);
  }
  if (hour === 24) hour = 0; // hour12:false can format midnight as "24"

  return { dayOfWeek: WEEKDAY_INDEX[weekday] ?? at.getDay(), minutes: hour * 60 + minute };
}

// "YYYY-MM-DD" for the given timezone's current date — used only to compare
// against today_status_date (see farmTodayStatus below), never to display.
export function todayDateInTimezone(timezone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

export function fmtTime(t: string): string {
  // "17:00:00" -> "5pm", "09:30:00" -> "9:30am"
  const [hStr, m] = t.split(":");
  let h = parseInt(hStr, 10);
  const mer = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === "00" ? `${h}${mer}` : `${h}:${m}${mer}`;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Inside this many minutes of close_time, a farm is still open but the
// status dot/label should read as "closing soon" (amber) rather than plain
// "Open" (green) — a cue that there's a window closing, not just a flat
// on/off.
const CLOSING_SOON_MINUTES = 60;

// Ports the prototype's per-card status line ("Open · until 6pm" /
// "Closed · opens Sat 8am") from real farm_hours rows instead of the
// prototype's hardcoded per-entry strings.
export function farmStatus(
  hours: HourRow[],
  timezone: string
): { open: boolean; closingSoon: boolean; label: string; note: string } {
  if (!hours.length) return { open: false, closingSoon: false, label: "Closed", note: "" };
  const { dayOfWeek: todayIdx, minutes: nowMinutes } = nowInTimezone(timezone);

  // A day can now have more than one row (split shifts, e.g. 9am–12pm and
  // 3pm–7pm), so today's open ranges are gathered and sorted instead of
  // assuming a single row per day.
  const todaysRanges = hours
    .filter((h) => h.day_of_week === todayIdx && !h.closed && h.open_time && h.close_time)
    .map((h) => ({ openMin: toMinutes(h.open_time!), closeMin: toMinutes(h.close_time!), open_time: h.open_time!, close_time: h.close_time! }))
    .sort((a, b) => a.openMin - b.openMin);

  // "Today has hours and isn't marked closed" used to be enough to say
  // "Open until <close>" — it never actually checked the clock, so a farm
  // stayed "Open" long after its own close_time had passed. Compare against
  // the current time before calling it open, and check every range (not
  // just the first) so a gap between two ranges on the same day reads as
  // "opens today <next range>" rather than skipping straight to tomorrow.
  for (const r of todaysRanges) {
    if (nowMinutes >= r.openMin && nowMinutes < r.closeMin) {
      const closingSoon = r.closeMin - nowMinutes <= CLOSING_SOON_MINUTES;
      return { open: true, closingSoon, label: "Open", note: `until ${fmtTime(r.close_time)}` };
    }
  }
  const nextRangeToday = todaysRanges.find((r) => nowMinutes < r.openMin);
  if (nextRangeToday) {
    return { open: false, closingSoon: false, label: "Closed", note: `opens today ${fmtTime(nextRangeToday.open_time)}` };
  }

  // Closed (today marked closed, no rows for today, or already past every
  // range today) — find the next open day.
  for (let i = 1; i <= 7; i++) {
    const idx = (todayIdx + i) % 7;
    const dayRanges = hours.filter((h) => h.day_of_week === idx && !h.closed && h.open_time).sort((a, b) => a.open_time!.localeCompare(b.open_time!));
    if (dayRanges.length) {
      const when = i === 1 ? "tomorrow" : DAY_LABEL[idx];
      return { open: false, closingSoon: false, label: "Closed", note: `opens ${when} ${fmtTime(dayRanges[0].open_time!)}` };
    }
  }
  return { open: false, closingSoon: false, label: "Closed", note: "" };
}

export type TodayStatus = "open" | "closed_early" | "closed" | null;

// Layers the owner's manual "close early / closed today" override
// (farms.today_status) on top of the regular weekly schedule. Shared by the
// map (pin color) and the farm profile (status chip) so the two never
// drift.
//
// The override only applies when todayStatusDate matches the farm's own
// "today" (computed in its own timezone) — it's a date-stamped override,
// not a sticky flag, so a farm an owner marked "closed today" doesn't stay
// stuck closed on every day after. todayStatusDate is optional only for
// older call sites mid-migration; treat a missing date as "no date on
// record" (the override never applies) rather than assuming it's current.
export function farmTodayStatus(hours: HourRow[], todayStatus: TodayStatus, timezone: string, todayStatusDate?: string | null) {
  const hoursStatus = farmStatus(hours, timezone);
  const current = !!todayStatusDate && todayStatusDate === todayDateInTimezone(timezone);
  const closedEarly = current && todayStatus === "closed_early";
  const overrideClosed = current && (todayStatus === "closed" || closedEarly);
  return {
    ...(overrideClosed ? { ...hoursStatus, open: false, closingSoon: false } : hoursStatus),
    closedEarly,
  };
}

// Single source of truth for the status dot/label color everywhere a
// farm's open/closed state is shown (statuschip, status-row,
// status-pill-owner) — green while open, amber once within
// CLOSING_SOON_MINUTES of close, red once closed, so the dot always
// matches the word next to it.
export type StatusTone = "open" | "closing-soon" | "closed";

export function statusTone(status: { open: boolean; closingSoon?: boolean }): StatusTone {
  if (!status.open) return "closed";
  return status.closingSoon ? "closing-soon" : "open";
}

export const STATUS_TONE_COLOR: Record<StatusTone, string> = {
  open: "var(--interactive-primary-hover)",
  "closing-soon": "var(--text-warning)",
  closed: "var(--text-danger)",
};
