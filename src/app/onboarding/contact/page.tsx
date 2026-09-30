"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";

const VIS_OPTIONS = ["Growers only", "Everyone", "Nobody"] as const;
const MSG_CHANNELS = ["Text me", "Email me", "Both"] as const;
const MSG_CHANNEL_CAPTION: Record<string, string> = {
  "Text me": "We'll text you when someone gets in touch.",
  "Email me": "We'll email you when someone gets in touch.",
  Both: "We'll text and email you when someone gets in touch.",
};

// Ports SCREENS['1.11']. The prototype's visibility control is a custom
// tap-to-open dropdown pill; a native select carries the same choice
// (Growers only / Everyone / Nobody) with far less code for the same
// outcome, so that's what this uses.
export default function ContactPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/markets" />
      <div className="px-6 pt-4 pb-8 flex-1 flex flex-col">
        <StepHeader step={7} title="How should people reach you?" />

        <label className="label-caps">Who to ask for (optional)</label>
        <div style={{ height: 4 }} />
        <input className="field" placeholder="Jane" value={state.contactName} onChange={(e) => update({ contactName: e.target.value })} />
        <div style={{ height: 8 }} />
        <p className="caption">Shown next to your farm name, so people know who they&apos;re asking for.</p>
        <div style={{ height: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="label-caps">Email</label>
          <select
            className="field"
            style={{ width: 150, height: 34, padding: "4px 8px", fontSize: 13 }}
            value={state.emailVisibility}
            onChange={(e) => update({ emailVisibility: e.target.value as (typeof VIS_OPTIONS)[number] })}
          >
            {VIS_OPTIONS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{ height: 4 }} />
        <input className="field" placeholder="you@example.com" value={state.contactEmail} onChange={(e) => update({ contactEmail: e.target.value })} />
        <div style={{ height: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="label-caps">Phone</label>
          <select
            className="field"
            style={{ width: 150, height: 34, padding: "4px 8px", fontSize: 13 }}
            value={state.phoneVisibility}
            onChange={(e) => update({ phoneVisibility: e.target.value as (typeof VIS_OPTIONS)[number] })}
          >
            {VIS_OPTIONS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div style={{ height: 4 }} />
        <input className="field" placeholder="(815) 555-0101" value={state.contactPhone} onChange={(e) => update({ contactPhone: e.target.value })} />
        <div style={{ height: 20 }} />

        <label className="label-caps">When someone messages you</label>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {MSG_CHANNELS.map((v) => (
            <button key={v} className={state.messageChannel === v ? "active" : ""} onClick={() => update({ messageChannel: v })}>
              {v}
            </button>
          ))}
        </div>
        <div style={{ height: 8 }} />
        <p className="caption">{MSG_CHANNEL_CAPTION[state.messageChannel]}</p>
        {state.messageChannel !== "Email me" && (
          <>
            <div style={{ height: 10 }} />
            <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "10px 12px" }}>
              <div className="caption" style={{ color: "var(--text-tertiary)" }}>
                What you&apos;ll get by text
              </div>
              <div className="body-s" style={{ color: "var(--text-primary)" }}>
                Mycelia: You have a new message from a grower or visitor. Reply here or log in to view and reply: mycelia.app/m/7x2k
              </div>
            </div>
          </>
        )}
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-6">
          <Button variant="primary" onClick={() => router.push("/onboarding/preview")}>
            See how it looks
          </Button>
        </div>
      </div>
    </main>
  );
}
