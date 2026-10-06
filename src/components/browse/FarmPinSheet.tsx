import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DistanceLabel } from "@/components/ui/DistanceLabel";
import { catBg, catFg } from "@/lib/categoryStyle";
import { abbreviateAddress } from "@/lib/geo";
import { farmTodayStatus, statusTone, STATUS_TONE_COLOR, type HourRow, type TodayStatus } from "@/lib/farmStatus";

type Availability = "ready_now" | "producing" | "planning";
export type SheetProduct = { id: string; name: string; qty: string | null; photo_url: string | null; availability: Availability };

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
  todayStatusDate: string | null;
  timezone: string;
  products: SheetProduct[];
  coverPhotoUrl: string | null;
};

const AVAIL_LABEL: Record<Availability, string> = { ready_now: "Ready now", producing: "Producing", planning: "Planning" };
const AVAIL_CLASS: Record<Availability, string> = { ready_now: "avail-ready", producing: "avail-producing", planning: "avail-planning-solid" };
// Ready-now items surface first in the sheet's 3-up preview, same priority
// order as everywhere else products are grouped (AvailRail, onboarding).
const AVAIL_ORDER: Record<Availability, number> = { ready_now: 0, producing: 1, planning: 2 };

function productCard(p: SheetProduct) {
  return (
    <div key={p.id}>
      {p.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.photo_url}
          alt=""
          style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 16, objectFit: "cover", border: "1px solid var(--border-subtle)", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 16, background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }} />
      )}
      <div style={{ height: 8 }} />
      <div className="body-s-strong">{p.name}</div>
      <div className="caption">{p.qty}</div>
      <div style={{ height: 4 }} />
      <span className={`avail ${AVAIL_CLASS[p.availability]}`}>{AVAIL_LABEL[p.availability]}</span>
    </div>
  );
}

// Ports SCREENS['2.2'] — the bottom sheet a tapped farm pin opens, over the
// (now dimmed) map. "View all" and "View farm profile" both go to the
// farm's own pages. The sheet shows at most 3 products (ready-now first),
// in a fixed, non-scrolling 3-up row — no "What's available" scroll
// section anymore — so the sheet stays short enough that the map is still
// visible above it.
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
  const status = farmTodayStatus(farm.hours, farm.todayStatus, farm.timezone, farm.todayStatusDate);
  const preview = [...farm.products].sort((a, b) => AVAIL_ORDER[a.availability] - AVAIL_ORDER[b.availability]).slice(0, 3);
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
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
        transform: `translateY(${open ? "0" : "100%"})`,
        transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div style={{ padding: "12px 20px 0" }}>
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

      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="label-caps">Products</div>
          <Link href={`/farms/${farm.id}/products?from=map`} style={{ color: "var(--info-fg)", fontWeight: 600, fontSize: 14 }}>
            View all ({farm.products.length})
          </Link>
        </div>
        <div style={{ height: 14 }} />
        {preview.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>{preview.map(productCard)}</div>
        ) : (
          <p className="caption">This farm hasn&apos;t listed any products yet.</p>
        )}
        <div style={{ height: 18 }} />
      </div>

      <div style={{ padding: "14px 20px 32px" }}>
        <Link href={`/farms/${farm.id}?from=map`} className="btn btn-primary" style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          View farm profile
        </Link>
      </div>
    </div>
  );
}
