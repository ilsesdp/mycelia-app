"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { buildBrowseQuery, EMPTY_FILTERS, type FilterChip } from "@/lib/filters";

// Active-filter pill row — same green pill + × per chip, plus a trailing
// "Clear all" text link, on both the list view (FarmList) and the map view
// (MapView), so the two browse views share one look instead of the map
// previously showing no active-filter chips at all. Each × removes just
// that one filter (chip.cleared, from activeFilterChips); "Clear all"
// drops every filter and returns to the plain unfiltered view/map.
export function FilterChips({ chips, basePath }: { chips: FilterChip[]; basePath: "/" | "/map" }) {
  const router = useRouter();
  if (!chips.length) return null;

  function go(cleared: (typeof chips)[number]["cleared"]) {
    router.push(`${basePath}${buildBrowseQuery(cleared)}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
        {chips.map((c) => (
          <span
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "var(--interactive-primary)",
              color: "var(--text-on-brand)",
              padding: "6px 6px 6px 12px",
              borderRadius: 999,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {c.label}
            <button
              type="button"
              onClick={() => go(c.cleared)}
              aria-label={`Remove ${c.label} filter`}
              style={{ display: "flex", color: "var(--text-on-brand)", padding: 4 }}
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
      </div>
      {/* Pinned to the right of the chip row, same line — not wrapped in
          with the chips — and in the brand green (not the link blue) so
          it reads as the row's primary action. */}
      <button
        type="button"
        onClick={() => go(EMPTY_FILTERS)}
        className="body-s-strong"
        style={{ color: "var(--interactive-primary)", padding: "6px 4px", flexShrink: 0, whiteSpace: "nowrap" }}
      >
        Clear all
      </button>
    </div>
  );
}
