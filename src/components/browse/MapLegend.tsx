import Image from "next/image";

// Same leaf glyph as /icons/icon-farm.svg, inlined so its color can switch
// between the open (brand green) and closed (muted gray) tones the legend
// needs — the static file is only ever the one green version.
const LEAF_PATH =
  "M18.7979 6.9997C15.8689 9.28721 14.7005 11.8725 13.122 15.085C11.824 17.7269 9.71586 19.8667 6.88516 20.8014C9.06596 20.0041 9.1531 16.2609 9.04996 14.1543C8.92751 11.6711 9.14526 9.05252 10.5271 6.9138C13.759 1.91133 20.2974 1.18005 25.5752 0C25.5993 2.64409 25.6373 5.28788 25.5118 7.92878C25.2181 14.097 22.0828 19.6523 16.8237 22.8016C12.3222 25.4816 6.91774 26.423 1.76481 26.5808C1.05494 26.6025 0.629254 26.6074 0.243208 26.6409C0.162377 26.6514 0.0813144 26.66 9.43138e-06 26.6667C0.0808504 26.6565 0.161133 26.6481 0.243208 26.6409C2.0005 26.4142 3.64818 25.3293 5.29278 24.6378C9.19773 23.0411 12.2269 19.6274 13.9327 15.7924C15.7084 11.801 16.9419 9.19007 20.0802 6.07155C19.6013 6.36851 19.2382 6.64852 18.7979 6.9997Z";

// Ports mapLegend(). Open/Closed use the flat farm leaf tinted by status;
// Market uses the orange-circle "m" badge (/icons/icon-market-badge.svg) —
// the plain green "m" (/icons/icon-market.svg) used on Filters/cards reads
// better without a status color to carry, so the legend keeps its own
// circled version.
export function MapLegend() {
  const leafItem = (color: string, label: string) => (
    <div key={label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <svg width="18" height="19" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={LEAF_PATH} fill={color} />
      </svg>
      <span className="caption">{label}</span>
    </div>
  );
  const marketItem = (
    <div key="Market" style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <Image src="/icons/icon-market-badge.svg" alt="" width={18} height={18} />
      <span className="caption">Market</span>
    </div>
  );
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 999,
        padding: "8px 10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.16)",
        display: "flex",
        gap: 14,
        justifyContent: "center",
      }}
    >
      {leafItem("var(--text-brand)", "Open now")}
      {leafItem("var(--text-disabled)", "Closed")}
      {marketItem}
    </div>
  );
}
