import { pinImageSrc } from "@/lib/mapPins";

// Ports mapLegend().
export function MapLegend() {
  const item = (kind: "farm" | "market", state: "open" | "closed" | "closed-early", label: string) => (
    <div key={label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={pinImageSrc(kind, state)} alt="" width={20} height={20} />
      <span className="caption">{label}</span>
    </div>
  );
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border-subtle)",
        borderRadius: 999,
        padding: "8px 10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.16)",
        display: "flex",
        gap: 14,
        justifyContent: "center",
      }}
    >
      {item("farm", "open", "Open")}
      {item("farm", "closed", "Closed")}
      {item("market", "open", "Market")}
    </div>
  );
}
