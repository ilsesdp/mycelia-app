import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { productRailLabel, type ProductRow } from "@/lib/myFarm";

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

// Ports productRow()/productGroup()/manageProductsBody() — products grouped
// by category, each row drilling into the edit form.
export function ProductRowList({ products }: { products: ProductRow[] }) {
  if (!products.length) {
    return (
      <p className="body-m" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px 0" }}>
        No products yet.
      </p>
    );
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
    <>
      {order.map((cat) => (
        <div key={cat}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="body-s-strong">{cat}</span>
            <span className="caption">
              {byCat[cat].length} item{byCat[cat].length === 1 ? "" : "s"}
            </span>
          </div>
          {byCat[cat].map((p) => (
            <Link key={p.id} href={`/my-farm/products/${p.id}`} className="product-row">
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
              <span style={{ color: "var(--text-tertiary)", fontSize: 20, flexShrink: 0 }}>&#8250;</span>
            </Link>
          ))}
          <div style={{ height: 14 }} />
        </div>
      ))}
    </>
  );
}
