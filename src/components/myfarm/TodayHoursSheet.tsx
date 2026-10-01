"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { fmtTime, type HourRow } from "@/lib/farmStatus";
import type { TodayStatusEnum } from "@/lib/myFarm";

const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function RadioOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="var(--interactive-primary)" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="5" fill="var(--interactive-primary)" />
    </svg>
  );
}
function RadioOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.25" stroke="var(--border-strong, var(--border-default))" strokeWidth="1.5" />
    </svg>
  );
}
function RadioRow({ label, detail, selected, chevron, onClick }: { label: string; detail: string; selected: boolean; chevron?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: "var(--radius-lg)",
        cursor: "pointer",
        background: selected ? "var(--harvest-green-100)" : "var(--bg-canvas)",
        border: selected ? "1.5px solid var(--interactive-primary)" : "1px solid var(--border-default)",
      }}
    >
      {selected ? <RadioOn /> : <RadioOff />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="body-m-strong" style={{ lineHeight: "24px" }}>
          {label}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "var(--text-secondary)" }}>{detail}</div>
      </div>
      {chevron && <span style={{ color: "var(--text-tertiary)", fontSize: 20, flexShrink: 0 }}>&#8250;</span>}
    </div>
  );
}

// Ports 4.6 (Today's hours) + 4.7 (Close early) as one stateful sheet —
// 4.7 is a drill-in from 4.6 in the prototype, not a separate route, so a
// `view` toggle stands in for that screen-to-screen nav. Save writes the
// farm's real today_status/today_status_note columns (farmStatus.ts already
// reads these for the map pin and status chip everywhere).
export function TodayHoursSheet({
  farmId,
  hours,
  initialStatus,
  initialNote,
  onClose,
  onSaved,
}: {
  farmId: string;
  hours: HourRow[];
  initialStatus: TodayStatusEnum | null;
  initialNote: string | null;
  onClose: () => void;
  onSaved: (status: TodayStatusEnum, note: string | null) => void;
}) {
  const supabase = createClient();
  const router = useRouter();
  const todayIdx = new Date().getDay();
  const todays = hours.find((h) => h.day_of_week === todayIdx);
  const usualClose = todays && !todays.closed && todays.close_time ? fmtTime(todays.close_time) : "5pm";
  const usualDetail =
    todays && !todays.closed && todays.open_time && todays.close_time ? `${fmtTime(todays.open_time)} – ${fmtTime(todays.close_time)}` : "Closed";

  const [view, setView] = useState<"hours" | "closeEarly">("hours");
  const [status, setStatus] = useState<TodayStatusEnum>(initialStatus ?? "open");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [meridiem, setMeridiem] = useState<"am" | "pm">("pm");
  const [saving, setSaving] = useState(false);

  function closingLabel() {
    if (!hour) return "1pm";
    return minute ? `${hour}:${minute.padStart(2, "0")}${meridiem}` : `${hour}${meridiem}`;
  }

  async function save(nextStatus: TodayStatusEnum, note: string | null) {
    setSaving(true);
    await supabase.from("farms").update({ today_status: nextStatus, today_status_note: note }).eq("id", farmId);
    setSaving(false);
    router.refresh();
    onSaved(nextStatus, note);
  }

  if (view === "closeEarly") {
    return (
      <>
        <div className="sheet-scrim" onClick={onClose} />
        <div className="sheet-panel">
          <div className="sheet-grabber" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", flex: 1, minWidth: 0 }} onClick={() => setView("hours")}>
              <span style={{ fontSize: 18, lineHeight: 1, color: "var(--text-primary)" }}>&lsaquo;</span>
              <span className="title-s" style={{ color: "var(--text-primary)" }}>
                Close early
              </span>
            </div>
            <span className="sheet-close" style={{ position: "static" }} onClick={onClose}>
              &times;
            </span>
          </div>
          <div style={{ height: 24 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "var(--harvest-green-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
              }}
            >
              <Icon name="clock" size={32} />
            </div>
            <div style={{ height: 16 }} />
            <div className="title-m" style={{ color: "var(--text-primary)", textAlign: "center" }}>
              Set your closing time
            </div>
            <div style={{ height: 6 }} />
            <p className="body-m" style={{ textAlign: "center", margin: 0 }}>
              Your usual closing time is {usualClose}.
            </p>
          </div>
          <div style={{ height: 26 }} />
          <div className="label-caps" style={{ textAlign: "center" }}>
            Closing at
          </div>
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <input
              className="field short"
              style={{ width: 64, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.2px", color: "var(--text-primary)" }}
              placeholder="01"
              value={hour}
              inputMode="numeric"
              maxLength={2}
              onChange={(e) => setHour(e.target.value.replace(/\D/g, ""))}
            />
            <span className="title-m" style={{ color: "var(--text-secondary)" }}>
              :
            </span>
            <input
              className="field short"
              style={{ width: 64, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.2px", color: "var(--text-primary)" }}
              placeholder="00"
              value={minute}
              inputMode="numeric"
              maxLength={2}
              onChange={(e) => setMinute(e.target.value.replace(/\D/g, ""))}
            />
            <div className="field short" style={{ width: "auto", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setMeridiem((m) => (m === "pm" ? "am" : "pm"))}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.2px", color: "var(--text-primary)" }}>{meridiem}</span>
              <span style={{ color: "var(--text-tertiary)" }}>&#8964;</span>
            </div>
          </div>
          <div style={{ height: 34 }} />
          <button className="btn btn-primary" disabled={saving} onClick={() => save("closed_early", closingLabel())}>
            Save
          </button>
          <div style={{ height: 8 }} />
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-grabber" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="title-m" style={{ color: "var(--text-primary)" }}>
            Today&apos;s hours
          </span>
          <span className="sheet-close" style={{ position: "static" }} onClick={onClose}>
            &times;
          </span>
        </div>
        <div style={{ height: 16 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--radius-lg)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="calendar" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="body-m-strong" style={{ lineHeight: "24px" }}>
              {DAY_FULL[todayIdx]}, {new Date().getDate()} {new Date().toLocaleString("en-US", { month: "long" })}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "var(--text-secondary)" }}>Changes apply to today only</div>
          </div>
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <span style={{ color: "var(--text-tertiary)" }}>
            <Icon name="clock" size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="body-s-strong">Usual hours</div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "var(--text-secondary)" }}>
              {usualDetail} &middot; Every {DAY_FULL[todayIdx]}
            </div>
          </div>
          <button
            style={{ flexShrink: 0, background: "var(--bg-canvas)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--interactive-primary)", cursor: "pointer" }}
            onClick={() => {
              onClose();
              router.push("/my-farm/hours");
            }}
          >
            Edit
          </button>
        </div>
        <div style={{ height: 22 }} />
        <div className="label-caps">Choose today&apos;s status</div>
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <RadioRow label="Open as usual" detail={usualDetail} selected={status === "open"} onClick={() => setStatus("open")} />
          <RadioRow
            label="Close early"
            detail={status === "closed_early" ? `Closing at ${initialNote || closingLabel()}` : "Set a closing time"}
            selected={status === "closed_early"}
            chevron
            onClick={() => setView("closeEarly")}
          />
          <RadioRow label="Closed today" detail="Shown as closed until tomorrow" selected={status === "closed"} onClick={() => setStatus("closed")} />
        </div>
        <div style={{ height: 14 }} />
        <div style={{ background: "var(--info-bg)", border: "1px solid var(--info-border)", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 8 }}>
          <span style={{ flexShrink: 0, color: "var(--info-fg)" }}>
            <Icon name="info" size={20} />
          </span>
          <span className="body-s" style={{ color: "var(--info-fg)" }}>
            This is for today only. Tomorrow you go back to your usual hours.
          </span>
        </div>
        <div style={{ height: 18 }} />
        <button className="btn btn-primary" disabled={saving} onClick={() => save(status, status === "closed_early" ? initialNote : null)}>
          Save for today
        </button>
        <div style={{ height: 8 }} />
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </>
  );
}
