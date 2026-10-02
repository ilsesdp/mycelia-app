import Link from "next/link";
import Image from "next/image";
import type { MarketRow } from "@/lib/myFarm";

// Ports marketFindUsRow() — every market the farm is listed at, or a
// not-listed placeholder. Each row opens the real market detail page (2.11).
// The orange "M" badge is the same /icons/icon-market.svg the Filters sheet
// (Farms/Markets kind cards) and the market detail page's farm list use, so
// a market reads as the same thing everywhere it shows up — not a generic
// basket icon.
export function MarketFindUsRow({ markets }: { markets: MarketRow[] }) {
  if (!markets.length) {
    return (
      <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <Image src="/icons/icon-market.svg" alt="" width={32} height={32} />
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
            href={`/markets/${m.id}?from=events`}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: "12px 16px",
              textDecoration: "none",
            }}
          >
            <Image src="/icons/icon-market.svg" alt="" width={32} height={32} />
            <div style={{ flex: 1 }}>
              <div className="title-m" style={{ fontSize: 18, lineHeight: "24px", color: "var(--text-primary)" }}>
                {m.name}
              </div>
              {m.location && <div className="body-s">{m.location}</div>}
              <div className="body-s">{m.schedule_text}</div>
            </div>
            <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
          </Link>
        </div>
      ))}
    </>
  );
}
