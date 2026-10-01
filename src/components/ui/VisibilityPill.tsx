"use client";

import { useState } from "react";

const OPTIONS = ["Growers only", "Everyone", "Nobody"] as const;
export type Visibility = (typeof OPTIONS)[number];

const ICON: Record<Visibility, string> = { Everyone: "👁", Nobody: "✕", "Growers only": "🔒" };

// Ports visibilityPill() + the tap-to-open option menu from 1.11/5.5 — a
// pill showing the current value, tap opens a small menu listing all three
// options (icon + label + checkmark on the selected one), tap an option or
// outside the menu to close.
export function VisibilityPill({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <span className="visibility-pill" onClick={() => setOpen((o) => !o)}>
        {ICON[value]}
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
                  <span style={{ color: "var(--text-secondary)" }}>{ICON[opt]}</span>
                  <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
                    {opt}
                  </span>
                  {sel && <span style={{ color: "var(--text-brand)" }}>✓</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
