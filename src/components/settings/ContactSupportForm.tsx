"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { ToggleRow } from "@/components/settings/ToggleRow";
import { SUPPORT_TOPICS } from "@/lib/settings";

const SUPPORT_EMAIL = "support@mycelia.app";

// Ports SCREENS['5.8']. There's no support-ticket table in the schema (the
// closest candidate, notification_log, tracks outbound notification
// delivery, not inbound tickets), so "Send to support" is a real mailto:
// draft to SUPPORT_EMAIL opened in the visitor's own mail client — honest
// given what's actually wired up, at the cost of the in-app "sent"
// confirmation the prototype mocks. A photo can be previewed here but
// mailto: can't attach files, so it's noted in the body instead rather than
// silently dropped.
export function ContactSupportForm({ userEmail, farmName }: { userEmail: string; farmName: string | null }) {
  const router = useRouter();
  const [topic, setTopic] = useState<(typeof SUPPORT_TOPICS)[number]>(SUPPORT_TOPICS[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [includeAccount, setIncludeAccount] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const canSend = message.trim().length > 0;

  function send() {
    if (!canSend) return;
    const lines = [message.trim(), ""];
    if (includeAccount) {
      lines.push(farmName ? `Farm: ${farmName}` : "Farm: (none)");
      lines.push(`Email: ${userEmail}`);
    }
    if (photoFile) {
      lines.push("", "(A photo was attached in-app — please ask if you need it resent, mailto links can't carry attachments.)");
    }
    const subject = encodeURIComponent(`Mycelia support — ${topic}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    router.push("/settings/help");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Contact support" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, paddingBottom: 24, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div className="label-caps">What&apos;s it about?</div>
        <div style={{ height: 8 }} />
        <div style={{ position: "relative" }}>
          <div
            className="field"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, cursor: "pointer" }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="body-m" style={{ color: "var(--text-primary)" }}>
              {topic}
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>&#8964;</span>
          </div>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setMenuOpen(false)} />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,.18)",
                  overflow: "hidden",
                  zIndex: 61,
                }}
              >
                {SUPPORT_TOPICS.map((t, i) => {
                  const sel = t === topic;
                  return (
                    <div
                      key={t}
                      onClick={() => {
                        setTopic(t);
                        setMenuOpen(false);
                      }}
                      style={{
                        padding: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        borderBottom: i < SUPPORT_TOPICS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        background: sel ? "var(--harvest-green-100)" : "transparent",
                      }}
                    >
                      <span className="body-m" style={{ color: "var(--text-secondary)", flex: 1 }}>
                        {t}
                      </span>
                      {sel && <span style={{ color: "var(--text-brand)" }}>&#10003;</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ height: 20 }} />
        <div className="label-caps">Tell us what happened</div>
        <div style={{ height: 8 }} />
        <textarea
          className="field"
          style={{ height: 120 }}
          placeholder="The more you can tell us, the faster we can help."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div style={{ height: 20 }} />
        <ToggleRow
          title="Include my farm and email"
          sub="So we can find your account without asking"
          on={includeAccount}
          onToggle={() => setIncludeAccount((v) => !v)}
        />

        <div style={{ height: 16 }} />
        <label className="label-caps">Add a photo</label>
        <div style={{ height: 4 }} />
        <PhotoWell
          preview={photo}
          label="Add a photo"
          onPick={(file) => {
            setPhotoFile(file);
            setPhoto(URL.createObjectURL(file));
          }}
          onRemove={() => {
            setPhotoFile(null);
            setPhoto(null);
          }}
        />

        <div style={{ flex: 1, minHeight: 20 }} />
        <p className="caption">We usually reply within two working days. You&apos;ll get our answer the same way you chose to be reached.</p>
        <div style={{ height: 12 }} />
        <button className="btn btn-primary" disabled={!canSend} onClick={send}>
          Send to support
        </button>
      </div>
    </main>
  );
}
