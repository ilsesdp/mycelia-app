"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { FilterChip } from "@/lib/filters";

// Ports SCREENS['2.12'] — reached (in the prototype) only by tapping "Show
// 0 results" on the Filters screen, but shown here any time the active
// filters alone (not a search) leave nothing to show, on whichever view
// (list or map) the visitor is on — matching the prototype's own choice to
// land on this screen rather than an empty map or an empty list, since
// either one would look broken with zero results.
//
// `chips` isn't rendered here anymore — both FarmList and MapView already
// render the removable FilterChips row right above wherever this component
// shows up, so repeating the chips here (as a second, non-removable copy)
// was a duplicate. Kept in the prop signature since callers still pass it
// and `view` still needs to live beside it.
export function FiltersEmptyState({ view }: { chips: FilterChip[]; view: "list" | "map" }) {
  const router = useRouter();

  function clearAll() {
    router.push(view === "list" ? "/" : "/map");
  }

  return (
    <div className="flex-1 flex flex-col px-4" style={{ paddingBottom: 24 }}>
      <div style={{ height: 24 }} />
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
