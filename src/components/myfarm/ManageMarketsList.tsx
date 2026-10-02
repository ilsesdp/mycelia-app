"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import type { MarketRow } from "@/lib/myFarm";

// Ports SCREENS['4.22'] (stand-in — no Figma spec) plus an edit-mode bulk
// delete: the top-right icon swaps each row's ">" chevron for a checkbox,
// and checking one or more shows a "Delete" bar at the bottom instead of
// "+ Add a market". Deleting unlinks the market from this farm
// (farm_markets) rather than removing the shared markets row itself.
export function ManageMarketsList({ farmId, markets }: { farmId: string; markets: MarketRow[] }) {
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
    await supabase.from("farm_markets").delete().eq("farm_id", farmId).in("market_id", Array.from(selected));
    setDeleting(false);
    exitEditing();
    router.refresh();
  }

  return (
    <main className="flex flex-col" style={{ height: "100dvh" }}>
      <AppBar
        backHref={editing ? undefined : "/my-farm/events"}
        backLabel="Events"
        title="Manage markets"
        right={
          markets.length > 0 ? (
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
              aria-label={editing ? "Cancel" : "Edit markets"}
            >
              {editing ? <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>Cancel</span> : <Icon name="pencil" size={20} />}
            </button>
          ) : undefined
        }
      />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 100 }}>
        {markets.length === 0 ? (
          <p className="body-m">No markets added yet.</p>
        ) : (
          markets.map((m) => {
            const isSelected = selected.has(m.id);
            const row = (
              <div
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Image src="/icons/icon-market.svg" alt="" width={32} height={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="body-m" style={{ color: "var(--text-primary)" }}>
                    {m.name}
                  </div>
                  <div className="body-s-medium">{m.schedule_text}</div>
                </div>
                {editing ? (
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      border: `1.5px solid ${isSelected ? "transparent" : "var(--border-strong)"}`,
                      background: isSelected ? "var(--interactive-primary)" : "transparent",
                      color: "#fff",
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
                  <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>&#8250;</span>
                )}
              </div>
            );
            return editing ? (
              <div key={m.id} role="checkbox" aria-checked={isSelected} tabIndex={0} onClick={() => toggle(m.id)} style={{ cursor: "pointer" }}>
                {row}
              </div>
            ) : (
              <Link key={m.id} href={`/markets/${m.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                {row}
              </Link>
            );
          })
        )}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 24px 20px", background: "#fff" }}>
        {editing ? (
          <button className="btn btn-danger" disabled={!selected.size || deleting} onClick={deleteSelected}>
            {deleting ? "Deleting…" : selected.size ? `Delete ${selected.size} market${selected.size > 1 ? "s" : ""}` : "Select markets to delete"}
          </button>
        ) : (
          <Link href="/my-farm/markets/new" className="btn btn-primary">
            + Add a market
          </Link>
        )}
      </div>
    </main>
  );
}
