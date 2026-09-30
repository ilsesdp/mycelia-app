"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";

// Ports SCREENS['1.5'] — always shown after a search, never skipped.
export default function AddressResultPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const found = state.farmAddressVerified;

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/address" />
      <div className="flex-1 flex flex-col px-6 pt-4">
        <StepHeader step={1} title={found ? "We found this address" : "We couldn't find that address"} />

        {found ? (
          <div
            style={{
              border: "1px solid var(--border-brand)",
              borderRadius: 16,
              background: "var(--bg-raised)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div className="label-caps" style={{ color: "var(--text-warning)" }}>
              FOUND ON GOOGLE MAPS
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 20, height: 20, flexShrink: 0, color: "var(--text-tertiary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="caption">Address</div>
                <div className="body-s-strong">{state.farmAddress}</div>
              </div>
            </div>
            <div
              style={{
                background: "var(--info-bg)",
                border: "1px solid var(--info-border)",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                gap: 8,
              }}
            >
              <span className="body-s" style={{ color: "var(--info-fg)" }}>
                This is just the address. Your farm name, hours, photos and everything else are still up to you on
                the next steps.
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              background: "var(--bg-subtle)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div>
              <div className="body-m-strong" style={{ color: "var(--text-primary)" }}>
                No listing on Google Maps for
              </div>
              <div className="body-s-strong" style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                {state.farmAddress}
              </div>
            </div>
            <div className="body-s" style={{ color: "var(--text-secondary)" }}>
              Plenty of farms aren&apos;t mapped yet — that&apos;s completely normal. You&apos;ll add your farm name,
              address, hours and photos yourself on the next steps.
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <div className="flex flex-col gap-3 pb-6">
          <Button variant="primary" onClick={() => router.push("/onboarding/farm")}>
            {found ? "Looks right" : "Continue"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              update({ farmAddressVerified: false });
              router.push("/onboarding/address");
            }}
          >
            {found ? "Let me fix it" : "Try a different address"}
          </Button>
        </div>
      </div>
    </main>
  );
}
