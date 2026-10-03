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

// Static display card — not a link. Editing a product goes through the
// "Manage" link above, not by tapping a card here (tried making cards
// themselves tappable-to-edit; turned out that's not what these rails are
// for, so they're read-only summaries again regardless of context).
function RailCard({ p, kind }: { p: ProductRow; kind: "ready" | "producing" | "planning" }) {
  return (
    <div className="avail-card">
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

function Section({ label, kind, items }: { label: string; kind: "ready" | "producing" | "planning"; items: ProductRow[] }) {
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
          <RailCard key={p.id} p={p} kind={kind} />
        ))}
      </div>
      <div style={{ height: 20 }} />
    </>
  );
}

// Ports availSection()/farmOwnerBody()/farmOwnerBodyPublic() — the "What's
// available" rails on 4.1 (owner) and 4.2 (public preview). Both are
// read-only displays; the owner edits products from Manage (4.3), not from
// here.
export function AvailRail({ products, showManage }: { products: ProductRow[]; showManage: boolean }) {
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
      <Section label="Ready now" kind="ready" items={ready} />
      <Section label="Producing" kind="producing" items={producing} />
      <Section label="Planning" kind="planning" items={planning} />
    </>
  );
}
