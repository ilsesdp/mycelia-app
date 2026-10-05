import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { DistanceLabel } from "@/components/ui/DistanceLabel";
import { MessageAction } from "./MessageAction";
import { StatusChip } from "./StatusChip";
import { catBg, catFg } from "@/lib/categoryStyle";
import type { FarmHeader } from "@/lib/farmProfile";

const TABS: Array<["Products" | "About" | "Events", string]> = [
  ["Products", "products"],
  ["About", "about"],
  ["Events", "events"],
];

// Ports farmProfileShell()/farmHero()/farmHeader()/farmTabs() — the chrome
// shared by 2.3/2.4/2.5. `backHref` carries the visitor's view origin
// (list vs. map) through the `from` query param set on the links into here.
export function FarmProfileShell({
  farm,
  activeTab,
  backHref,
  loggedIn,
  children,
}: {
  farm: FarmHeader;
  activeTab: "Products" | "About" | "Events";
  backHref: string;
  loggedIn: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref={backHref} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          className="hero"
          style={
            farm.coverPhotoUrl
              ? { backgroundImage: `url(${farm.coverPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!farm.coverPhotoUrl && (
            <div className="hero-dots">
              <div className="d" style={{ width: 18 }} />
              <div className="d" style={{ width: 6 }} />
              <div className="d" style={{ width: 6 }} />
              <div className="d" style={{ width: 6 }} />
            </div>
          )}
        </div>
        <div className="px-4" style={{ position: "relative" }}>
          <MessageAction variant="corner" farmId={farm.id} farmName={farm.name} loggedIn={loggedIn} />

          <div style={{ height: 16 }} />
          <div className="title-l" style={{ color: "var(--text-primary)" }}>
            {farm.name}
          </div>
          <div style={{ height: 4 }} />
          {farm.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 14 }}>
              <Icon name="pin" size={16} />
              {farm.address}
              <DistanceLabel lat={farm.lat} lng={farm.lng} />
            </div>
          )}
          <div style={{ height: 4 }} />
          <StatusChip hours={farm.hours} todayStatus={farm.todayStatus} />
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {farm.categories.map((c) => (
              <span key={c} className="cat-chip" style={{ background: catBg(c), borderColor: catFg(c), color: catFg(c) }}>
                {c}
              </span>
            ))}
          </div>
          <div style={{ height: 24 }} />
        </div>
      </div>

      <div className="farm-tabs" style={{ flexShrink: 0 }}>
        {TABS.map(([label, slug]) => (
          <Link key={label} href={`/farms/${farm.id}/${slug}`} className={activeTab === label ? "active" : ""}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ height: 16, flexShrink: 0 }} />
      {/* The whole page scrolls as one now — only BottomNav stays fixed.
          98px bottom padding clears it (70px) with real breathing room
          above it, not just flush against it. */}
      <div className="px-4" style={{ paddingBottom: 98 }}>
        {children}
      </div>

      <BottomNav active="Map" loggedIn={loggedIn} />
    </main>
  );
}
