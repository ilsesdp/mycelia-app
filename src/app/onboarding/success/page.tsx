"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "var(--interactive-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: 40 }}>✓</span>
      </div>
      <div style={{ height: 26 }} />
      <div className="title-l" style={{ color: "var(--text-primary)", textAlign: "center" }}>
        You&apos;re on the map
      </div>
      <div style={{ height: 8 }} />
      <p className="body-m" style={{ textAlign: "center" }}>
        Your farm is live. Growers and neighbors can find you now.
      </p>
    </main>
  );
}
