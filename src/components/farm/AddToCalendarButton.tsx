"use client";

import { useState } from "react";
import { getEventOccurrences, type EventDateMode, type EventDateEntry } from "@/lib/myFarm";

type EventForIcs = {
  name: string;
  event_date: string; // "2026-10-20" — the primary/earliest date, any mode
  starts_at: string | null; // "09:00:00"
  ends_at: string | null;
  notes: string | null;
  date_mode: EventDateMode;
  end_date: string | null;
  same_time_for_all_dates: boolean;
  datesList?: EventDateEntry[];
};

function icsStamp(dateStr: string, timeStr: string | null, fallbackHour: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  let hour = fallbackHour;
  let min = 0;
  if (timeStr) {
    const [hStr, mStr] = timeStr.split(":");
    hour = parseInt(hStr, 10);
    min = parseInt(mStr, 10);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(min)}00`;
}

function icsEscape(s: string): string {
  return s.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

// Ports downloadEventIcs() — real .ics generation and download. The
// prototype's version had to route through a Claude-artifact sandbox's
// downloads capability (plain <a download> is blocked there); this is a
// real page in a real browser, so the ordinary blob-URL + anchor click
// works directly.
export function AddToCalendarButton({ event, farmName, farmAddress }: { event: EventForIcs; farmName: string; farmAddress: string | null }) {
  const [note, setNote] = useState(false);

  function download() {
    // Resolves to one occurrence for "single", one per day for "range",
    // one per chosen date for "selected" — each becomes its own VEVENT so
    // every mode exports correctly instead of assuming one date/time pair.
    const occurrences = getEventOccurrences(event);
    const location = icsEscape(farmName + (farmAddress ? ", " + farmAddress : ""));
    const description = icsEscape(event.notes ?? "");
    const stampNow = icsStamp(event.event_date, null, 0);
    const vevents = occurrences.map((occ, i) => {
      const dtStart = icsStamp(occ.date, occ.starts_at, 9);
      const dtEnd = icsStamp(occ.date, occ.ends_at, 11);
      return [
        "BEGIN:VEVENT",
        `UID:${Date.now()}-${i}@mycelia.app`,
        `DTSTAMP:${stampNow}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${icsEscape(event.name)}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
      ].join("\r\n");
    });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mycelia//Event//EN", ...vevents, "END:VCALENDAR"].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.replace(/[^\w\- ]/g, "") || "event"}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNote(true);
    setTimeout(() => setNote(false), 1800);
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-secondary" onClick={download}>
        Add to your calendar
      </button>
      {note && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -36,
            transform: "translateX(-50%)",
            background: "var(--text-primary)",
            color: "var(--text-on-brand)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          Calendar file downloaded
        </div>
      )}
    </div>
  );
}
