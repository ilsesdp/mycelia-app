"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

const OPTIONS = ["Growers only", "Only me"] as const;
export type Visibility = (typeof OPTIONS)[number];

const ICON: Record<Visibility, IconName> = { "Growers only": "lock", "Only me": "close" };

// Ports visibilityPill() + the tap-to-open option menu from 1.11/5.5 — a
// pill showing the current value, tap opens a small menu listing the
// options. "Everyone" has been retired as a choice: contact info is either
// shared with other growers or kept private to the farm owner. Uses the
// app's icon set instead of emoji, and skips the prototype's
// checkmark-on-selected (the highlighted row background already marks the
// current value).
export function VisibilityPill({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <span className="visibility-pill" onClick={() => setOpen((o) => !o)}>
        <Icon name={ICON[value]} size={16} />
        <span>{value}</span>
        <span>⌄</span>
      </span>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,.18)",
              overflow: "hidden",
              width: 190,
              zIndex: 61,
            }}
          >
            {OPTIONS.map((opt, i) => {
              const sel = opt === value;
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  style={{
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    borderBottom: i < OPTIONS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    background: sel ? "var(--harvest-green-100)" : "transparent",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)", display: "flex" }}>
                    <Icon name={ICON[opt]} size={16} />
                  </span>
                  <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
