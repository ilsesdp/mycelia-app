import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

// Ports settingsRow() — an icon+title(+sub) row with a trailing chevron,
// used throughout 5.2/5.7. Always a real navigation (Link), never a dead
// row — this group has somewhere real to send every tap.
export function SettingsRow({
  icon,
  title,
  sub,
  href,
  titleColor = "var(--text-secondary)",
  iconColor = "var(--text-secondary)",
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  href: string;
  // Title color. Defaults to the plain secondary text color (the Help
  // center FAQ rows and its own "Contact support" link keep this
  // default); the Settings hub's top-level rows pass the same green as
  // the AppBar titlebar (var(--text-primary)) — not var(--text-brand),
  // which is a different, slightly olive green used elsewhere.
  titleColor?: string;
  // Icon color, independent of titleColor — the Settings hub's rows match
  // this to the muted tertiary icon color Privacy & visibility's own rows
  // use, rather than sharing the title's green.
  iconColor?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      {icon && (
        <span style={{ display: "flex", width: 20, height: 20, flexShrink: 0, color: iconColor }}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="body-m" style={{ color: titleColor }}>
          {title}
        </div>
        {sub && <div className="body-s-medium">{sub}</div>}
      </div>
      <span style={{ color: "var(--text-tertiary)", fontSize: 20, flexShrink: 0 }}>&#8250;</span>
    </Link>
  );
}
