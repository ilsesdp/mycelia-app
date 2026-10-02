"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { useOnboarding, type ProductDraft } from "@/lib/onboarding/context";
import { catBg, catFg } from "@/lib/categoryStyle";
import { STATUS_TONE_COLOR } from "@/lib/farmStatus";
import { createClient } from "@/lib/supabase/client";
import { publishFarm } from "@/lib/onboarding/publish";

type Product = ProductDraft & { id: string };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
const ORDER: ProductDraft["availability"][] = ["Ready now", "Producing", "Planning"];

function availClass(a: ProductDraft["availability"]) {
  return a === "Ready now" ? "avail-ready" : a === "Producing" ? "avail-producing" : "avail-planning-solid";
}

function todayKey() {
  // JS getDay(): 0=Sun..6=Sat → DAYS is Mon..Sun.
  const js = new Date().getDay();
  return js === 0 ? "Sun" : DAYS[js - 1];
}

function fmtShortTime(t?: string) {
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return t;
  const h = parseInt(m[1], 10);
  return m[2] === "00" ? `${h}${m[3].toLowerCase()}` : `${h}:${m[2]}${m[3].toLowerCase()}`;
}

// Ports SCREENS['1.12'] — last review step before the single real write.
// "Publish my farm" calls publishFarm() (all the inserts at once, same as
// the prototype's one-shot write) and, on success, routes to /onboarding/success.
export default function PreviewPage() {
  const router = useRouter();
  const { state } = useOnboarding();
  const [tab, setTab] = useState<"Products" | "About" | "Events">("Products");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped: Partial<Record<ProductDraft["availability"], Product[]>> = {};
  for (const p of state.products) (grouped[p.availability] ||= []).push(p);
  const today = state.hours[todayKey()];
  const categories = Object.entries(state.categories).filter(([, v]) => v).map(([k]) => k);

  async function publish() {
    setPublishing(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPublishing(false);
      setError("Your session expired — please log in again.");
      return;
    }
    try {
      await publishFarm(state, user.id);
      router.push("/onboarding/success");
    } catch (e) {
      setPublishing(false);
      setError(e instanceof Error ? e.message : "Something went wrong publishing your farm.");
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/onboarding/contact" title="Preview" />
      <div style={{ background: "var(--info-bg)", padding: "12px 24px", fontSize: 14, display: "flex", gap: 8, color: "var(--info-fg)", flexShrink: 0 }}>
        <Icon name="eye" size={18} />
        <span>This is what everyone else will see. Nothing is public until you publish.</span>
      </div>
      {/* Hero/header/tabs stay put — same chrome-vs-scrolling-body split as
          the real farm page (FarmProfileShell): only the tab content below
          scrolls, not the whole screen. */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          className="hero"
          style={
            state.coverPhotoPreview
              ? { backgroundImage: `url(${state.coverPhotoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <div className="px-6" style={{ position: "relative" }}>
          {/* Disabled on purpose — this is a preview of your own farm, not
              a real visitor's view. The only action here is "Publish my
              farm" below; messaging yourself never made sense anyway. */}
          <div className="msgbtn-corner">
            <div className="btn-round" style={{ color: "var(--text-disabled)", cursor: "not-allowed", background: "var(--bg-subtle)" }} aria-disabled="true">
              <Icon name="msg" size={20} />
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-disabled)", textAlign: "center", whiteSpace: "nowrap" }}>
              Message
            </div>
          </div>
          <div style={{ height: 16 }} />
          <div className="title-l" style={{ color: state.farmName ? "var(--text-primary)" : "var(--text-disabled)", width: 280 }}>
            {state.farmName || "Add your farm name"}
          </div>
          <div style={{ height: 4 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 14 }}>
            <Icon name="pin" size={16} />
            {state.farmAddress || "Add your address"}
          </div>
          <div style={{ height: 8 }} />
          {today.closed ? (
            <div className="status-row">
              <span className="dot" style={{ background: STATUS_TONE_COLOR.closed }} />
              <span className="label" style={{ color: STATUS_TONE_COLOR.closed }}>
                Closed
              </span>
              <span className="detail">&nbsp;today</span>
            </div>
          ) : (
            <div className="status-row">
              <span className="dot" style={{ background: STATUS_TONE_COLOR.open }} />
              <span className="label" style={{ color: STATUS_TONE_COLOR.open }}>
                Open
              </span>
              <span className="detail">&nbsp;until {fmtShortTime(today.close) || "5pm"}</span>
            </div>
          )}
          <div style={{ height: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.length ? (
              categories.map((c) => (
                <span key={c} className="cat-chip" style={{ background: catBg(c), borderColor: catFg(c), color: catFg(c) }}>
                  {c}
                </span>
              ))
            ) : (
              <span className="caption">No categories chosen</span>
            )}
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
      <div className="px-6" style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        {(["Products", "About", "Events"] as const).map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, textAlign: "center", padding: "8px 0", cursor: "pointer", borderBottom: `2.5px solid ${tab === t ? "var(--border-brand)" : "transparent"}` }}
          >
            <span className={tab === t ? "body-m-strong" : "body-m"} style={tab === t ? {} : { color: "var(--text-secondary)" }}>
              {t}
            </span>
          </div>
        ))}
      </div>
      <div className="px-6" style={{ paddingTop: 16, paddingBottom: 112 }}>
        {tab === "Products" ? (
          <>
            <div className="label-caps">What&apos;s available</div>
            <div style={{ height: 14 }} />
            {ORDER.filter((a) => grouped[a]?.length).length === 0 && <p className="caption">No products added yet.</p>}
            {ORDER.filter((a) => grouped[a]?.length).map((a) => (
              <div key={a}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="body-s-strong">{a}</span>
                  <span className="caption">
                    {grouped[a]!.length} item{grouped[a]!.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ height: 10 }} />
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                  {grouped[a]!.map((p) => (
                    <div key={p.id} style={{ width: 150, flexShrink: 0 }}>
                      {p.photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.photoPreview}
                          alt=""
                          style={{ width: 150, height: 108, borderRadius: 16, objectFit: "cover", border: "1px solid var(--border-subtle)", display: "block" }}
                        />
                      ) : (
                        <div style={{ width: 150, height: 108, borderRadius: 16, background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }} />
                      )}
                      <div style={{ height: 8 }} />
                      <div className="body-s-strong">{p.name}</div>
                      <div className="caption">
                        {[p.qty ? `${p.qty} ${p.unit}`.trim() : "", p.roughlyWhen].filter(Boolean).join(" · ")}
                      </div>
                      <div style={{ height: 4 }} />
                      <span className={`avail ${availClass(a)}`}>{a}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 20 }} />
              </div>
            ))}
          </>
        ) : tab === "About" ? (
          <>
            <div className="label-caps">Your story</div>
            <div style={{ height: 10 }} />
            <p className="body-m" style={{ lineHeight: "20px" }}>
              {state.farmAbout || "This farm hasn't shared their story yet."}
            </p>
            <div style={{ height: 20 }} />
            <div className="label-caps">Hours</div>
            <div style={{ height: 8 }} />
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "0 12px" }}>
              {DAYS.map((d, i) => {
                const h = state.hours[d];
                return (
                  <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < DAYS.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <span className="body-m" style={{ color: "var(--text-primary)" }}>{DAY_FULL[d]}</span>
                    <span className="body-m">{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 12 }} />
            {state.farmAddress && (
              <div style={{ display: "flex", gap: 4, alignItems: "flex-start", color: "var(--text-secondary)" }}>
                <Icon name="pin" size={16} />
                <span className="body-s">{state.farmAddress}</span>
              </div>
            )}
            <div style={{ height: 16 }} />
            <DirectionsButton address={state.farmAddress || null} disabled />
            <div style={{ height: 24 }} />
            <div className="label-caps">Contact</div>
            {(() => {
              // "Growers only" is visible to any signed-in visitor — the
              // realistic case for who views a published farm page, same as
              // farm_public_contact's own growers_only branch — "Only me"
              // never shows here.
              const showEmail = !!state.contactEmail && state.emailVisibility === "Growers only";
              const showPhone = !!state.contactPhone && state.phoneVisibility === "Growers only";
              if (!showEmail && !showPhone) {
                return (
                  <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
                    This farm hasn&apos;t shared contact details here.
                  </p>
                );
              }
              return (
                <>
                  {showEmail && <p className="body-s">{state.contactEmail}</p>}
                  {showPhone && <p className="body-s">{state.contactPhone}</p>}
                </>
              );
            })()}
            <div style={{ height: 8 }} />
            <button className="btn btn-primary" style={{ width: "100%" }} disabled>
              Message {state.farmName || "this farm"}
            </button>
          </>
        ) : (
          <>
            <div className="label-caps">Upcoming events</div>
            <div style={{ height: 14 }} />
            <p className="caption">No events added yet. You can add these after you publish your farm.</p>
          </>
        )}
      </div>
      {/* Fixed at the bottom of the viewport on purpose, unlike the folded-in
          footer bars elsewhere (see the whole-page-scroll conversion): this
          is the one action on the page, and it needs to stay reachable no
          matter which tab the user is reading or how far they've scrolled. */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--bg-raised)",
          borderTop: "1px solid var(--border-subtle)",
          padding: "12px 24px calc(12px + env(safe-area-inset-bottom))",
          zIndex: 50,
        }}
      >
        {error && (
          <p className="hint-error" style={{ marginBottom: 8 }}>
            {error}
          </p>
        )}
        <Button variant="primary" disabled={publishing || !state.farmName} onClick={publish}>
          {publishing ? "Publishing…" : "Publish my farm"}
        </Button>
      </div>
    </main>
  );
}
