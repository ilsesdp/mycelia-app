"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppBar } from "@/components/ui/AppBar";
import { useOnboarding } from "@/lib/onboarding/context";

// Ports SCREENS['1.2']. Only the grower path is live — the "looking for
// local farms" option is "Coming soon" in the tested prototype too
// (browsing already works without an account via the homepage).
export default function ChoosePathPage() {
  const router = useRouter();
  const { update } = useOnboarding();

  function choosePath() {
    update({ path: "grower" });
    router.push("/onboarding/address");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/welcome" />
      <div className="px-4 pt-4">
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          What brings you here?
        </div>
        <div style={{ height: 48 }} />

        <button
          onClick={choosePath}
          className="w-full flex flex-col items-center gap-2 text-left"
          style={{
            cursor: "pointer",
            background: "var(--bg-brand-subtle)",
            border: "1px solid #825d17",
            borderRadius: 16,
            padding: 16,
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", height: 126, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/sprouts.png" alt="" width={276} height={126} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <p className="body-m-strong" style={{ textAlign: "center", width: "100%" }}>
            I grow or make things
          </p>
          <p className="body-s-medium" style={{ textAlign: "center", width: "100%" }}>
            Put your farm on the map so people can find you — and so can other growers.
          </p>
        </button>

        <div style={{ height: 32 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            width: "100%",
            height: 240,
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: 16,
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 126,
              border: "1px dashed var(--border-default)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="2">
              <circle cx="12" cy="9" r="3" />
              <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          </div>
          <p className="body-m-strong" style={{ color: "var(--text-disabled)", textAlign: "center", width: "100%" }}>
            I&apos;m looking for local farms
          </p>
          <p className="body-s-medium" style={{ color: "var(--text-disabled)", textAlign: "center", width: "100%" }}>
            Browse the map without an account.
          </p>
          <div
            style={{
              position: "absolute",
              top: 13,
              right: 13,
              background: "var(--border-subtle)",
              border: "1px solid var(--border-default)",
              borderRadius: 999,
              padding: "4px 8px",
            }}
          >
            <span className="body-s-medium" style={{ color: "var(--text-secondary)" }}>
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
