"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapArt, type MapPin, type OwnFarmMarker } from "./MapArt";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { BottomNav } from "./BottomNav";
import { FarmPinSheet, type FarmSheetData } from "./FarmPinSheet";
import { FiltersEmptyState } from "./FiltersEmptyState";
import { FilterChips } from "./FilterChips";
import { Icon } from "@/components/ui/Icon";
import { pinPosition } from "@/lib/mapPins";
import { activeFilterChips, buildBrowseQuery, type BrowseFilters } from "@/lib/filters";
import { matchesSearch, suggestionMatch } from "@/lib/search";

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
  ownFarm,
}: {
  pins: MapPinInput[];
  filters: BrowseFilters;
  loggedIn: boolean;
  loadError: string | null;
  sheet: FarmSheetData | null;
  ownFarm: OwnFarmMarker | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Keeps the sheet mounted through its slide-down close animation instead
  // of the `sheet` prop (driven by the ?pin= URL param) unmounting it the
  // instant the URL changes. `sheetOpen` is the transform's target state;
  // `displayedSheet` only clears once FarmPinSheet reports the slide-down
  // transition actually finished.
  const [displayedSheet, setDisplayedSheet] = useState<FarmSheetData | null>(sheet);
  const [sheetOpen, setSheetOpen] = useState(!!sheet);

  // Render-time state adjustment (React's documented alternative to an
  // effect for "adjust state when a prop changes"), using state rather than
  // a ref so it's safe to read/write during render: the moment a new sheet
  // arrives, swap it in immediately rather than one tick later via an
  // effect — and never on the way to null, so the previous sheet's content
  // stays mounted and visible through its close animation.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevSheet, setPrevSheet] = useState<FarmSheetData | null>(sheet);

  // The pin currently "selected" — the only one MapArt enlarges, haloes,
  // and labels. Set optimistically the instant a pin is tapped (tapPin,
  // below), not just derived from `sheet`, so the selection shows the same
  // frame as the tap rather than waiting on the subsequent navigation to
  // round-trip; the render-time sync just below then keeps it in step with
  // `sheet` itself (e.g. a ?pin= link opened directly, or the sheet
  // closing).
  const [selectedId, setSelectedId] = useState<string | null>(sheet?.id ?? null);

  if (sheet !== prevSheet) {
    setPrevSheet(sheet);
    if (sheet) setDisplayedSheet(sheet);
    setSelectedId(sheet?.id ?? null);
  }

  useEffect(() => {
    if (!sheet) return;
    // Two rAFs: the first lets the browser paint the off-screen starting
    // position (new mount, or a prior close already mid-transition), the
    // second then flips the target so the transition actually animates
    // instead of the two style changes collapsing into one frame.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setSheetOpen(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [sheet]);

  // The sheet's actual transform/opacity target: closing the moment `sheet`
  // goes null (the URL param cleared) rather than waiting on an effect, so
  // the slide-down/fade-out animates immediately instead of snapping shut.
  const sheetIsOpen = !!sheet && sheetOpen;

  const positioned = useMemo<MapPin[]>(() => pins.map((p) => ({ ...p, ...pinPosition(p.id) })), [pins]);

  const visible = positioned.filter((p) => matchesSearch(p.name, p.productNames, query));

  // Autocomplete: names/products starting with what's typed so far — a
  // narrower, prefix-only match than the "contains anywhere" filter the
  // map itself uses for `visible`, since suggestions are meant to complete
  // what's being typed, not just mention it.
  const q = query.trim().toLowerCase();
  const suggestions = q
    ? positioned
        .map((p) => ({ pin: p, match: suggestionMatch(p.name, p.productNames, q) }))
        .filter((s): s is { pin: MapPin; match: NonNullable<ReturnType<typeof suggestionMatch>> } => s.match !== null)
        .slice(0, 6)
    : [];

  const chips = activeFilterChips(filters);
  const filtered = chips.length > 0;
  const qs = buildBrowseQuery(filters);

  function tapPin(p: MapPin) {
    setSelectedId(p.id);
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
              placeholder="Search farms, markets, or products…"
              className="flex-1 min-w-0 bg-transparent outline-none body-s search-field-input"
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
    // Fixed to the viewport height and non-scrolling, not min-h-screen: the
    // map and every absolutely-positioned child here (search bar, controls,
    // legend) are meant to stay put while you pan/zoom the map art itself,
    // not ride along with a page scroll. min-h-screen (min-height: 100vh)
    // left a few px of rubber-band scroll available on mobile Safari (the
    // 100vh-vs-visual-viewport quirk), which was enough to make the legend
    // bar look like it detached from the map. The other render branch above
    // (filtered-empty-state) keeps min-h-screen on purpose — it has real
    // scrolling content (search bar + empty-state illustration).
    <main className="flex flex-col" style={{ position: "relative", flex: 1, height: "100dvh", overflow: "hidden" }}>
      <MapArt pins={visible} selectedId={selectedId} onPinTap={tapPin} ownFarm={ownFarm} />

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
              placeholder="Search farms, markets, or products…"
              className="flex-1 min-w-0 bg-transparent outline-none body-s search-field-input"
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
              {suggestions.map(({ pin: p, match }, i) => (
                <div
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSuggestOpen(false);
                    setQuery(match.matchedProduct ?? p.name);
                    tapPin(p);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  {match.matchedProduct ? (
                    <>
                      <span className="body-s-strong">{match.matchedProduct}</span>
                      <span className="caption" style={{ marginLeft: 6, color: "var(--text-tertiary)" }}>
                        at {p.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="body-s-strong">{p.name}</span>
                      <span className="caption" style={{ marginLeft: 6, color: "var(--text-tertiary)" }}>
                        {p.kind === "market" ? "Market" : "Farm"}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!displayedSheet && (
          <>
            <div style={{ height: 12 }} />
            <MapControls filterCount={chips.length} view="map" queryString={qs} />
            {filtered && (
              <>
                <div style={{ height: 10 }} />
                <FilterChips chips={chips} basePath="/map" />
              </>
            )}
          </>
        )}
      </div>

      {loadError && (
        <p className="body-s" style={{ position: "absolute", left: 16, right: 16, top: 80, zIndex: 5, color: "var(--text-danger)" }}>
          Couldn&apos;t load the map: {loadError}
        </p>
      )}

      {!displayedSheet && (
        // calc(...) rather than a flat 86px: on a phone with a home-
        // indicator safe area, the fixed BottomNav effectively needs that
        // extra inset below its own 70px, so the legend's clearance has to
        // grow by the same amount or it sits right at — or under — the
        // nav's edge on exactly those devices.
        <div style={{ position: "absolute", left: 16, right: 16, bottom: "calc(86px + env(safe-area-inset-bottom))", zIndex: 4 }}>
          <MapLegend />
        </div>
      )}

      {!displayedSheet && <BottomNav active="Map" loggedIn={loggedIn} />}

      {displayedSheet && (
        <>
          <div
            onClick={closeSheet}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(11,14,12,.6)",
              zIndex: 15,
              opacity: sheetIsOpen ? 1 : 0,
              transition: "opacity 280ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          />
          <FarmPinSheet
            farm={displayedSheet}
            open={sheetIsOpen}
            onCloseTransitionEnd={() => {
              setDisplayedSheet(null);
              setSheetOpen(false);
            }}
          />
        </>
      )}
    </main>
  );
}
