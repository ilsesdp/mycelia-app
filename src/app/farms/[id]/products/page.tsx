import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFarmHeader, resolveBackHref } from "@/lib/farmProfile";
import { FarmProfileShell } from "@/components/farm/FarmProfileShell";

type ProductRow = { id: string; name: string; qty: string | null; photo_url: string | null };

function rail(products: ProductRow[], kind: "ready" | "producing") {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
      {products.length === 0 ? (
        <p className="caption">Nothing here yet.</p>
      ) : (
        products.map((p) => (
          <div key={p.id} style={{ width: 140, flexShrink: 0 }}>
            {p.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photo_url}
                alt=""
                style={{ width: 140, height: 100, borderRadius: 16, objectFit: "cover", border: "1px solid var(--border-subtle)", display: "block" }}
              />
            ) : (
              <div style={{ width: 140, height: 100, borderRadius: 16, background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }} />
            )}
            <div style={{ height: 8 }} />
            <div className="body-s-strong">{p.name}</div>
            <div className="caption">{p.qty}</div>
            <div style={{ height: 4 }} />
            <span className={`avail ${kind === "ready" ? "avail-ready" : "avail-producing"}`}>{kind === "ready" ? "Ready now" : "Producing"}</span>
          </div>
        ))
      )}
    </div>
  );
}

// Ports SCREENS['2.3'] — the farm profile's Products tab.
export default async function FarmProductsPage({ params, searchParams }: PageProps<"/farms/[id]/products">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [farm, { data: products }] = await Promise.all([
    getFarmHeader(supabase, id),
    supabase.from("products").select("id, name, qty, availability, photo_url").eq("farm_id", id).order("sort_order"),
  ]);

  if (!farm) notFound();

  const ready = (products ?? []).filter((p) => p.availability === "ready_now");
  const producing = (products ?? []).filter((p) => p.availability === "producing");

  return (
    <FarmProfileShell farm={farm} activeTab="Products" backHref={resolveBackHref(sp.from)} loggedIn={!!user}>
      <div className="label-caps">What&apos;s available</div>
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="body-s-strong">Ready now</span>
        <span className="caption">{ready.length} items</span>
      </div>
      <div style={{ height: 10 }} />
      {rail(ready, "ready")}
      <div style={{ height: 20 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="body-s-strong">Producing</span>
        <span className="caption">{producing.length} items</span>
      </div>
      <div style={{ height: 10 }} />
      {rail(producing, "producing")}
    </FarmProfileShell>
  );
}
