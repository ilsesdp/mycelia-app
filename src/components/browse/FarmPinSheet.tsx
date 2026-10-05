import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DistanceLabel } from "@/components/ui/DistanceLabel";
import { catBg, catFg } from "@/lib/categoryStyle";
import { abbreviateAddress } from "@/lib/geo";
import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow, type TodayStatus } from "@/lib/farmStatus";

export type SheetProduct = { id: string; name: string; qty: string | null; photo_url: string | null };

export type FarmSheetData = {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  categories: string[];
  // Raw hours + manual override, computed into open/label/note below using
  // the farm's own stored timezone.
  hours: HourRow[];
  todayStatus: TodayStatus;
  timezone: string;
  ready: SheetProduct[];
  producing: SheetProduct[];
  coverPhotoUrl: string | null;
};

function productCard(p: SheetProduct, kind: "ready" | "producing") {
  return (
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
      <span className={`avail ${kind === "ready" ? "avail-ready" : "avail-producing"}`}>
        {kind === "ready" ? "Ready now" : "Producing"}
      </span>
    </div>
  );
}

// Ports SCREENS['2.2'] — the bottom sheet a tapped farm pin opens, over the
// (now dimmed) map. "See all" / "See the farm" both go to the farm's own
// profile page; that route (2.3–2.5) is the next screen group and isn't
// built yet, so — same as the list view's farm cards today — the link is
// real but its destination isn't live yet.
//
// `open` drives a slide-up/slide-down transform (true = resting position,
// false = translated off-screen below), so the caller can mount this with
// open=false, flip to true on the next frame for the opening animation, and
// flip back to false before unmounting so the sheet actually slides away
// instead of just vanishing. `onCloseTransitionEnd` fires once the
// slide-down finishes, which is when the caller should unmount.
export function FarmPinSheet({
  farm,
  open,
  onCloseTransitionEnd,
}: {
  farm: FarmSheetData;
  open: boolean;
  onCloseTransitionEnd?: () => void;
}) {
  const status = farmTodayStatus(farm.hours, farm.todayStatus, farm.timezone);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && !open) onCloseTransitionEnd?.();
      }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--bg-raised)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -4px 24px rgba(0,0,0,.18)",
        maxHeight: "80%",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
        transform: `translateY(${open ? "0" : "100%"})`,
        transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      {/* Static header — name, address, status, categories — never scrolls. */}
      <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--border-strong)", margin: "0 auto 14px" }} />

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {farm.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={farm.coverPhotoUrl}
              alt=""
              style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover", border: "1px solid var(--border-subtle)", flexShrink: 0, display: "block" }}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 16, border: "1px dashed var(--border-subtle)", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div className="title-m" style={{ color: "var(--text-primary)" }}>
              {farm.name}
            </div>
            <div style={{ height: 4 }} />
            {farm.address && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text-secondary)" }}>
                <Icon name="pin" size={14} />
                <span className="body-s">
                  {abbreviateAddress(farm.address)}
                  <DistanceLabel lat={farm.lat} lng={farm.lng} />
                </span>
              </div>
            )}
            <div style={{ height: 4 }} />
            <div className="status-row">
              <span className="dot" style={{ background: STATUS_TONE_COLOR[statusTone(status)] }} />
              <span className="label" style={{ color: STATUS_TONE_COLOR[statusTone(status)] }}>
                {status.label}
              </span>
              <span className="detail">&nbsp;{status.note}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {farm.categories.map((c) => (
            <span key={c} className="cat-chip" style={{ background: catBg(c), borderColor: catFg(c), color: catFg(c) }}>
              {c}
            </span>
          ))}
        </div>

        <div style={{ height: 18 }} />
        <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
      </div>

      {/* Only "What's available" scrolls. */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px 0" }}>
        <div className="label-caps">WHAT&apos;S AVAILABLE</div>
        <div style={{ height: 14 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="body-s-strong">Ready now ({farm.ready.length})</span>
          <Link href={`/farms/${farm.id}?from=map`} style={{ color: "var(--info-fg)", fontWeight: 600, fontSize: 14 }}>
            See all
          </Link>
        </div>
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {farm.ready.length ? farm.ready.map((p) => productCard(p, "ready")) : <p className="caption">Nothing marked ready now yet.</p>}
        </div>

        <div style={{ height: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="body-s-strong">Producing ({farm.producing.length})</span>
          <Link href={`/farms/${farm.id}?from=map`} style={{ color: "var(--info-fg)", fontWeight: 600, fontSize: 14 }}>
            See all
          </Link>
        </div>
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {farm.producing.length ? farm.producing.map((p) => productCard(p, "producing")) : <p className="caption">Nothing in progress yet.</p>}
        </div>
        <div style={{ height: 18 }} />
      </div>

      {/* Static footer — never scrolls. */}
      <div style={{ flexShrink: 0, padding: "14px 20px 32px" }}>
        <Link href={`/farms/${farm.id}?from=map`} className="btn btn-primary" style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          See the farm
        </Link>
      </div>
    </div>
  );
}
