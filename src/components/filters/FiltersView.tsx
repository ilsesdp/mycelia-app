"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { catBg, catFg } from "@/lib/categoryStyle";
import {
  CATEGORY_OPTIONS,
  DISTANCE_OPTIONS,
  EMPTY_FILTERS,
  buildBrowseQuery,
  matchesBrowseFilters,
  type BrowseEntry,
  type BrowseFilters,
  type Category,
  type Distance,
  type Kind,
} from "@/lib/filters";

const KIND_CARDS: Array<[Kind, string, string]> = [
  ["Farms", "Individual growers you can visit", "/pins/pin-farm-open.svg"],
  ["Markets", "Where several farms gather", "/pins/pin-market-open.svg"],
];

// Ports SCREENS['2.8'] — the Filters sheet, reached from either the list or
// the map view (`from`) and returning to whichever one it came from once
// "Show N results" is tapped, same as the prototype routing to 2.9 or 2.10
// off S.lastMapView. The live result count is computed from `entries`, the
// same lightweight farm+market summary the destination view filters by, so
// the number on the button always matches what tapping it will show.
export function FiltersView({
  initialFilters,
  entries,
  from,
}: {
  initialFilters: BrowseFilters;
  entries: BrowseEntry[];
  from: "list" | "map";
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<BrowseFilters>(initialFilters);

  const resultCount = useMemo(() => entries.filter((e) => matchesBrowseFilters(e, filters)).length, [entries, filters]);
  const closeHref = `${from === "list" ? "/" : "/map"}${buildBrowseQuery(initialFilters)}`;

  function toggleKind(k: Kind) {
    setFilters((f) => ({ ...f, kind: f.kind === k ? null : k }));
  }
  function toggleCategory(c: Category) {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c],
    }));
  }
  function setDistance(d: Distance) {
    setFilters((f) => ({ ...f, distance: d }));
  }
  function toggleReady() {
    setFilters((f) => ({ ...f, readyOnly: !f.readyOnly }));
  }
  function toggleOpen() {
    setFilters((f) => ({ ...f, openOnly: !f.openOnly }));
  }
  function showResults() {
    router.push(`${from === "list" ? "/" : "/map"}${buildBrowseQuery(filters)}`);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar title="Filters" closeHref={closeHref} />
      <div className="flex-1 flex flex-col px-4" style={{ paddingTop: 16, paddingBottom: 24, overflowY: "auto" }}>
        <div className="label-caps">What you&apos;re looking for</div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {KIND_CARDS.map(([k, desc, img]) => {
            const selected = filters.kind === k;
            return (
              <div
                key={k}
                onClick={() => toggleKind(k)}
                style={{
                  background: selected ? "var(--harvest-green-100)" : "#fff",
                  border: `1px solid ${selected ? "var(--text-brand)" : "var(--border-subtle)"}`,
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Image src={img} alt="" width={32} height={32} />
                <div>
                  <div className="body-m-strong">{k}</div>
                  <div className="body-s-medium">{desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 20 }} />
        <div className="label-caps">What they offer</div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: "6px 4px", flexWrap: "wrap" }}>
          {CATEGORY_OPTIONS.map((c) => {
            const selected = filters.categories.includes(c);
            const bg = catBg(c);
            const fg = catFg(c);
            return (
              <span
                key={c}
                onClick={() => toggleCategory(c)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: 14,
                  background: selected ? "var(--interactive-primary)" : bg,
                  color: selected ? "#fff" : fg,
                  border: `1px solid ${selected ? "var(--interactive-primary)" : fg}`,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>

        <div style={{ height: 20 }} />
        <div className="label-caps">How far</div>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {DISTANCE_OPTIONS.map((d) => (
            <button key={d} className={filters.distance === d ? "active" : ""} onClick={() => setDistance(d)}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ height: 20 }} />
        <div className="label-caps">Availability</div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            onClick={toggleReady}
            style={{
              background: filters.readyOnly ? "var(--harvest-green-100)" : "#fff",
              border: `1px solid ${filters.readyOnly ? "var(--text-brand)" : "var(--border-subtle)"}`,
              borderRadius: 16,
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--text-secondary)", display: "flex" }}>
              <Icon name="basket" size={20} />
            </span>
            <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
              Has products ready now
            </span>
          </div>
          <div
            onClick={toggleOpen}
            style={{
              background: filters.openOnly ? "var(--harvest-green-100)" : "#fff",
              border: `1px solid ${filters.openOnly ? "var(--text-brand)" : "var(--border-subtle)"}`,
              borderRadius: 16,
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--text-secondary)", display: "flex" }}>
              <Icon name="clock" size={20} />
            </span>
            <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
              Open right now
            </span>
          </div>
        </div>

        <div style={{ height: 20 }} />
        <button className="btn btn-primary" onClick={showResults}>
          Show {resultCount} results
        </button>
        <div style={{ height: 8 }} />
        <a
          style={{
            display: "block",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            cursor: "pointer",
          }}
          onClick={() => setFilters(EMPTY_FILTERS)}
        >
          Clear all
        </a>
      </div>
    </main>
  );
}
