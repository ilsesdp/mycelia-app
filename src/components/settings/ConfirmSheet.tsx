"use client";

// Ports sheetOverlay() + logOutSheetInner()/deleteAccountSheetInner_511() —
// a bottom sheet over whichever Settings screen triggered it (5.2 for Log
// out, 5.6 for Delete account), rather than a separate route, matching the
// prototype's own treatment of these as overlays, not navigations.
export function ConfirmSheet({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <>
      <div className="sheet-scrim" onClick={onCancel} />
      <div className="sheet-panel">
        <div className="sheet-grabber" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="title-m" style={{ color: "var(--text-primary)" }}>
            {title}
          </span>
          <span className="sheet-close" style={{ position: "static" }} onClick={onCancel}>
            &times;
          </span>
        </div>
        <div style={{ height: 12 }} />
        <p className="body-m">{body}</p>
        <div style={{ height: 18 }} />
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
        <div style={{ height: 8 }} />
        <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
      </div>
    </>
  );
}
