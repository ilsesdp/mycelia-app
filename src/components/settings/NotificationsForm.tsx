"use client";

import { useEffect, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { ToggleRow } from "@/components/settings/ToggleRow";
import { createClient } from "@/lib/supabase/client";
import { CHANNEL_DB, CHANNEL_DISPLAY } from "@/lib/settings";
import { isPushSupported, getCurrentPushSubscription, enablePush, disablePush } from "@/lib/push";
import type { Database } from "@/lib/types/database";

// A new, independent channel alongside Text/Email below — not a
// replacement for either. Push subscription state lives entirely in this
// browser (service worker + Push API), so unlike every other control on
// this page it can't come from a server prop: it checks itself on mount,
// and the toggle it renders can legitimately differ from one device to the
// next for the same account.
function PushToggleRow() {
  const supabase = createClient();
  // Lazy initializers run during render, not as a setState-in-effect, so
  // the support check itself doesn't need an effect at all — only the
  // async subscription lookup below does.
  const [supported] = useState(() => isPushSupported());
  const [on, setOn] = useState(false);
  const [checking, setChecking] = useState(supported);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    getCurrentPushSubscription()
      .then((sub) => setOn(!!sub))
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle() {
    if (busy || checking) return;
    setBusy(true);
    setError(null);
    try {
      if (on) {
        await disablePush(supabase);
        setOn(false);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sign in to turn this on.");
        await enablePush(supabase, user.id);
        setOn(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update push notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <div className="flex flex-col gap-1">
        <div className="body-m-strong" style={{ color: "var(--text-tertiary)" }}>
          Push notifications
        </div>
        <p className="caption">This browser doesn&apos;t support push notifications.</p>
      </div>
    );
  }

  return (
    <>
      <ToggleRow
        title="Push notifications"
        sub="A notification on this device when someone messages you"
        on={on}
        disabled={checking || busy}
        onToggle={toggle}
      />
      {error && (
        <>
          <div style={{ height: 4 }} />
          <p className="caption" style={{ color: "var(--text-danger)" }}>
            {error}
          </p>
        </>
      )}
    </>
  );
}

const CHANNELS = ["Text", "Email", "Text & Email"] as const;
const MSG_CHANNEL_CAPTION: Record<string, string> = {
  Text: "We'll text you when someone gets in touch.",
  Email: "We'll email you when someone gets in touch.",
  "Text & Email": "We'll text and email you when someone gets in touch.",
};

type Channel = Database["public"]["Enums"]["message_channel_t"];

// Ports SCREENS['5.4'] — every control here saves immediately (no "Save"
// button in the tested design), same as the prototype's own instant
// S.filters-style writes.
//
// `contactPhone` gates "Text"/"Text & Email": there's no phone-verification flow
// in this build (contact_phone is just a free-text field), so rather than
// let someone pick a text channel with no number on file and quietly never
// hear from us, those two segments are disabled until a phone number
// exists, with a note pointing at where to add one.
export function NotificationsForm({
  initialChannel,
  initialMsgOn,
  initialMarketOn,
  initialEventOn,
  initialPause,
  contactPhone,
}: {
  initialChannel: Channel;
  initialMsgOn: boolean;
  initialMarketOn: boolean;
  initialEventOn: boolean;
  initialPause: boolean;
  contactPhone: string | null;
}) {
  const supabase = createClient();
  const [channel, setChannel] = useState(CHANNEL_DISPLAY[initialChannel]);
  const [msgOn, setMsgOn] = useState(initialMsgOn);
  const [marketOn, setMarketOn] = useState(initialMarketOn);
  const [eventOn, setEventOn] = useState(initialEventOn);
  const [pause, setPause] = useState(initialPause);
  const hasPhone = !!contactPhone;

  async function save(
    patch: Partial<{
      message_channel: Channel;
      notif_msg_on: boolean;
      notif_market_on: boolean;
      notif_event_on: boolean;
      notif_pause: boolean;
    }>
  ) {
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
        <div className="label-caps">How you are notified</div>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {CHANNELS.map((v) => {
            const needsPhone = (v === "Text" || v === "Text & Email") && !hasPhone;
            return (
              <button
                key={v}
                className={channel === v ? "active" : ""}
                disabled={needsPhone}
                style={needsPhone ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                onClick={() => {
                  if (needsPhone) return;
                  setChannel(v);
                  save({ message_channel: CHANNEL_DB[v] });
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
        <div style={{ height: 8 }} />
        <p className="caption">{MSG_CHANNEL_CAPTION[channel]}</p>
        {!hasPhone && (
          <>
            <div style={{ height: 4 }} />
            <p className="caption" style={{ color: "var(--text-danger)" }}>
              Add a phone number in Contact information to text you.
            </p>
          </>
        )}

        <div style={{ height: 28 }} />
        <div className="label-caps">Push notifications</div>
        <div style={{ height: 8 }} />
        <PushToggleRow />

        <div style={{ height: 28 }} />
        <div className="label-caps">Notify me about</div>
        <div style={{ height: 8 }} />
        <ToggleRow
          title="New messages"
          sub="When someone sends you a message"
          on={!pause && msgOn}
          disabled={pause}
          onToggle={() => {
            const next = !msgOn;
            setMsgOn(next);
            save({ notif_msg_on: next });
          }}
        />
        <ToggleRow
          title="Upcoming markets"
          sub="The day before a market you're attending"
          on={!pause && marketOn}
          disabled={pause}
          onToggle={() => {
            const next = !marketOn;
            setMarketOn(next);
            save({ notif_market_on: next });
          }}
        />
        <ToggleRow
          title="Upcoming events"
          sub="The day before an event you're hosting"
          on={!pause && eventOn}
          disabled={pause}
          onToggle={() => {
            const next = !eventOn;
            setEventOn(next);
            save({ notif_event_on: next });
          }}
        />

        <div style={{ height: 28 }} />
        <div className="label-caps">Pause notifications</div>
        <div style={{ height: 8 }} />
        <ToggleRow
          title="Pause all notifications"
          sub="You won't receive notifications until you turn this back on"
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
