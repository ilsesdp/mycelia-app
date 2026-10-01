"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Ports msgCorner() (icon variant) and the About tab's "Message {name}"
// button (button variant). Messaging (group 3) isn't built yet, so both
// surface the same inline "coming soon" note as BottomNav's Messages tab,
// rather than a dead link.
export function MessageAction({ variant, farmName }: { variant: "corner" | "button"; farmName: string }) {
  const [note, setNote] = useState(false);

  function tap() {
    setNote(true);
    setTimeout(() => setNote(false), 1800);
  }

  if (variant === "corner") {
    return (
      <div className="msgbtn-corner" style={{ position: "relative" }}>
        <div className="btn-round" style={{ color: "var(--text-secondary)" }} onClick={tap}>
          <Icon name="msg" size={20} />
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Message</div>
        {note && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 60,
              background: "var(--text-primary)",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              whiteSpace: "nowrap",
              zIndex: 5,
            }}
          >
            Messaging is coming soon
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-primary" onClick={tap}>
        Message {farmName}
      </button>
      {note && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -36,
            transform: "translateX(-50%)",
            background: "var(--text-primary)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          Messaging is coming soon
        </div>
      )}
    </div>
  );
}
