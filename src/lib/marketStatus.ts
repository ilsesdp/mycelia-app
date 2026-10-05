import { fmtTime, nowInTimezone } from "@/lib/farmStatus";

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Same 60-minute "closing soon" window as farmStatus.ts.
const CLOSING_SOON_MINUTES = 60;

export type MarketStatusResult = { open: boolean; closingSoon: boolean; label: string; note: string };

// Mirrors farmStatus.ts's open/closing-soon/next-occurrence logic, but for a
// market's single weekly occurrence (one day_of_week/open_time/close_time)
// rather than a full week of farm_hours rows.
export function marketStatus(
  dayOfWeek: number | null,
  openTime: string | null,
  closeTime: string | null,
  timezone: string
): MarketStatusResult {
  if (dayOfWeek == null || !openTime || !closeTime) {
    return { open: false, closingSoon: false, label: "Closed", note: "" };
  }

  const { dayOfWeek: todayIdx, minutes: nowMinutes } = nowInTimezone(timezone);
  const openMin = toMinutes(openTime);
  const closeMin = toMinutes(closeTime);

  if (todayIdx === dayOfWeek) {
    if (nowMinutes >= openMin && nowMinutes < closeMin) {
      const closingSoon = closeMin - nowMinutes <= CLOSING_SOON_MINUTES;
      return { open: true, closingSoon, label: "Open", note: `until ${fmtTime(closeTime)}` };
    }
    if (nowMinutes < openMin) {
      return { open: false, closingSoon: false, label: "Closed", note: `opens today ${fmtTime(openTime)}` };
    }
    // Already past today's window — the next occurrence is a week away.
    return { open: false, closingSoon: false, label: "Closed", note: `opens ${DAY_LABEL[dayOfWeek]} ${fmtTime(openTime)}` };
  }

  let daysUntil = dayOfWeek - todayIdx;
  if (daysUntil <= 0) daysUntil += 7;
  const when = daysUntil === 1 ? "tomorrow" : DAY_LABEL[dayOfWeek];
  return { open: false, closingSoon: false, label: "Closed", note: `opens ${when} ${fmtTime(openTime)}` };
}
