const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type HourRow = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

export function fmtTime(t: string): string {
  // "17:00:00" -> "5pm", "09:30:00" -> "9:30am"
  const [hStr, m] = t.split(":");
  let h = parseInt(hStr, 10);
  const mer = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === "00" ? `${h}${mer}` : `${h}:${m}${mer}`;
}

// Ports the prototype's per-card status line ("Open · until 6pm" /
// "Closed · opens Sat 8am") from real farm_hours rows instead of the
// prototype's hardcoded per-entry strings.
export function farmStatus(hours: HourRow[]): { open: boolean; label: string; note: string } {
  if (!hours.length) return { open: false, label: "Closed", note: "" };
  const now = new Date();
  const todayIdx = now.getDay();
  const today = hours.find((h) => h.day_of_week === todayIdx);

  if (today && !today.closed && today.close_time) {
    return { open: true, label: "Open", note: `until ${fmtTime(today.close_time)}` };
  }

  // Closed (today marked closed, or no row for today) — find the next open day.
  for (let i = 1; i <= 7; i++) {
    const idx = (todayIdx + i) % 7;
    const h = hours.find((x) => x.day_of_week === idx);
    if (h && !h.closed && h.open_time) {
      const when = i === 1 ? "tomorrow" : DAY_LABEL[idx];
      return { open: false, label: "Closed", note: `opens ${when} ${fmtTime(h.open_time)}` };
    }
  }
  return { open: false, label: "Closed", note: "" };
}

export type TodayStatus = "open" | "closed_early" | "closed" | null;

// Layers the owner's manual "close early / closed today" override (My Farm
// tools, not built yet — farms.today_status) on top of the regular weekly
// schedule. Shared by the map (pin color) and the farm profile (status
// chip) so the two never drift.
export function farmTodayStatus(hours: HourRow[], todayStatus: TodayStatus) {
  const hoursStatus = farmStatus(hours);
  const closedEarly = todayStatus === "closed_early";
  const overrideClosed = todayStatus === "closed" || closedEarly;
  return {
    ...(overrideClosed ? { ...hoursStatus, open: false } : hoursStatus),
    closedEarly,
  };
}
