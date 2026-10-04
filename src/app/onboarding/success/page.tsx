"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

// Icons, not emoji — raw emoji characters render inconsistently across
// platforms/fonts (looked fine on some devices, showed as plain or
// mismatched glyphs elsewhere, e.g. on Vercel's preview). The app's own
// Icon set renders identically everywhere.
const ROWS: [IconName, string, string][] = [
  ["pin", "You appear on the map", "Anyone searching nearby can see your farm and what's ready."],
  ["msg", "Messages come to your inbox", "People get in touch through Mycelia — your number stays private."],
  ["clock", "Change your hours any time", "Closing early or shut for the day takes two taps."],
];

// Ports SCREENS['1.13'] — lands the newly-published farm on the map (2.1)
// after a beat, same as the prototype's auto-advance. The beat was 1800ms,
// too short to actually read the three "what happens now" rows below —
// stretched to 6s and made tappable/dismissable (tapping anywhere advances
// immediately) so reading them isn't a race against a timer no one asked for.
export default function OnboardingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/map"), 6000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-6"
      onClick={() => router.push("/map")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push("/map");
      }}
      style={{ cursor: "pointer" }}
    >
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
            color: "var(--text-on-brand)",
          }}
        >
          <Icon name="check" size={40} />
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
                color: "var(--interactive-primary)",
              }}
            >
              <Icon name={icon} size={18} />
            </div>
            <div>
              <div className="body-m-strong">{title}</div>
              <div className="caption">{desc}</div>
            </div>
          </div>
        ))}
        <div style={{ height: 8 }} />
        <p className="caption" style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
          Tap anywhere to continue
        </p>
      </div>
    </main>
  );
}
