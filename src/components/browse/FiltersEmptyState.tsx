"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// Ports SCREENS['2.12'] — reached (in the prototype) only by tapping "Show
// 0 results" on the Filters screen, but shown here any time the active
// filters alone (not a search) leave nothing to show, on whichever view
// (list or map) the visitor is on — matching the prototype's own choice to
// land on this screen rather than an empty map or an empty list, since
// either one would look broken with zero results.
export function FiltersEmptyState({ chips, view }: { chips: string[]; view: "list" | "map" }) {
  const router = useRouter();

  function clearAll() {
    router.push(view === "list" ? "/" : "/map");
  }

  return (
    <div className="flex-1 flex flex-col px-4" style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {chips.map((c) => (
          <span
            key={c}
            style={{
              background: "var(--interactive-primary)",
              color: "var(--text-on-brand)",
              padding: "8px 12px",
              borderRadius: 999,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div style={{ height: 60 }} />
      <div className="flex flex-col items-center gap-3" style={{ padding: "24px 16px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            border: "1.5px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
          }}
        >
          <Icon name="search" size={24} />
        </div>
        <div className="title-m" style={{ textAlign: "center" }}>
          No farms match
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary" onClick={clearAll}>
        Clear all filters
      </button>
    </div>
  );
}
