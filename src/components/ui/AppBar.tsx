import Link from "next/link";

// Ports appbar() from the tested prototype. backHref replaces the
// hash-router's go('screen') call; title is optional center label.
// closeHref ports opts.closeTo — a right-side "×" instead of the left
// chevron+label, used by screens reached as a sheet-like flow (Filters,
// 2.8) rather than a simple back-stack push.
export function AppBar({
  backHref,
  backLabel = "Back",
  title,
  closeHref,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
  closeHref?: string;
}) {
  return (
    <div className="appbar">
      {backHref ? (
        <Link href={backHref} className="back">
          <span style={{ fontSize: 18, lineHeight: 1 }}>&lsaquo;</span>
          {backLabel}
        </Link>
      ) : (
        <div style={{ width: 44 }} />
      )}
      <div className="titlebar">{title || ""}</div>
      {closeHref ? (
        <Link href={closeHref} style={{ width: 84, textAlign: "right", fontSize: 18, color: "var(--text-primary)" }}>
          &times;
        </Link>
      ) : (
        <div style={{ width: 84 }} />
      )}
    </div>
  );
}
