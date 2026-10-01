import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/browse/BottomNav";
import { MessageAction } from "./MessageAction";
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
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      <AppBar backHref={backHref} />
      <div style={{ position: "relative" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
              {farm.address}
            </div>
          )}
          <div style={{ height: 4 }} />
          <div className="statuschip">
            <span className="dot" />
            <span className="txt">
              {farm.status.label} <span className="dim">{farm.status.note}</span>
            </span>
          </div>
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

      <div className="farm-tabs">
        {TABS.map(([label, slug]) => (
          <Link key={label} href={`/farms/${farm.id}/${slug}`} className={activeTab === label ? "active" : ""}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ height: 16 }} />
      <div className="px-4" style={{ flex: 1 }}>
        {children}
      </div>

      <BottomNav active="Map" loggedIn={loggedIn} />
    </main>
  );
}
