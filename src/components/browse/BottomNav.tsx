"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TABS = [
  ["Map", "🗺"],
  ["Messages", "💬"],
  ["Profile", "👤"],
] as const;

// Ports navBar3(). "Map" always goes to the real map (2.1), same as the
// prototype's navBar3 ['Map','2.1'] — the list view (2.7/2.9) is reached via
// the view-switch menu on the map, or stays wherever a visitor already is.
// Messages (group 4) and My Farm (group 5) aren't built yet, so they
// surface an inline "coming soon" note instead of a dead link. Profile does
// route logged-out visitors to /welcome, since that's a real and useful
// destination for that tap today.
export function BottomNav({ active, loggedIn }: { active: "Map" | "Messages" | "Profile"; loggedIn: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);

  function tap(label: (typeof TABS)[number][0]) {
    if (label === "Map") {
      router.push("/map");
      return;
    }
    if (label === "Profile" && !loggedIn) {
      router.push("/welcome");
      return;
    }
    setNote(`${label === "Messages" ? "Messages" : "My Farm"} is coming soon`);
    setTimeout(() => setNote(null), 1800);
  }

  return (
    <>
      {note && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 78,
            display: "flex",
            justifyContent: "center",
            zIndex: 51,
          }}
        >
          <div style={{ background: "var(--text-primary)", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>{note}</div>
        </div>
      )}
      <div className="navbar3">
        {TABS.map(([label, icon]) => (
          <a key={label} className={active === label ? "active" : ""} onClick={() => tap(label)}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
