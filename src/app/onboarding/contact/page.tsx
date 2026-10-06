"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding, type OnboardingState } from "@/lib/onboarding/context";
import { VisibilityPill } from "@/components/ui/VisibilityPill";
import { Icon, type IconName } from "@/components/ui/Icon";

const MSG_CHANNELS = ["Text me", "Email me", "Both"] as const;
const MSG_CHANNEL_CAPTION: Record<string, string> = {
  "Text me": "We'll text you when someone gets in touch.",
  "Email me": "We'll email you when someone gets in touch.",
  Both: "We'll text and email you when someone gets in touch.",
};

type SocialField = { key: keyof OnboardingState; icon: IconName; label: string; placeholder: string };
const SOCIAL_FIELDS: SocialField[] = [
  { key: "farmWebsite", icon: "website", label: "Website", placeholder: "https://yourfarm.com" },
  { key: "farmInstagram", icon: "instagram", label: "Instagram", placeholder: "@yourfarm" },
  { key: "farmFacebook", icon: "facebook", label: "Facebook", placeholder: "facebook.com/yourfarm" },
];

// Ports SCREENS['1.11'].
export default function ContactPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/markets" />
      <div className="px-4 pt-4 pb-8 flex-1 flex flex-col">
        <StepHeader step={7} title="How should people reach you?" />

        <label className="label-caps" htmlFor="contact-name">
          Who to ask for (optional)
        </label>
        <div style={{ height: 4 }} />
        <input id="contact-name" className="field" placeholder="Jane" value={state.contactName} onChange={(e) => update({ contactName: e.target.value })} />
        <div style={{ height: 8 }} />
        <p className="caption">Shown next to your farm name, so people know who they&apos;re asking for.</p>
        <div style={{ height: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="label-caps" htmlFor="contact-email">
            Email
          </label>
          <VisibilityPill value={state.emailVisibility} onChange={(v) => update({ emailVisibility: v })} />
        </div>
        <div style={{ height: 4 }} />
        <input id="contact-email" className="field" placeholder="you@example.com" value={state.contactEmail} onChange={(e) => update({ contactEmail: e.target.value })} />
        <div style={{ height: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="label-caps" htmlFor="contact-phone">
            Phone
          </label>
          <VisibilityPill value={state.phoneVisibility} onChange={(v) => update({ phoneVisibility: v })} />
        </div>
        <div style={{ height: 4 }} />
        <input id="contact-phone" className="field" placeholder="(815) 555-0101" value={state.contactPhone} onChange={(e) => update({ contactPhone: e.target.value })} />
        <div style={{ height: 20 }} />

        <div className="label-caps">When someone messages you</div>
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
        <div style={{ height: 20 }} />

        <div className="label-caps">Website &amp; social media (optional)</div>
        <div style={{ height: 4 }} />
        <p className="caption">Add links so people can learn more about your farm.</p>
        <div style={{ height: 8 }} />
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
          {SOCIAL_FIELDS.map((f, i) => (
            <div
              key={f.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ color: "var(--text-secondary)", flexShrink: 0, display: "flex" }}>
                <Icon name={f.icon} size={18} />
              </span>
              <span className="body-s-strong" style={{ width: 76, flexShrink: 0 }}>
                {f.label}
              </span>
              <input
                className="body-s"
                placeholder={f.placeholder}
                value={state[f.key] as string}
                onChange={(e) => update({ [f.key]: e.target.value } as Partial<OnboardingState>)}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "var(--text-primary)" }}
              />
            </div>
          ))}
        </div>
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
