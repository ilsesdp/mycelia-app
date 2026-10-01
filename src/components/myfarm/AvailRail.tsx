import Link from "next/link";
import { productRailLabel, type ProductRow } from "@/lib/myFarm";

const KIND_LABEL: Record<"ready" | "producing" | "planning", string> = {
  ready: "Ready now",
  producing: "Producing",
  planning: "Planning",
};
const KIND_CLASS: Record<"ready" | "producing" | "planning", string> = {
  ready: "avail-ready",
  producing: "avail-producing",
  planning: "avail-planning-solid",
};

function RailCard({ p, kind, tappable }: { p: ProductRow; kind: "ready" | "producing" | "planning"; tappable: boolean }) {
  const card = (
    <div className="avail-card" style={tappable ? { cursor: "pointer" } : undefined}>
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
  return tappable ? <Link href={`/my-farm/products/${p.id}`}>{card}</Link> : card;
}

function Section({ label, kind, items, tappable }: { label: string; kind: "ready" | "producing" | "planning"; items: ProductRow[]; tappable: boolean }) {
  if (!items.length) return null;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="body-s-strong">{label}</span>
        <span className="caption">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div style={{ height: 10 }} />
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {items.map((p) => (
          <RailCard key={p.id} p={p} kind={kind} tappable={tappable} />
        ))}
      </div>
      <div style={{ height: 20 }} />
    </>
  );
}

// Ports availSection()/farmOwnerBody()/farmOwnerBodyPublic() — the "What's
// available" rails on 4.1 (owner, tappable → edit) and 4.2 (public preview,
// read-only).
export function AvailRail({ products, tappable, showManage }: { products: ProductRow[]; tappable: boolean; showManage: boolean }) {
  if (!products.length) {
    return (
      <>
        <div className="label-caps">What&apos;s available</div>
        <div style={{ height: 14 }} />
        <p className="body-m" style={{ color: "var(--text-tertiary)" }}>
          This farm hasn&apos;t listed any products yet.
        </p>
      </>
    );
  }
  const ready = products.filter((p) => p.availability === "ready_now");
  const producing = products.filter((p) => p.availability === "producing");
  const planning = products.filter((p) => p.availability === "planning");
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="label-caps">What&apos;s available</div>
        {showManage && (
          <Link href="/my-farm/products" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
            Manage
          </Link>
        )}
      </div>
      <div style={{ height: 14 }} />
      <Section label="Ready now" kind="ready" items={ready} tappable={tappable} />
      <Section label="Producing" kind="producing" items={producing} tappable={tappable} />
      <Section label="Planning" kind="planning" items={planning} tappable={tappable} />
    </>
  );
}
