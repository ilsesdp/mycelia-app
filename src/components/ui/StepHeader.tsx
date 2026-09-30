// Ports stepHeader() + progressBar(). Figma's Progress component always
// renders 8 segments regardless of "STEP X OF 7" copy — replicated as-is,
// same as the prototype (flagged there, not fixed, per Ilse's call).
export function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  const segs = 8;
  return (
    <>
      <div className="label-caps">STEP {step} OF 7</div>
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
