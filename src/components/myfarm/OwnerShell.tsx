import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { BottomNav } from "@/components/browse/BottomNav";
import { catBg, catFg } from "@/lib/categoryStyle";
import type { MyFarmIdentity } from "@/lib/myFarm";
import { TodayStatusPill } from "./TodayStatusPill";

const TABS: Array<["Products" | "About" | "Events", string]> = [
  ["Products", ""],
  ["About", "/about"],
  ["Events", "/events"],
];

// Ports ownerShell()/ownerIdentity()/ownerTabs()/farmHero() — the chrome
// shared by 4.1/4.8/4.9/4.13/4.15. The public-preview render (formerly
// reached via ?preview=1 and the eye icon) has been removed — the only
// farm preview left is the onboarding Preview screen (1.12), which is its
// own standalone page, not this shell.
export function OwnerShell({
  farm,
  activeTab,
  children,
}: {
  farm: MyFarmIdentity;
  activeTab: "Products" | "About" | "Events";
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero/header/tabs flow with the page — the whole screen scrolls as
          one, same as the public farm page (FarmProfileShell). */}
      <div style={{ flexShrink: 0 }}>
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
        <div className="px-4">
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div className="title-l" style={{ color: "var(--text-primary)" }}>
              {farm.name}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link href="/settings" className="owner-icon-btn" title="Settings">
                <Icon name="gear" size={18} />
              </Link>
            </div>
          </div>
          <div style={{ height: 4 }} />
          {farm.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14 }}>
              <Icon name="pin" size={16} />
              {farm.address}
            </div>
          )}
          <div style={{ height: 14 }} />
          <TodayStatusPill
            farmId={farm.id}
            hours={farm.hours}
            todayStatus={farm.todayStatus}
            todayStatusNote={farm.todayStatusNote}
            timezone={farm.timezone}
            tappable
          />
          <div style={{ height: 8 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {farm.categories.map((c) => (
              <span
                key={c}
                style={{
                  background: catBg(c),
                  border: `1px solid ${catFg(c)}`,
                  color: catFg(c),
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: 14,
                  display: "inline-flex",
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <div style={{ height: 16 }} />
          <div className="farm-tabs">
            {TABS.map(([label, slug]) => (
              <Link key={label} href={`/my-farm${slug}`} className={activeTab === label ? "active" : ""}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom padding clears the fixed BottomNav (70px) with real
          breathing room above it, not just flush against it. */}
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 98 }}>
        {children}
      </div>
      <BottomNav active="Profile" loggedIn />
    </main>
  );
}
