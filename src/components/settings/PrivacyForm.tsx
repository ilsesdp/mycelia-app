"use client";

import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { VisibilityPill, type Visibility } from "@/components/ui/VisibilityPill";
import { createClient } from "@/lib/supabase/client";
import { VISIBILITY_DB, VISIBILITY_DISPLAY } from "@/lib/settings";
import type { Database } from "@/lib/types/database";

type VisibilityEnum = Database["public"]["Enums"]["visibility_t"];

// A fixed row (label + a plain "Visible to everyone" line under it, no
// pill, no icon) for the fields the tested design shows but the schema has
// no per-field visibility column for: a published farm's name, products,
// hours, events and markets are always public, with no toggle behind
// them — so these stay fixed rather than becoming a working
// Growers-only/Only-me dropdown (that would say something untrue).
function FixedRow({ label }: { label: string }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="body-m">{label}</div>
      <div className="caption" style={{ color: "var(--text-tertiary)" }}>
        Visible to everyone
      </div>
    </div>
  );
}

function Row({ label, value, onChange }: { label: string; value: Visibility; onChange: (v: Visibility) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span className="body-m" style={{ flex: 1 }}>
        {label}
      </span>
      <VisibilityPill value={value} onChange={onChange} />
    </div>
  );
}

export function PrivacyForm({
  initialEmailVisibility,
  initialPhoneVisibility,
  initialMessageVisibility,
}: {
  initialEmailVisibility: VisibilityEnum;
  initialPhoneVisibility: VisibilityEnum;
  initialMessageVisibility: VisibilityEnum;
}) {
  const supabase = createClient();
  const [emailVis, setEmailVis] = useState<Visibility>(VISIBILITY_DISPLAY[initialEmailVisibility]);
  const [phoneVis, setPhoneVis] = useState<Visibility>(VISIBILITY_DISPLAY[initialPhoneVisibility]);
  const [messageVis, setMessageVis] = useState<Visibility>(VISIBILITY_DISPLAY[initialMessageVisibility]);

  async function save(
    patch: Partial<{ email_visibility: VisibilityEnum; phone_visibility: VisibilityEnum; message_visibility: VisibilityEnum }>
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update(patch).eq("id", user.id);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Privacy & visibility" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <p className="body-m">Choose who can see your information on your farm profile.</p>
        <div style={{ height: 24 }} />

        <div className="label-caps">Public farm profile</div>
        <div style={{ height: 4 }} />
        <p className="caption" style={{ color: "var(--text-tertiary)" }}>
          The following information is visible to everyone and cannot be changed.
        </p>
        <div style={{ height: 10 }} />
        <FixedRow label="Farm name and location" />
        <FixedRow label="Products and availability" />
        <FixedRow label="Opening hours" />
        <FixedRow label="Events" />
        <FixedRow label="Markets" />

        <div style={{ height: 20 }} />
        <div className="label-caps">Contact & messaging</div>
        <div style={{ height: 4 }} />
        <Row
          label="Email address"
          value={emailVis}
          onChange={(v) => {
            setEmailVis(v);
            save({ email_visibility: VISIBILITY_DB[v] });
          }}
        />
        <Row
          label="Phone number"
          value={phoneVis}
          onChange={(v) => {
            setPhoneVis(v);
            save({ phone_visibility: VISIBILITY_DB[v] });
          }}
        />
        <Row
          label="Who can message you"
          value={messageVis}
          onChange={(v) => {
            setMessageVis(v);
            save({ message_visibility: VISIBILITY_DB[v] });
          }}
        />
      </div>
    </main>
  );
}
