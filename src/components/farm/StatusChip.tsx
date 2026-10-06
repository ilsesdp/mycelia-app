"use client";

import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow, type TodayStatus } from "@/lib/farmStatus";

// Client-side only so the sheet/chip updates live without a refetch; the
// farm's own stored timezone (farms.timezone) makes this exact wherever
// it runs, server or client.
export function StatusChip({
  hours,
  todayStatus,
  todayStatusDate,
  timezone,
}: {
  hours: HourRow[];
  todayStatus: TodayStatus;
  todayStatusDate: string | null;
  timezone: string;
}) {
  const status = farmTodayStatus(hours, todayStatus, timezone, todayStatusDate);
  return (
    <div className="statuschip">
      <span className="dot" style={{ background: STATUS_TONE_COLOR[statusTone(status)] }} />
      <span className="txt" style={{ color: "var(--text-secondary)" }}>
        <span style={{ color: STATUS_TONE_COLOR[statusTone(status)] }}>{status.label}</span>{" "}
        <span className="dim">{status.note}</span>
      </span>
    </div>
  );
}
