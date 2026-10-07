import { Icon, type IconName } from "@/components/ui/Icon";

// Same bordered-rows treatment as ConnectOnline (border, radius, row
// padding, divider, icon color) — Ilse's call (2026-10-07): the Contact
// section should read as one family with Connect online, and with Hours'
// own border/row-separator style, instead of the plain unbordered lines
// it had before. Each row renders only when its field has a value, so a
// farm with just a phone number gets a single-row box, same as
// ConnectOnline with one link set.
export function ContactBox({ rows }: { rows: { icon: IconName; label: string }[] }) {
  if (!rows.length) return null;

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {rows.map((r, i) => (
        <div
          key={r.icon}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ color: "var(--text-secondary)", flexShrink: 0, display: "flex" }}>
            <Icon name={r.icon} size={18} />
          </span>
          <span className="body-s" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}
