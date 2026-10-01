"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapArt, type MapPin } from "./MapArt";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { BottomNav } from "./BottomNav";
import { FarmPinSheet, type FarmSheetData } from "./FarmPinSheet";
import { pinPosition } from "@/lib/mapPins";
import { buildBrowseQuery } from "@/lib/queryString";

export type MapPinInput = Omit<MapPin, "xPct" | "yPct">;

// Ports SCREENS['2.1'] ("Browse — map") and SCREENS['2.10'] ("Filters map
// view") as one route — same split as the list view's 2.7/2.9: with no
// active filters it's 2.1, arriving with cat/open params makes it 2.10.
// Tapping a farm pin layers SCREENS['2.2']'s bottom sheet on top (dimming
// the map, same as the prototype) instead of navigating away.
export function MapView({
  pins,
  activeFilters,
  loggedIn,
  loadError,
  sheet,
}: {
  pins: MapPinInput[];
  activeFilters: { categories: string[]; openOnly: boolean };
  loggedIn: boolean;
  loadError: string | null;
  sheet: FarmSheetData | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const positioned = useMemo<MapPin[]>(() => pins.map((p) => ({ ...p, ...pinPosition(p.id) })), [pins]);

  const visible = positioned.filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q);
  });

  const chips = [...activeFilters.categories, ...(activeFilters.openOnly ? ["Open now"] : [])];
  const qs = buildBrowseQuery(activeFilters.categories, activeFilters.openOnly);

  function tapPin(p: MapPin) {
    if (p.kind === "market") {
      router.push(`/markets/${p.id}`);
      return;
    }
    const sheetParams = new URLSearchParams(qs.replace(/^\?/, ""));
    sheetParams.set("pin", p.id);
    router.push(`/map?${sheetParams.toString()}`);
  }

  function closeSheet() {
    router.push(`/map${qs}`);
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ position: "relative", flex: 1 }}>
      <MapArt pins={visible} onPinTap={tapPin} />

      <div style={{ position: "absolute", left: 16, right: 16, top: 16, zIndex: 5 }}>
        {/* searchBar() port — identical markup to the list view's */}
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
