"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapArt, type MapPin } from "./MapArt";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { BottomNav } from "./BottomNav";
import { FarmPinSheet, type FarmSheetData } from "./FarmPinSheet";
import { FiltersEmptyState } from "./FiltersEmptyState";
import { Icon } from "@/components/ui/Icon";
import { pinPosition } from "@/lib/mapPins";
import { activeFilterChips, buildBrowseQuery, type BrowseFilters } from "@/lib/filters";

export type MapPinInput = Omit<MapPin, "xPct" | "yPct">;

// Ports SCREENS['2.1'] ("Browse — map") and SCREENS['2.10'] ("Filters map
// view") as one route — same split as the list view's 2.7/2.9: with no
// active filters it's 2.1, arriving with cat/open params makes it 2.10.
// Tapping a farm pin layers SCREENS['2.2']'s bottom sheet on top (dimming
// the map, same as the prototype) instead of navigating away.
export function MapView({
  pins,
  filters,
  loggedIn,
  loadError,
  sheet,
  ownFarmName,
}: {
  pins: MapPinInput[];
  filters: BrowseFilters;
  loggedIn: boolean;
  loadError: string | null;
  sheet: FarmSheetData | null;
  ownFarmName: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const positioned = useMemo<MapPin[]>(() => pins.map((p) => ({ ...p, ...pinPosition(p.id) })), [pins]);

  const visible = positioned.filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q);
  });

  // Autocomplete: names starting with what's typed so far — a narrower,
  // prefix-only match than the "contains anywhere" filter the map itself
  // uses for `visible`, since suggestions are meant to complete what's
  // being typed, not just mention it.
  const q = query.trim().toLowerCase();
  const suggestions = q ? positioned.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 6) : [];

  const chips = activeFilterChips(filters);
  const filtered = chips.length > 0;
  const qs = buildBrowseQuery(filters);

  function tapPin(p: MapPin) {
    if (p.kind === "market") {
      router.push(`/markets/${p.id}?from=map`);
      return;
    }
    const sheetParams = new URLSearchParams(qs.replace(/^\?/, ""));
    sheetParams.set("pin", p.id);
    router.push(`/map?${sheetParams.toString()}`);
  }

  function closeSheet() {
    router.push(`/map${qs}`);
  }

  // Ports the prototype's go('2.12') redirect: when the active filters
  // alone leave nothing to show, this renders the same dedicated empty
  // screen the list view falls back to, rather than an empty map.
  if (filtered && positioned.length === 0 && !sheet) {
    return (
      <main className="flex flex-col min-h-screen">
        <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
          <div
            className="flex items-center gap-2 h-12 rounded-lg px-3"
            style={{ border: "1px solid var(--border-default)", background: "var(--bg-canvas)" }}
          >
            <span style={{ color: "var(--text-tertiary)", display: "flex" }}>
              <Icon name="search" size={18} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a farm or market…"
              className="flex-1 min-w-0 bg-transparent outline-none body-s"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <MapControls filterCount={chips.length} view="map" queryString={qs} />
        </div>
        <FiltersEmptyState chips={chips} view="map" />
        <BottomNav active="Map" loggedIn={loggedIn} />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ position: "relative", flex: 1 }}>
      <MapArt pins={visible} onPinTap={tapPin} ownFarmName={ownFarmName} />

      <div style={{ position: "absolute", left: 16, right: 16, top: 16, zIndex: 5 }}>
        {/* searchBar() port — identical markup to the list view's */}
        <div style={{ position: "relative" }}>
          <div
            className="flex items-center gap-2 h-12 rounded-lg px-3"
            style={{ border: "1px solid var(--border-default)", background: "var(--bg-canvas)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-tertiary)" }}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
              placeholder="Search a farm or market…"
              className="flex-1 min-w-0 bg-transparent outline-none body-s"
              style={{ color: "var(--text-primary)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" style={{ color: "var(--text-tertiary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {suggestOpen && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "calc(100% + 6px)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(0,0,0,.18)",
                overflow: "hidden",
                zIndex: 6,
              }}
            >
              {suggestions.map((p, i) => (
                <div
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSuggestOpen(false);
                    setQuery(p.name);
                    tapPin(p);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  <span className="body-s-strong">{p.name}</span>
                  <span className="caption" style={{ marginLeft: 6, color: "var(--text-tertiary)" }}>
                    {p.kind === "market" ? "Market" : "Farm"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!sheet && (
          <>
            <div style={{ height: 12 }} />
            <MapControls filterCount={chips.length} view="map" queryString={qs} />
          </>
        )}
      </div>

      {loadError && (
        <p className="body-s" style={{ position: "absolute", left: 16, right: 16, top: 80, zIndex: 5, color: "var(--text-danger)" }}>
          Couldn&apos;t load the map: {loadError}
        </p>
      )}

      {!sheet && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 86, zIndex: 4 }}>
          <MapLegend />
        </div>
      )}

      {!sheet && <BottomNav active="Map" loggedIn={loggedIn} />}

      {sheet && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(11,14,12,.6)", zIndex: 15 }} onClick={closeSheet} />
          <FarmPinSheet farm={sheet} />
        </>
      )}
    </main>
  );
}
