import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveBackHref } from "@/lib/farmProfile";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { DistanceLabel } from "@/components/ui/DistanceLabel";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";

// Ports SCREENS['2.11'] — the market page a map pin or the Events tab's
// "Also find us at" row opens. "Going this Saturday" lists the real farms
// that picked this market during onboarding (farm_markets), replacing the
// prototype's 4 hardcoded demo farms; there's no real schedule of which
// farms show up on which specific date, so — same as the map's market pins
// — this just lists every farm associated with the market, not a
// day-specific roster (My Farm tools would be where an owner manages that,
// not built yet).
export default async function MarketPage({ params, searchParams }: PageProps<"/markets/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: market }, { data: farmMarkets }, { data: marketPhotos }] = await Promise.all([
    supabase.from("markets").select("id, name, location, schedule_text, lat, lng").eq("id", id).maybeSingle(),
    supabase
      .from("farm_markets")
      .select("farms ( id, name, published, farm_categories ( category ) )")
      .eq("market_id", id),
    supabase.from("market_photos").select("id, url").eq("market_id", id).order("sort_order"),
  ]);

  if (!market) notFound();

  const farms = (farmMarkets ?? [])
    .map((row) => row.farms)
    .filter((f): f is NonNullable<typeof f> => !!f && f.published);

  return (
    <main className="flex flex-col" style={{ height: "100dvh" }}>
      <AppBar backHref={resolveBackHref(sp.from)} />
      <div style={{ flexShrink: 0 }}>
        <PhotoCarousel photos={marketPhotos ?? []} />
        <div className="px-4">
          <div style={{ height: 16 }} />
          <div className="title-l" style={{ color: "var(--text-primary)" }}>
            {market.name}
          </div>
          <div style={{ height: 4 }} />
          {market.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 14 }}>
              <Icon name="pin" size={16} />
              {market.location}
              <DistanceLabel lat={market.lat} lng={market.lng} />
            </div>
          )}
          <div style={{ height: 4 }} />
          {market.schedule_text && (
            <div className="statuschip">
              <span className="dot" />
              <span className="txt">{market.schedule_text}</span>
            </div>
          )}
          <div style={{ height: 16 }} />
          <DirectionsButton address={market.location} />
          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* Only this list scrolls — the hero, header and directions button
          above stay put, same scroll containment as the farm profile shell. */}
      <div className="px-4" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 98 }}>
        <div className="label-caps">Farms at this market</div>
        <div style={{ height: 8 }} />
        {farms.length === 0 ? (
          <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
            No farms have listed this market yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {farms.map((f) => (
              <Link
                key={f.id}
                href={`/farms/${f.id}?from=map`}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                <Image src="/icons/icon-farm.svg" alt="" width={32} height={32} />
                <div style={{ flex: 1 }}>
                  <div className="title-m" style={{ fontSize: 18, lineHeight: "24px", color: "var(--text-primary)" }}>
                    {f.name}
                  </div>
                  {f.farm_categories.length > 0 && <div className="body-s">{f.farm_categories.map((c) => c.category).join(", ")}</div>}
                </div>
                <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="Map" loggedIn={!!user} />
    </main>
  );
}
