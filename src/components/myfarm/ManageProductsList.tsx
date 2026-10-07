"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { productRailLabel, type ProductRow } from "@/lib/myFarm";
import { SavedToast } from "@/components/myfarm/SavedToast";

const AVAIL_LABEL: Record<ProductRow["availability"], string> = {
  ready_now: "Ready now",
  producing: "Producing",
  planning: "Planning",
};
const AVAIL_CLASS: Record<ProductRow["availability"], string> = {
  ready_now: "avail-ready",
  producing: "avail-producing",
  planning: "avail-planning-solid",
};

// Ports SCREENS['4.3'] plus an edit-mode bulk delete, mirroring
// ManageMarketsList/ManageEventsList: the top-right icon swaps each row's
// ">" chevron for a checkbox (grouped by category, same as before), and
// checking one or more shows a "Delete" bar at the bottom instead of
// "+ Add another product". No product is referenced by another table, so
// a bulk delete needs no extra cleanup.
export function ManageProductsList({ products }: { products: ProductRow[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitEditing() {
    setEditing(false);
    setSelected(new Set());
  }

  async function deleteSelected() {
    if (!selected.size || deleting) return;
    setDeleting(true);
    await supabase.from("products").delete().in("id", Array.from(selected));
    setDeleting(false);
    exitEditing();
    router.refresh();
  }

  const order: string[] = [];
  const byCat: Record<string, ProductRow[]> = {};
  for (const p of products) {
    const cat = p.category || "Other";
    if (!byCat[cat]) {
      byCat[cat] = [];
      order.push(cat);
    }
    byCat[cat].push(p);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar
        backHref={editing ? undefined : "/my-farm"}
        backLabel="My farm"
        title="Manage products"
        right={
          products.length > 0 ? (
            <button
              onClick={() => (editing ? exitEditing() : setEditing(true))}
              style={{
                width: 84,
                display: "flex",
                justifyContent: "flex-end",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
              aria-label={editing ? "Cancel" : "Edit products"}
            >
              {editing ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>Cancel</span> : <Icon name="pencil" size={20} />}
            </button>
          ) : undefined
        }
      />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        {products.length === 0 ? (
          <p className="body-m" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px 0" }}>
            No products yet.
          </p>
        ) : (
          order.map((cat) => (
            <div key={cat}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="body-s-strong">{cat}</span>
                <span className="caption">
                  {byCat[cat].length} item{byCat[cat].length === 1 ? "" : "s"}
                </span>
              </div>
              {byCat[cat].map((p) => {
                const isSelected = selected.has(p.id);
                const row = (
                  <>
                    {p.photo_url ? (
                      <div className="thumb" style={{ border: "none", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    ) : (
                      <div className="thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                        <Icon name="basket" size={20} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="body-s-strong">{p.name}</div>
                      <div className="caption">{productRailLabel(p)}</div>
                    </div>
                    <span className={`avail ${AVAIL_CLASS[p.availability]}`}>{AVAIL_LABEL[p.availability]}</span>
                    {editing ? (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          border: `1.5px solid ${isSelected ? "transparent" : "var(--border-strong)"}`,
                          background: isSelected ? "var(--interactive-primary)" : "transparent",
                          color: "var(--text-on-brand)",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-tertiary)", fontSize: 20, flexShrink: 0 }}>&#8250;</span>
                    )}
                  </>
                );
                return editing ? (
                  <div
                    key={p.id}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => toggle(p.id)}
                    className="product-row"
                    style={{ cursor: "pointer" }}
                  >
                    {row}
                  </div>
                ) : (
                  <Link key={p.id} href={`/my-farm/products/${p.id}`} className="product-row">
                    {row}
                  </Link>
                );
              })}
              <div style={{ height: 14 }} />
            </div>
          ))
        )}
        <div style={{ height: 16 }} />
        {editing ? (
          <button className="btn btn-danger" disabled={!selected.size || deleting} onClick={deleteSelected}>
            {deleting ? "Deleting…" : selected.size ? `Delete ${selected.size} product${selected.size > 1 ? "s" : ""}` : "Select products to delete"}
          </button>
        ) : (
          <Link href="/my-farm/products/new" className="btn btn-primary">
            + Add another product
          </Link>
        )}
      </div>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
    </main>
  );
}
