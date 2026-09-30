"use client";

import { useState } from "react";
import Link from "next/link";
import type { Database } from "@/lib/types/database";

type TodayStatus = Database["public"]["Enums"]["today_status_t"] | null;

export type FarmListItem = {
  id: string;
  name: string;
  address: string | null;
  categories: Database["public"]["Enums"]["category_t"][];
  todayStatus: TodayStatus;
  todayStatusNote: string | null;
};

// Matches the tested prototype's matchesSearch(): name only, case-insensitive
// substring — not products, categories or addresses.
function matchesSearch(farm: FarmListItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return farm.name.toLowerCase().includes(q);
}

function statusLine(farm: FarmListItem) {
  const isOpen = farm.todayStatus === "open";
  const label = isOpen ? "Open" : farm.todayStatus === "closed_early" ? "Closed early" : "Closed";
  return { isOpen, label, note: farm.todayStatusNote };
}

export default function FarmList({ farms }: { farms: FarmListItem[] }) {
  const [query, setQuery] = useState("");
  const visible = farms.filter((f) => matchesSearch(f, query));

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 pb-3 flex flex-col gap-3">
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
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <p className="body-s">
          {query
            ? `${visible.length} result${visible.length === 1 ? "" : "s"} for "${query}"`
            : `${farms.length} farm${farms.length === 1 ? "" : "s"} near you`}
        </p>
      </div>

      <div className="flex-1 px-4 pb-24 flex flex-col gap-1">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="body-s">No farms or markets match &quot;{query}&quot;</p>
          </div>
        ) : (
          visible.map((farm) => {
            const status = statusLine(farm);
            return (
              <Link
                key={farm.id}
                href={`/farms/${farm.id}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 no-underline"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex-1">
                  <div className="title-m text-text-primary" style={{ fontSize: 18, lineHeight: "24px" }}>
                    {farm.name}
                  </div>
                  <div className="body-s">
                    {farm.categories.length > 0 ? farm.categories.join(", ") : farm.address}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: status.isOpen ? "var(--border-brand)" : "var(--text-tertiary)" }}
                    />
                    <span className="body-s-strong">{status.label}</span>
                    {status.note && <span className="body-s-medium">{status.note}</span>}
                  </div>
                </div>
                <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
