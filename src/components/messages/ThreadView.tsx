"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { relativeWhen, type MessageRow } from "@/lib/messages";

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
}: {
  myId: string;
  threadId: string | null;
  farmId: string;
  title: string;
  initialMessages: MessageRow[];
  backHref: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [threadId, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
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
    <main className="flex flex-col min-h-screen">
      <AppBar backHref={backHref} title={title} />
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div className="col" style={{ padding: "16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ color: "var(--text-brand)" }}>
              <Icon name="lock" size={16} />
            </span>
            <span className="caption">Messages stay inside Mycelia.</span>
          </div>
          <div style={{ height: 20 }} />
          {messages.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
              <span className="caption">Send the first message to start the conversation.</span>
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
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "12px 24px",
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
          style={{
            flex: 1,
            height: 48,
            border: "1px solid var(--border-default)",
            borderRadius: "var(--r-sm)",
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
            borderRadius: "var(--r-md)",
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
    </main>
  );
}
