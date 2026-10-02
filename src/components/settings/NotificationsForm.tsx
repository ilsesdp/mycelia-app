"use client";

import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { ToggleRow } from "@/components/settings/ToggleRow";
import { createClient } from "@/lib/supabase/client";
import { CHANNEL_DB, CHANNEL_DISPLAY } from "@/lib/settings";
import type { Database } from "@/lib/types/database";

const CHANNELS = ["Text me", "Email me", "Both"] as const;
const MSG_CHANNEL_CAPTION: Record<string, string> = {
  "Text me": "We'll text you when someone gets in touch.",
  "Email me": "We'll email you when someone gets in touch.",
  Both: "We'll text and email you when someone gets in touch.",
};

type Channel = Database["public"]["Enums"]["message_channel_t"];

// Ports SCREENS['5.4'] — every control here saves immediately (no "Save"
// button in the tested design), same as the prototype's own instant
// S.filters-style writes.
export function NotificationsForm({
  initialChannel,
  initialMsgOn,
  initialMarketOn,
  initialPause,
}: {
  initialChannel: Channel;
  initialMsgOn: boolean;
  initialMarketOn: boolean;
  initialPause: boolean;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState(CHANNEL_DISPLAY[initialChannel]);
  const [msgOn, setMsgOn] = useState(initialMsgOn);
  const [marketOn, setMarketOn] = useState(initialMarketOn);
  const [pause, setPause] = useState(initialPause);

  async function save(patch: Partial<{ message_channel: Channel; notif_msg_on: boolean; notif_market_on: boolean; notif_pause: boolean }>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update(patch).eq("id", user.id);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Notifications" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <div className="label-caps">How we reach you</div>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {CHANNELS.map((v) => (
            <button
              key={v}
              className={channel === v ? "active" : ""}
              onClick={() => {
                setChannel(v);
                save({ message_channel: CHANNEL_DB[v] });
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ height: 8 }} />
        <p className="caption">{MSG_CHANNEL_CAPTION[channel]}</p>

        <div style={{ height: 28 }} />
        <div className="label-caps">Tell me when</div>
        <div style={{ height: 8 }} />
        <ToggleRow
          title="Someone messages you"
          sub="A grower or a visitor writes to you"
          on={!pause && msgOn}
          disabled={pause}
          onToggle={() => {
            const next = !msgOn;
            setMsgOn(next);
            save({ notif_msg_on: next });
          }}
        />
        <ToggleRow
          title="The day before a market"
          sub="Only markets you're listed at"
          on={!pause && marketOn}
          disabled={pause}
          onToggle={() => {
            const next = !marketOn;
            setMarketOn(next);
            save({ notif_market_on: next });
          }}
        />

        <div style={{ height: 28 }} />
        <div className="label-caps">Quiet</div>
        <div style={{ height: 8 }} />
        <ToggleRow
          title="Pause everything"
          sub="Nothing reaches you until you turn this back on"
          on={pause}
          onToggle={() => {
            const next = !pause;
            setPause(next);
            save({ notif_pause: next });
          }}
        />
        <div style={{ height: 10 }} />
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0, display: "flex", width: 16, height: 16, color: "var(--text-tertiary)" }}>
            <Icon name="info" size={16} />
          </span>
          <span className="body-s" style={{ flex: 1 }}>
            People can still message you while this is on — you just won&apos;t be told about it.
          </span>
        </div>
      </div>
    </main>
  );
}
