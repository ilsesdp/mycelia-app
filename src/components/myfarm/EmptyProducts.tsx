import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// Ports SCREENS['4.13'] — My Farm's empty state once all products are gone
// (or none were added in onboarding).
export function EmptyProducts() {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="label-caps">What&apos;s available</div>
        <Link href="/my-farm/products" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
          Manage
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 16px 8px" }}>
        <div className="empty-icon-ring">
          <Icon name="basket" size={26} />
        </div>
        <div className="title-m" style={{ color: "var(--text-primary)", textAlign: "center" }}>
          No products yet
        </div>
        <p className="body-m" style={{ textAlign: "center" }}>
          Add what you offer so people know what to come for.
        </p>
        <div style={{ height: 6 }} />
        <Link href="/my-farm/products/new" className="btn btn-primary">
          Add your first product
        </Link>
      </div>
    </>
  );
}
