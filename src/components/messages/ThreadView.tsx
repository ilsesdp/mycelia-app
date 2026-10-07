"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { relativeWhen, markThreadRead, type MessageRow, type ThreadStartCheck } from "@/lib/messages";

// Ports SCREENS['3.3'] — a conversation thread with its composer. Works in
// two modes: an existing thread (threadId set, messages already loaded) or
// a brand-new one (threadId null, reached via a farm's "Message" button
// before either side has sent anything) — ports sendComposerMessage()'s own
// "first message creates the thread" behavior, via message_threads' unique
// (farm_id, counterpart_id) constraint instead of an in-memory THREADS push.
export function ThreadView({
  myId,
  threadId: initialThreadId,
  farmId,
  title,
  initialMessages,
  backHref,
  threadStartCheck = "allowed",
}: {
  myId: string;
  threadId: string | null;
  farmId: string;
  title: string;
  initialMessages: MessageRow[];
  backHref: string;
  // Only meaningful for a brand-new thread (no messages yet): whether this
  // farm's "Who can message you" (Privacy & visibility) lets this visitor
  // start one — "growers_only" means they'd need a published farm of their
  // own, "nobody" means the owner has turned messaging off entirely. An
  // already-started conversation is always "allowed", however the setting
  // reads now (see canStartThread in lib/messages.ts).
  threadStartCheck?: ThreadStartCheck;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [threadId, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canMessage = threadStartCheck === "allowed";

  // Jump to the newest message on first load, once — the inner wrapper's
  // justify-content: flex-end (below) already visually bottom-anchors a
  // short thread that doesn't fill the viewport, but a long one needs an
  // actual scroll, same as the scrollTo calls below do after sending/
  // receiving a message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, []);

  // Live-append messages the other side sends while this conversation is
  // open, and keep read_at current so the inbox dot and nav badge clear —
  // both read the same column, so marking read here is all either needs.
  // A brand-new thread (threadId null) has nothing to subscribe to yet;
  // sending the first message re-renders with a real id, which re-runs
  // this effect and subscribes from then on.
  useEffect(() => {
    if (!threadId) return;
    markThreadRead(supabase, threadId, myId);

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; body: string; created_at: string };
          setMessages((m) => (m.some((existing) => existing.id === row.id) ? m : [...m, { id: row.id, senderId: row.sender_id, body: row.body, when: relativeWhen(row.created_at) }]));
          if (row.sender_id !== myId) markThreadRead(supabase, threadId, myId);
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending || !canMessage) return;
    setSending(true);

    let tid = threadId;
    if (!tid) {
      const { data, error } = await supabase
        .from("message_threads")
        .upsert({ farm_id: farmId, counterpart_id: myId }, { onConflict: "farm_id,counterpart_id" })
        .select("id")
        .single();
      if (error || !data) {
        setSending(false);
        return;
      }
      tid = data.id;
      setThreadId(tid);
    }

    const { data: inserted, error: msgError } = await supabase
      .from("messages")
      .insert({ thread_id: tid, sender_id: myId, body: text })
      .select("id, sender_id, body, created_at")
      .single();

    setSending(false);
    if (msgError || !inserted) return;

    setMessages((m) => [...m, { id: inserted.id, senderId: inserted.sender_id, body: inserted.body, when: relativeWhen(inserted.created_at) }]);
    setDraft("");
    if (!initialThreadId) router.replace(`/messages/${tid}`);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  return (
    // Fixed to the viewport height and non-scrolling, not min-h-screen: the
    // header and composer below are meant to stay put while only the
    // message list in between scrolls, not ride along with a page scroll
    // (same 100vh-vs-visual-viewport quirk as MapView — min-h-screen left
    // enough rubber-band scroll on mobile Safari for the header/composer to
    // drift off-screen).
    <main className="flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
      <AppBar backHref={backHref} title={title} />
      {/* overflow-y:auto lives on this plain block element only — putting
          display:flex + justify-content:flex-end directly on the same
          element that scrolls breaks scrollHeight in every browser (it
          stops counting the content pushed past the flex line as
          overflow), which is what made this unscrollable. The flex/
          flex-end wrapper that bottom-anchors a short thread goes one
          level in instead, on minHeight:100% rather than the scrolling
          element itself. */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div className="col" style={{ padding: "16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ color: "var(--text-brand)" }}>
                <Icon name="lock" size={16} />
              </span>
              <span className="caption">Messages stay inside Mycelia.</span>
            </div>
            <div style={{ height: 20 }} />
            {messages.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 40, textAlign: "center" }}>
                <span className="caption">
                  {threadStartCheck === "allowed"
                    ? "Send the first message to start the conversation."
                    : threadStartCheck === "growers_only"
                      ? `${title} only accepts messages from growers with a published farm.`
                      : `${title} isn't accepting messages right now.`}
                </span>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === myId;
                return (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          maxWidth: 272,
                          background: mine ? "var(--interactive-primary)" : "var(--bg-raised)",
                          border: mine ? undefined : "1px solid var(--border-default)",
                          borderRadius: mine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                          padding: 12,
                        }}
                      >
                        <p className="body-m" style={{ color: mine ? "var(--text-on-brand)" : "var(--text-primary)" }}>
                          {m.body}
                        </p>
                      </div>
                    </div>
                    <div style={{ height: 4 }} />
                    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <span className="caption">{m.when}</span>
                    </div>
                    <div style={{ height: 8 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {canMessage ? (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "12px 16px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-raised)",
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            type="text"
            placeholder="Write a message"
            className="search-field-input"
            style={{
              flex: 1,
              height: 48,
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-canvas)",
              padding: "0 12px",
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            style={{
              height: 48,
              padding: "12px 16px",
              border: "none",
              borderRadius: "var(--radius-md)",
              background: "var(--interactive-primary)",
              color: "var(--text-on-brand)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              opacity: sending || !draft.trim() ? 0.6 : 1,
            }}
          >
            Send
          </button>
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            padding: "14px 16px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-raised)",
            textAlign: "center",
          }}
        >
          <span className="caption">
            {threadStartCheck === "growers_only"
              ? `${title} only accepts messages from growers with a published farm.`
              : `${title} isn't accepting messages right now.`}
          </span>
        </div>
      )}
    </main>
  );
}
