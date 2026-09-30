import Link from "next/link";

// Ports appbar() from the tested prototype. backHref replaces the
// hash-router's go('screen') call; title is optional center label.
export function AppBar({
  backHref,
  backLabel = "Back",
  title,
}: {
  backHref?: string;
  backLabel?: string;
  title?: string;
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
      <div style={{ width: 84 }} />
    </div>
  );
}
