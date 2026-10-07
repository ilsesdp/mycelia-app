// Ports stepHeader() + progressBar(). Onboarding dropped its address-lookup
// step (Ilse's call, 2026-10-07 — skipping the paid Google geocoding call
// for this phase folds the address field into "Your farm" instead), so this
// is 6 steps now, not 7 — and unlike the prototype's own mismatched 8-segment
// bar (flagged before, left as-is), the segment count now matches the text.
export function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  const segs = 6;
  return (
    <>
      <div className="label-caps">STEP {step} OF 6</div>
      <div style={{ height: 8 }} />
      <div className="progress" style={{ display: "flex", gap: 4, height: 4, width: "100%" }}>
        {Array.from({ length: segs }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: "var(--radius-full)",
              background: i < step ? "var(--interactive-primary)" : "var(--border-default)",
            }}
          />
        ))}
      </div>
      <div style={{ height: 16 }} />
      <div className="title-l" style={{ color: "var(--text-primary)" }}>
        {title}
      </div>
      {subtitle && (
        <>
          <div style={{ height: 8 }} />
          <p className="body-m">{subtitle}</p>
        </>
      )}
      <div style={{ height: 20 }} />
    </>
  );
}
