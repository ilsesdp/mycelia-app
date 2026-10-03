// Shared by every "Add a market" form (onboarding's and My Farm's) so the
// Day/Hours dropdown options — and the parsing from a picked label into
// structured day_of_week/open_time/close_time columns — never drift between
// the two screens. Free-text day/hour strings (the old shape) can't be
// parsed reliably ("every other Saturday", an en-dash instead of "-", etc),
// so both forms now pick from this one fixed set instead.
export const DAY_OPTIONS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];

// One canonical shape everywhere a schedule shows — "9:00am - 1:30pm":
// always h:mm (never a bare "9am"), a space-hyphen-space between start and
// end, lowercase am/pm glued to the number. Matches the real markets'
// schedule_text, normalized in the database to the same format.
export const HOURS_OPTIONS = [
  "7:00am - 12:00pm",
  "7:00am - 1:00pm",
  "8:00am - 1:00pm",
  "8:00am - 2:00pm",
  "9:00am - 1:00pm",
  "9:00am - 2:00pm",
  "9:00am - 3:00pm",
  "10:00am - 2:00pm",
  "10:00am - 3:00pm",
  "12:00pm - 5:00pm",
  "3:00pm - 7:00pm",
];

// day_of_week convention matches farm_hours: 0 = Sunday .. 6 = Saturday.
const DAY_TO_INDEX: Record<string, number> = {
  Sundays: 0,
  Mondays: 1,
  Tuesdays: 2,
  Wednesdays: 3,
  Thursdays: 4,
  Fridays: 5,
  Saturdays: 6,
};

export function dayOfWeekFromLabel(label: string): number | null {
  return label in DAY_TO_INDEX ? DAY_TO_INDEX[label] : null;
}

// "9:00am" -> "09:00:00", "1:30pm" -> "13:30:00". Returns null for anything
// outside the fixed HOURS_OPTIONS shape rather than guessing.
function parseClock(clock: string): string | null {
  const m = clock.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const mer = m[3].toLowerCase();
  if (mer === "pm" && h !== 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}:00`;
}

export function parseHoursRange(range: string): { open_time: string; close_time: string } | null {
  const [start, end] = range.split(" - ");
  if (!start || !end) return null;
  const open_time = parseClock(start);
  const close_time = parseClock(end);
  if (!open_time || !close_time) return null;
  return { open_time, close_time };
}
