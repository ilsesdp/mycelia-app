// No-photo placeholder for a farm or market avatar/thumbnail — green +
// white leaf mark for farms, golden + white "m" mark for markets. Color and
// mark both confirmed off Figma: the farm treatment matches the "Farm hero"
// component (harvest-green/900 fill behind the white Mycelia leaf mark),
// and the market treatment reuses the market map pin's golden-500 fill
// with the same white "m" mark used on the map legend's market badge.
export type EntityKind = "farm" | "market";

const BG: Record<EntityKind, string> = {
  farm: "var(--harvest-green-900)",
  market: "var(--golden-500)",
};

const MARK: Record<EntityKind, string> = {
  farm: "/icons/icon-farm-mark-white.svg",
  market: "/icons/icon-market-mark-white.svg",
};

export function EntityPhoto({
  kind,
  markScale = 0.42,
  className,
  style,
}: {
  kind: EntityKind;
  /** Mark size as a fraction of the tile's own size (42% matches the category-photo placeholder convention and the Figma hero's 60px mark on a 390px-wide hero). */
  markScale?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: BG[kind],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MARK[kind]}
        alt=""
        style={{ width: `${markScale * 100}%`, height: `${markScale * 100}%`, objectFit: "contain", display: "block" }}
      />
    </div>
  );
}
