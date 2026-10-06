"use client";

import { Icon, type IconName } from "@/components/ui/Icon";

export type SocialLinksValue = { website: string; instagram: string; facebook: string };

const FIELDS: { key: keyof SocialLinksValue; icon: IconName; label: string; placeholder: string }[] = [
  { key: "website", icon: "website", label: "Website", placeholder: "https://yourfarm.com" },
  { key: "instagram", icon: "instagram", label: "Instagram", placeholder: "@yourfarm" },
  { key: "facebook", icon: "facebook", label: "Facebook", placeholder: "facebook.com/yourfarm" },
];

// Shared editable "Website & social media" field list — onboarding's
// reach-preferences step (1.11) and Edit profile (5.3) both collect the
// same three values into the same farms.website/instagram/facebook
// columns, so they use the same bordered icon-row layout. The read-only
// rendering of these same values is ConnectOnline, on the About tab.
export function SocialLinksFields({ value, onChange }: { value: SocialLinksValue; onChange: (key: keyof SocialLinksValue, v: string) => void }) {
  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {FIELDS.map((f, i) => (
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
            value={value[f.key]}
            onChange={(e) => onChange(f.key, e.target.value)}
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", color: "var(--text-primary)" }}
          />
        </div>
      ))}
    </div>
  );
}
