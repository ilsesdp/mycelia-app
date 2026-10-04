"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Ports openDirections() — opens real Google Maps directions in a new tab;
// no address on file yet shows a toast instead of a dead link. `disabled`
// is for the onboarding Preview screen (1.12), where nothing should be
// tappable except "Publish my farm" — this isn't a real farm page yet.
export function DirectionsButton({ address, disabled = false }: { address: string | null; disabled?: boolean }) {
  const [note, setNote] = useState(false);

  function open() {
    if (disabled) return;
    if (!address) {
      setNote(true);
      setTimeout(() => setNote(false), 1800);
      return;
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, "_blank", "noopener");
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-primary"
        style={{ height: 48, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onClick={open}
        disabled={disabled}
      >
        <Icon name="directions" size={18} />
        <span>Get directions</span>
      </button>
      {note && !disabled && (
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
          No address on file yet
        </div>
      )}
    </div>
  );
}
