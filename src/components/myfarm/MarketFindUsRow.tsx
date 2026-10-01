import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { MarketRow } from "@/lib/myFarm";

// Ports marketFindUsRow() — every market the farm is listed at, or a
// not-listed placeholder. Each row opens the real market detail page (2.11).
export function MarketFindUsRow({ markets }: { markets: MarketRow[] }) {
  if (!markets.length) {
    return (
      <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <Icon name="basket" size={26} />
        <div className="body-s" style={{ color: "var(--text-tertiary)" }}>
          Not listed at any markets yet.
        </div>
      </div>
    );
  }
  return (
    <>
      {markets.map((m, i) => (
        <div key={m.id}>
          {i > 0 && <div style={{ height: 8 }} />}
          <Link
            href={`/markets/${m.id}`}
            style={{
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Icon name="basket" size={26} />
            <div style={{ flex: 1 }}>
              <div className="body-m" style={{ color: "var(--text-primary)" }}>
                {m.name}
              </div>
              <div className="body-s-medium">
                {m.schedule_text}
                {m.location ? ` · ${m.location}` : ""}
              </div>
            </div>
            <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
          </Link>
        </div>
      ))}
    </>
  );
}
