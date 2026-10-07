"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding, type ProductDraft } from "@/lib/onboarding/context";
import { catBg, catFg } from "@/lib/categoryStyle";

function availClass(a: ProductDraft["availability"]) {
  return a === "Ready now" ? "avail-ready" : a === "Producing" ? "avail-producing" : "avail-planning-solid";
}

// Ports SCREENS['1.8'] (has products) and SCREENS['1.8b'] (empty state) as
// one route — which view shows depends on state.products, same branch the
// prototype makes at the Continue click on 1.7.
export default function ProductsPage() {
  const router = useRouter();
  const { state } = useOnboarding();

  if (state.products.length === 0) {
    const chosen = Object.entries(state.categories)
      .filter(([, v]) => v)
      .map(([k]) => k);
    return (
      <main className="min-h-screen flex flex-col">
        <AppBar backHref="/onboarding/categories" />
        <div className="px-4 pt-4 pb-8 flex-1 flex flex-col">
          <StepHeader step={3} title="Your products" subtitle="Let people know what you have available. You can update products anytime." />
          <p className="caption">Based on your choices</p>
          <div style={{ height: 8 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chosen.length ? (
              chosen.map((c) => (
                <span key={c} className="cat-chip" style={{ background: catBg(c), borderColor: catFg(c), color: catFg(c) }}>
                  {c}
                </span>
              ))
            ) : (
              <span className="caption">None chosen</span>
            )}
          </div>
          <div style={{ height: 30 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 276, height: 234, borderRadius: 16, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src="/sprouts.png" alt="" width={276} height={234} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <p className="body-m" style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
              You haven&apos;t added any products yet.
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <div className="pb-6 pt-6">
            <Button variant="primary" onClick={() => router.push("/onboarding/products/new")}>
              Add your first product
            </Button>
            <div style={{ height: 10 }} />
            <a
              style={{
                display: "block",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                cursor: "pointer",
              }}
              onClick={() => router.push("/onboarding/hours")}
            >
              I&apos;ll do this later
            </a>
          </div>
        </div>
      </main>
    );
  }

  const grouped: Record<string, typeof state.products> = {};
  for (const p of state.products) (grouped[p.category] ||= []).push(p);

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/categories" />
      <div className="px-4 pt-4 pb-8 flex-1 flex flex-col">
        <StepHeader step={3} title="Your products" subtitle="Let people know what you have available. You can update products anytime." />
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="body-s-strong">{cat}</span>
              <span className="caption">
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ height: 8 }} />
            {items.map((p) => (
              <div
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}
              >
                {p.photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photoPreview} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--bg-subtle)", border: "1px dashed var(--border-subtle)" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div className="body-s-strong">{p.name}</div>
                  <div className="caption">
                    {p.qty} {p.unit}
                  </div>
                </div>
                <span className={`avail ${availClass(p.availability)}`}>{p.availability}</span>
              </div>
            ))}
            <div style={{ height: 18 }} />
          </div>
        ))}
        <button className="btn btn-secondary" style={{ height: 48 }} onClick={() => router.push("/onboarding/products/new")}>
          + Add another product
        </button>
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-6">
          <Button variant="primary" onClick={() => router.push("/onboarding/hours")}>
            Continue
          </Button>
          <div style={{ height: 10 }} />
          <Button variant="ghost" onClick={() => router.push("/onboarding/hours")}>
            I&apos;ll do this later
          </Button>
        </div>
      </div>
    </main>
  );
}
