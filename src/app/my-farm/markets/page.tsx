import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmMarkets } from "@/lib/myFarm";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";

// Ports SCREENS['4.22'] (stand-in — no Figma spec).
export default async function ManageMarketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const markets = await getMyFarmMarkets(supabase, farmId);

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/my-farm/events" backLabel="Events" title="Manage markets" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {markets.length === 0 ? (
          <p className="body-m">No markets added yet.</p>
        ) : (
          markets.map((m) => (
            <Link
              key={m.id}
              href={`/markets/${m.id}`}
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 8,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Icon name="basket" size={26} />
              <div style={{ flex: 1 }}>
                <div className="body-m" style={{ color: "var(--text-primary)" }}>
                  {m.name}
                </div>
                <div className="body-s-medium">{m.schedule_text}</div>
              </div>
              <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
            </Link>
          ))
        )}
        <div style={{ height: 8 }} />
        <Link href="/my-farm/markets/new" className="btn btn-primary">
          + Add a market
        </Link>
      </div>
    </main>
  );
}
