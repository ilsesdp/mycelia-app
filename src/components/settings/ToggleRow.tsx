// Ports toggleRow() — title+subtitle with a .toggle switch, used by 5.4's
// "Tell me when"/"Quiet" sections and 5.8's "Include my farm and email".
export function ToggleRow({
  title,
  sub,
  on,
  onToggle,
  disabled,
}: {
  title: string;
  sub?: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", opacity: disabled ? 0.5 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="body-m" style={{ color: "var(--text-primary)" }}>
          {title}
        </div>
        {sub && <div className="body-s-medium">{sub}</div>}
      </div>
      <div className={`toggle ${on ? "on" : ""}`} onClick={disabled ? undefined : onToggle} style={{ cursor: disabled ? "default" : "pointer" }}>
        <div className="track" />
      </div>
    </div>
  );
}
