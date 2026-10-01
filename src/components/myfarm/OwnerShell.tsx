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
// shared by 4.1/4.2/4.8/4.9/4.13/4.15. `preview` mirrors the prototype's
// S.ownerPreview: a read-only "what visitors see" mode reached via the eye
// icon, with a banner and the bottom nav's Map tab highlighted instead of
// Profile. Exiting preview always returns to Products (4.1), matching the
// prototype's hardcoded bannerExitTo.
export function OwnerShell({
  farm,
  activeTab,
  preview,
  children,
}: {
  farm: MyFarmIdentity;
  activeTab: "Products" | "About" | "Events";
  preview: boolean;
  children: React.ReactNode;
}) {
  const qs = preview ? "?preview=1" : "";
  return (
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      {preview && (
        <div style={{ background: "var(--info-bg)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ color: "var(--info-fg)", display: "flex", flexShrink: 0 }}>
            <Icon name="eye" size={18} />
          </span>
          <span className="body-s-strong" style={{ color: "var(--info-fg)", flex: 1 }}>
            Viewing as public
          </span>
          <Link
            href="/my-farm"
            style={{ cursor: "pointer", textDecoration: "none", color: "var(--info-fg)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, flexShrink: 0 }}
          >
            Exit preview
          </Link>
        </div>
      )}
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
      <div className="px-4" style={{ flex: 1 }}>
        <div style={{ height: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div className="title-l" style={{ color: "var(--text-primary)" }}>
            {farm.name}
          </div>
          {!preview && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link href="/my-farm?preview=1" className="owner-icon-btn" title="Preview">
                <Icon name="eye" size={18} />
              </Link>
              <Link href="/settings" className="owner-icon-btn" title="Settings">
                <Icon name="gear" size={18} />
              </Link>
            </div>
          )}
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
          tappable={!preview}
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
            <Link key={label} href={`/my-farm${slug}${qs}`} className={activeTab === label ? "active" : ""}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ height: 16 }} />
        {children}
      </div>
      <BottomNav active={preview ? "Map" : "Profile"} loggedIn />
    </main>
  );
}
