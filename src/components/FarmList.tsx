"use client";

import { useState } from "react";
import Link from "next/link";
import type { Database } from "@/lib/types/database";
import { farmStatus, type HourRow } from "@/lib/farmStatus";
import { MapControls } from "@/components/browse/MapControls";
import { BottomNav } from "@/components/browse/BottomNav";
import { buildBrowseQuery } from "@/lib/queryString";

export type FarmListItem = {
  id: string;
  name: string;
  address: string | null;
  categories: Database["public"]["Enums"]["category_t"][];
  hours: HourRow[];
};

// Matches the tested prototype's matchesSearch(): name only, case-insensitive
// substring — not products, categories or addresses.
function matchesSearch(farm: FarmListItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return farm.name.toLowerCase().includes(q);
}

export default function FarmList({
  farms,
  activeFilters,
  loggedIn,
  loadError,
}: {
  farms: FarmListItem[];
  activeFilters: { categories: string[]; openOnly: boolean };
  loggedIn: boolean;
  loadError: string | null;
}) {
  const [query, setQuery] = useState("");

  const withStatus = farms.map((f) => ({ ...f, status: farmStatus(f.hours) }));
  const visible = withStatus.filter((f) => matchesSearch(f, query) && (!activeFilters.openOnly || f.status.open));

  const chips = [...activeFilters.categories, ...(activeFilters.openOnly ? ["Open now"] : [])];
  const filtered = chips.length > 0;

  return (
    <div className="flex-1 flex flex-col" style={{ paddingBottom: 70 }}>
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        {/* searchBar() port */}
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

        <MapControls
          filterCount={chips.length}
          view="list"
          queryString={buildBrowseQuery(activeFilters.categories, activeFilters.openOnly)}
        />
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-1">
        {loadError && (
          <p className="body-s" style={{ color: "var(--text-danger)" }}>
            Couldn&apos;t load farms: {loadError}
          </p>
        )}

        {filtered && (
          <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {chips.map((c) => (
                <span
                  key={c}
                  style={{
                    background: "var(--interactive-primary)",
                    color: "#fff",
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
              🔍
            </div>
            <p className="body-s">
              {query ? <>No farms or markets match &quot;{query}&quot;</> : "No farms match your filters."}
            </p>
          </div>
        ) : (
          visible.map((farm) => (
            <Link
              key={farm.id}
              href={`/farms/${farm.id}?from=list`}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 no-underline"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex-1">
                <div className="title-m text-text-primary" style={{ fontSize: 18, lineHeight: "24px" }}>
                  {farm.name}
                </div>
                <div className="body-s">{farm.categories.length > 0 ? farm.categories.join(", ") : farm.address}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: farm.status.open ? "var(--border-brand)" : "var(--text-tertiary)" }}
                  />
                  <span className="body-s-strong">{farm.status.label}</span>
                  {farm.status.note && <span className="body-s-medium">&nbsp;{farm.status.note}</span>}
                </div>
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
            </Link>
          ))
        )}
      </div>

      <BottomNav active="Map" loggedIn={loggedIn} />
    </div>
  );
}
