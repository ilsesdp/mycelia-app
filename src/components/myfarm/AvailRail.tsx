"use client";

import { useState } from "react";
import Link from "next/link";
import { productRailLabel, type ProductRow } from "@/lib/myFarm";

type Kind = "ready" | "producing" | "planning";
type FilterKey = "all" | Kind;

const KIND_LABEL: Record<Kind, string> = {
  ready: "Ready now",
  producing: "Producing",
  planning: "Planning",
};
const KIND_CLASS: Record<Kind, string> = {
  ready: "avail-ready",
  producing: "avail-producing",
  planning: "avail-planning-solid",
};
const AVAILABILITY_KIND: Record<ProductRow["availability"], Kind> = {
  ready_now: "ready",
  producing: "producing",
  planning: "planning",
};
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready now" },
  { key: "producing", label: "Producing" },
  { key: "planning", label: "Planning" },
];

// Static display card — not a link. Editing a product goes through the
// "Manage" link above, not by tapping a card here (tried making cards
// themselves tappable-to-edit; turned out that's not what these rails are
// for, so they're read-only summaries again regardless of context).
function ProductCard({ p }: { p: ProductRow }) {
  const kind = AVAILABILITY_KIND[p.availability];
  return (
    <div className="avail-card grid">
      <div className="photo">
        {p.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>
      <div style={{ height: 8 }} />
      <div className="body-s-strong">{p.name}</div>
      <div className="caption">{productRailLabel(p)}</div>
      <div style={{ height: 4 }} />
      <span className={`avail ${KIND_CLASS[kind]}`}>{KIND_LABEL[kind]}</span>
    </div>
  );
}

// Ports availSection()/farmOwnerBody() — "Our products" on 4.1 (owner).
// Read-only display; the owner edits products from Manage (4.3), not from
// here. A row of All/Ready now/Producing/Planning filter pills replaces
// the old per-availability horizontal-scrolling rails, so the tab scrolls
// only vertically and products show in a fixed two-column grid.
export function AvailRail({ products }: { products: ProductRow[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  if (!products.length) {
    return (
      <>
        <div className="label-caps">Our products</div>
        <div style={{ height: 14 }} />
        <p className="body-m" style={{ color: "var(--text-tertiary)" }}>
          This farm hasn&apos;t listed any products yet.
        </p>
      </>
    );
  }

  const shown = filter === "all" ? products : products.filter((p) => AVAILABILITY_KIND[p.availability] === filter);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="label-caps">Our products</div>
        <Link href="/my-farm/products" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
          Manage
        </Link>
      </div>
      <div style={{ height: 14 }} />
      <div className="product-filter-row">
        {FILTERS.map((f) => (
          <button key={f.key} className={`product-filter-pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ height: 16 }} />
      {shown.length ? (
        <div className="product-grid">
          {shown.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <p className="body-m" style={{ color: "var(--text-tertiary)" }}>
          No products in this category yet.
        </p>
      )}
    </>
  );
}
