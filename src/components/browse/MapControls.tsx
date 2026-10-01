"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Ports mapControls() + viewMenuOverlay() from 1.7/2.7/2.9. The hamburger
// opens a small overlay offering Map view / List view — Map view (2.1)
// isn't built yet, so picking it shows an inline note instead of a dead
// link. The filter button carries the active-filter badge count (from the
// URL params 2.9 arrives with); Filters itself (2.8) is the next group, so
// it currently just surfaces that.
export function MapControls({ filterCount }: { filterCount: number }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function flash(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(null), 1800);
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: "var(--bg-raised)",
            boxShadow: "0 2px 5px rgba(0,0,0,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-primary)",
          }}
        >
          ☰
        </div>
        <div
          onClick={() => flash("Filters are coming soon")}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: "var(--bg-raised)",
            boxShadow: "0 2px 5px rgba(0,0,0,.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            color: "var(--text-primary)",
          }}
        >
          ⚙
          {filterCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 20,
                height: 20,
                borderRadius: 999,
                background: "var(--interactive-primary)",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "0 4px",
              }}
            >
              {filterCount}
            </span>
          )}
        </div>
      </div>

      {note && (
        <div
          style={{
            position: "absolute",
            top: 52,
            right: 0,
            background: "var(--text-primary)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            whiteSpace: "nowrap",
            zIndex: 72,
          }}
        >
          {note}
        </div>
      )}

      {menuOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(11,14,12,.6)", zIndex: 70 }} onClick={() => setMenuOpen(false)} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 52,
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,.16)",
              overflow: "hidden",
              width: 220,
              padding: "4px 8px 8px",
              zIndex: 71,
            }}
          >
            <div className="label-caps" style={{ padding: "4px 0 8px 12px" }}>
              VIEW
            </div>
            <div
              onClick={() => {
                setMenuOpen(false);
                flash("Map view is coming soon");
              }}
              style={{ padding: 12, borderRadius: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span style={{ width: 20, textAlign: "center", color: "var(--text-secondary)" }}>🗺</span>
              <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
                Map view
              </span>
            </div>
            <div
              onClick={() => {
                setMenuOpen(false);
                router.push("/");
              }}
              style={{ padding: 12, borderRadius: 8, background: "var(--harvest-green-100)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            >
              <span style={{ width: 20, textAlign: "center", color: "var(--text-secondary)" }}>☰</span>
              <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
                List view
              </span>
              <span style={{ color: "var(--text-brand)" }}>✓</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
