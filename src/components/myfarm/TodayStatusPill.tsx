"use client";

import { useEffect, useState } from "react";
import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow } from "@/lib/farmStatus";
import { TodayHoursSheet } from "./TodayHoursSheet";
import type { TodayStatusEnum } from "@/lib/myFarm";

function savedToastText(status: TodayStatusEnum, note: string | null): string {
  if (status === "closed") return "Closed for today";
  if (status === "closed_early") return `Closing at ${note} today`;
  return "Hours updated";
}

// Ports the status-pill-owner button on ownerIdentity() — tappable (opens
// 4.6's Today's hours sheet) everywhere except the public-preview render.
export function TodayStatusPill({
  farmId,
  hours,
  todayStatus,
  todayStatusNote,
  timezone,
  tappable,
}: {
  farmId: string;
  hours: HourRow[];
  todayStatus: TodayStatusEnum | null;
  todayStatusNote: string | null;
  timezone: string;
  tappable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(todayStatus);
  const [note, setNote] = useState(todayStatusNote);
  const [toast, setToast] = useState<string | null>(null);
  const computed = farmTodayStatus(hours, status, timezone);
  const toneColor = STATUS_TONE_COLOR[statusTone(computed)];

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <div className="status-pill-owner" onClick={tappable ? () => setOpen(true) : undefined}>
        <span className="dot" style={{ background: toneColor }} />
        <span className="body-s-strong" style={{ color: toneColor }}>
          {computed.open ? "Open" : "Closed"}
        </span>
        <span className="body-s-medium">{computed.closedEarly ? `until ${note}` : computed.note}</span>
        {tappable && <span style={{ color: "var(--text-tertiary)", fontSize: 14, marginLeft: 2 }}>&#8250;</span>}
      </div>
      {open && (
        <TodayHoursSheet
          farmId={farmId}
          hours={hours}
          initialStatus={status}
          initialNote={note}
          onClose={() => setOpen(false)}
          onSaved={(s, n) => {
            setStatus(s);
            setNote(n);
            setOpen(false);
            setToast(savedToastText(s, n));
          }}
        />
      )}
      {toast && (
        <div className="toast show toast-info" style={{ position: "fixed" }}>
          {toast}
        </div>
      )}
    </>
  );
}
