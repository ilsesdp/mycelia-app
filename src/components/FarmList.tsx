"use client";

import { useState } from "react";
import Link from "next/link";
import type { Database } from "@/lib/types/database";
import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow, type TodayStatus } from "@/lib/farmStatus";
import { marketStatus } from "@/lib/marketStatus";
import { MapControls } from "@/components/browse/MapControls";
import { BottomNav } from "@/components/browse/BottomNav";
import { FiltersEmptyState } from "@/components/browse/FiltersEmptyState";
import { Icon } from "@/components/ui/Icon";
import { activeFilterChips, buildBrowseQuery, matchesBrowseFilters, type BrowseFilters } from "@/lib/filters";

export type FarmListItem = {
  id: string;
  name: string;
  address: string | null;
  categories: Database["public"]["Enums"]["category_t"][];
  hours: HourRow[];
  todayStatus: TodayStatus;
  hasReadyProduct: boolean;
};

export type MarketListItem = {
  id: string;
  name: string;
  location: string | null;
  schedule_text: string | null;
  day_of_week: number | null;
  open_time: string | null;
  close_time: string | null;
};

type Status = { open: boolean; label: string; note: string };

type Row = {
  kind: "farm" | "market";
  id: string;
  name: string;
  meta: string;
  categories: string[];
  status: Status;
  hasReadyProduct: boolean;
};

// Matches the tested prototype's matchesSearch(): name only, case-insensitive
// substring — not products, categories or addresses.
function matchesSearch(name: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q);
}

export default function FarmList({
  farms,
  markets,
  filters,
  loggedIn,
  loadError,
}: {
  farms: FarmListItem[];
  markets: MarketListItem[];
  filters: BrowseFilters;
  loggedIn: boolean;
  loadError: string | null;
}) {
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const rows: Row[] = [
    ...farms.map((f) => {
      const status = farmTodayStatus(f.hours, f.todayStatus);
      return {
        kind: "farm" as const,
        id: f.id,
        name: f.name,
        meta: f.categories.length > 0 ? f.categories.join(", ") : f.address ?? "",
        categories: f.categories,
        status,
        hasReadyProduct: f.hasReadyProduct,
      };
    }),
    ...markets.map((m) => ({
      kind: "market" as const,
      id: m.id,
      name: m.name,
      // Location plus the market's own day/hours — same reason a farm's
      // meta line shows its categories: the next line down is where the
      // live open/closed status (computed from these columns) appears.
      meta: [m.location, m.schedule_text].filter(Boolean).join(" · "),
      categories: [] as string[],
      status: marketStatus(m.day_of_week, m.open_time, m.close_time),
      hasReadyProduct: false,
    })),
  ];

  const byFilters = rows.filter((r) => matchesBrowseFilters({ ...r, open: r.status.open }, filters));
  const visible = byFilters.filter((r) => matchesSearch(r.name, query));

  // Autocomplete: names starting with what's typed so far, within whatever
  // filters are already active — narrower than matchesSearch's "contains
  // anywhere", since suggestions complete what's being typed.
  const q = query.trim().toLowerCase();
  const suggestions = q ? byFilters.filter((r) => r.name.toLowerCase().startsWith(q)).slice(0, 6) : [];

  const chips = activeFilterChips(filters);
  const filtered = chips.length > 0;

  return (
    <div className="flex-1 flex flex-col" style={{ paddingBottom: 70 }}>
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        {/* searchBar() port */}
        <div style={{ position: "relative" }}>
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
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
              placeholder="Search a farm or market…"
              className="flex-1 min-w-0 bg-transparent outline-none body-s search-field-input"
              style={{ color: "var(--text-primary)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" style={{ color: "var(--text-tertiary)" }}>
                <Icon name="close" size={16} />
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
              {suggestions.map((r, i) => (
                <div
                  key={r.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSuggestOpen(false);
                    setQuery(r.name);
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}
                >
                  <span className="body-s-strong">{r.name}</span>
                  <span className="caption" style={{ marginLeft: 6, color: "var(--text-tertiary)" }}>
                    {r.kind === "market" ? "Market" : "Farm"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <MapControls filterCount={chips.length} view="list" queryString={buildBrowseQuery(filters)} />
      </div>

      {loadError && (
        <p className="body-s px-4" style={{ color: "var(--text-danger)" }}>
          Couldn&apos;t load farms: {loadError}
        </p>
      )}

      {byFilters.length === 0 && filtered ? (
        <FiltersEmptyState chips={chips} view="list" />
      ) : (
        <div className="flex-1 px-4 pb-6 flex flex-col gap-1">
          {filtered && (
            <>
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
              <div style={{ height: 10 }} />
            </>
          )}

          <p className="body-s">
            {query
              ? `${visible.length} result${visible.length === 1 ? "" : "s"} for "${query}"`
              : filtered
                ? `${visible.length} farm${visible.length === 1 ? "" : "s"} match your filters`
                : `${visible.length} farm${visible.length === 1 ? "" : "s"} near you`}
          </p>
          <div style={{ height: 10 }} />

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: "1.5px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <Icon name="search" size={20} />
              </div>
              <p className="body-s">No farms or markets match &quot;{query}&quot;</p>
            </div>
          ) : (
            visible.map((row) => (
              <Link
                key={`${row.kind}-${row.id}`}
                href={row.kind === "market" ? `/markets/${row.id}?from=list` : `/farms/${row.id}?from=list`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 no-underline"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex-1">
                  <div className="title-m text-text-primary" style={{ fontSize: 18, lineHeight: "24px" }}>
                    {row.name}
                  </div>
                  <div className="body-s">{row.meta}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_TONE_COLOR[statusTone(row.status)] }} />
                    <span className="body-s-strong" style={{ color: STATUS_TONE_COLOR[statusTone(row.status)] }}>
                      {row.status.label}
                    </span>
                    {row.status.note && <span className="body-s-medium">&nbsp;{row.status.note}</span>}
                  </div>
                </div>
                <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
              </Link>
            ))
          )}
        </div>
      )}

      <BottomNav active="Map" loggedIn={loggedIn} />
    </div>
  );
}
