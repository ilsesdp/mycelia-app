"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";

type Market = { id: string; name: string; schedule_text: string | null };

export function MarketsPicker({ markets }: { markets: Market[] }) {
  const router = useRouter();
  const { state, update } = useOnboarding();

  function toggle(id: string) {
    const selected = state.selectedMarketIds.includes(id)
      ? state.selectedMarketIds.filter((m) => m !== id)
      : [...state.selectedMarketIds, id];
    update({ selectedMarketIds: selected });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/hours" />
      <div className="px-4 pt-4 pb-8 flex-1 flex flex-col">
        <StepHeader step={6} title="Do you sell at any markets?" subtitle="Markets near you. If you pick one, people searching it will find your farm." />
        {markets.map((m) => {
          const sel = state.selectedMarketIds.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                cursor: "pointer",
                background: sel ? "var(--harvest-green-100)" : "#fff",
                border: `1px solid ${sel ? "var(--border-brand)" : "var(--border-default)"}`,
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 8,
              }}
            >
              <div className="body-s-strong" style={{ color: "var(--text-primary)" }}>
                {m.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, color: "var(--text-secondary)" }}>{m.schedule_text}</div>
            </div>
          );
        })}
        <div style={{ height: 8 }} />
        <button className="btn btn-secondary" style={{ height: 48 }} onClick={() => router.push("/onboarding/markets/new")}>
          + Add a market that isn&apos;t here
        </button>
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-6">
          <Button variant="primary" onClick={() => router.push("/onboarding/contact")}>
            Continue
          </Button>
          <div style={{ height: 12 }} />
          <Button variant="ghost" onClick={() => router.push("/onboarding/contact")}>
            Skip
          </Button>
        </div>
      </div>
    </main>
  );
}
