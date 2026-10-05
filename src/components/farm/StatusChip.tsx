"use client";

import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow, type TodayStatus } from "@/lib/farmStatus";

// Computes farmTodayStatus() here, client-side, rather than once on the
// server in farmProfile.ts's getFarmHeader() — a Server Component's
// new Date() is the server's clock (UTC on Vercel), not the farm's or the
// visitor's. A client component's render runs in the visitor's own
// browser, so "now" is at least a real local clock, even though it isn't
// necessarily the farm's own timezone (there's no stored per-farm
// timezone — see MapPin's comment in components/browse/MapArt.tsx).
export function StatusChip({ hours, todayStatus }: { hours: HourRow[]; todayStatus: TodayStatus }) {
  const status = farmTodayStatus(hours, todayStatus);
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
