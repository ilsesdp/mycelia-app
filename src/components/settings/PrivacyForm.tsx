"use client";

import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { VisibilityPill, type Visibility } from "@/components/ui/VisibilityPill";
import { createClient } from "@/lib/supabase/client";
import { VISIBILITY_DB, VISIBILITY_DISPLAY } from "@/lib/settings";
import type { Database } from "@/lib/types/database";

type VisibilityEnum = Database["public"]["Enums"]["visibility_t"];

// A fixed, non-interactive "Everyone" pill for the rows the tested design
// shows but the schema has no per-field visibility column for: a published
// farm's name, products, hours, events and markets are always public, with
// no toggle behind them — so these stay fixed rather than becoming a
// working Growers-only/Only-me dropdown (that would say something untrue).
// It shares the same `.visibility-pill` look as the real dropdown below —
// no chevron since there's nothing to open — so it reads as one consistent
// family of pills, just this one isn't clickable. "Who can message you" was
// one of these too until message_visibility (see Row below) made it real:
// enforced in message_threads_insert's RLS policy, not just this label.
function FixedRow({ label }: { label: string }) {
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
      <span className="visibility-pill" style={{ cursor: "default" }}>
        <Icon name="eye" size={16} />
        <span>Everyone</span>
      </span>
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
        <p className="body-m">You choose what&apos;s public.</p>
        <div style={{ height: 24 }} />

        <div className="label-caps">Your farm page</div>
        <div style={{ height: 4 }} />
        <FixedRow label="Farm name and location" />
        <FixedRow label="What's available" />
        <FixedRow label="Opening hours" />
        <FixedRow label="Events" />
        <FixedRow label="Markets" />

        <div style={{ height: 20 }} />
        <div className="label-caps">Contact and messages</div>
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
