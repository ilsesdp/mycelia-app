"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROWS: [string, string, string][] = [
  ["📍", "You appear on the map", "Anyone searching nearby can see your farm and what's ready."],
  ["💬", "Messages come to your inbox", "People get in touch through Mycelia — your number stays private."],
  ["🕐", "Change your hours any time", "Closing early or shut for the day takes two taps."],
];

// Ports SCREENS['1.13'] — lands the newly-published farm on the homepage
// (2.1's app-level stand-in) after a beat, same as the prototype's
// auto-advance to the Map. The owner reaches "My farm" later via a nav
// entry, once that screen exists (T4 — not built yet).
export default function OnboardingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/"), 1800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-6">
      <div style={{ margin: "0 auto", maxWidth: 340, width: "100%" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "var(--interactive-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <span style={{ color: "#fff", fontSize: 32 }}>✓</span>
        </div>
        <div style={{ height: 26 }} />
        <div className="display-xl" style={{ color: "var(--text-primary)", textAlign: "center" }}>
          You&apos;re on the map
        </div>
        <div style={{ height: 42 }} />
        <div className="label-caps" style={{ color: "var(--text-secondary)" }}>
          What happens now
        </div>
        <div style={{ height: 12 }} />
        {ROWS.map(([icon, title, desc]) => (
          <div key={title} style={{ display: "flex", gap: 12, padding: "12px 0", alignItems: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "var(--harvest-green-100)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
            <div>
              <div className="body-m-strong">{title}</div>
              <div className="caption">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
