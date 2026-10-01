"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Ports openDirections() — opens real Google Maps directions in a new tab;
// no address on file yet shows a toast instead of a dead link.
export function DirectionsButton({ address }: { address: string | null }) {
  const [note, setNote] = useState(false);

  function open() {
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
        className="btn btn-secondary"
        style={{ height: 48, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onClick={open}
      >
        <Icon name="directions" size={18} />
        <span>Get directions</span>
      </button>
      {note && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -36,
            transform: "translateX(-50%)",
            background: "var(--text-primary)",
            color: "#fff",
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
