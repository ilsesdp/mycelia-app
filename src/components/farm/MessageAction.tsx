"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// Ports msgCorner() (icon variant) and the About tab's "Message {name}"
// button (button variant). Now that Messaging (group 3) is built, both open
// /messages/farm/[farmId] — a logged-out tap goes to /welcome first, same
// as BottomNav's Profile tab already does for logged-out visitors.
export function MessageAction({
  variant,
  farmId,
  farmName,
  loggedIn,
}: {
  variant: "corner" | "button";
  farmId: string;
  farmName: string;
  loggedIn: boolean;
}) {
  const router = useRouter();

  function tap() {
    router.push(loggedIn ? `/messages/farm/${farmId}` : "/welcome");
  }

  if (variant === "corner") {
    return (
      <div className="msgbtn-corner">
        <div className="btn-round" style={{ color: "var(--text-secondary)" }} onClick={tap}>
          <Icon name="msg" size={20} />
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>Message</div>
      </div>
    );
  }

  return (
    <button className="btn btn-primary" onClick={tap}>
      Message {farmName}
    </button>
  );
}
