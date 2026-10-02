import Link from "next/link";

// Ports appbar() from the tested prototype. backHref replaces the
// hash-router's go('screen') call; title is optional center label.
// closeHref ports opts.closeTo — a right-side "×" instead of the left
// chevron+label, used by screens reached as a sheet-like flow (Filters,
// 2.8) rather than a simple back-stack push. `right` is an escape hatch
// for a screen that needs something else entirely on the right (Manage
// markets' Edit/Cancel toggle) — it takes priority over closeHref.
export function AppBar({
  backHref,
  backLabel = "Back",
  title,
  closeHref,
  right,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
  closeHref?: string;
  right?: React.ReactNode;
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
      {right ? (
        right
      ) : closeHref ? (
        <Link href={closeHref} style={{ width: 84, textAlign: "right", fontSize: 18, color: "var(--text-primary)" }}>
          &times;
        </Link>
      ) : (
        <div style={{ width: 84 }} />
      )}
    </div>
  );
}
