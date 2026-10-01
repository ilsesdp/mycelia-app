"use client";

import { useRouter } from "next/navigation";

const TABS = [
  ["Map", "🗺"],
  ["Messages", "💬"],
  ["Profile", "👤"],
] as const;

// Ports navBar3(). "Map" always goes to the real map (2.1), same as the
// prototype's navBar3 ['Map','2.1'] — the list view (2.7/2.9) is reached via
// the view-switch menu on the map, or stays wherever a visitor already is.
// Messages now routes to the real inbox. Profile routes logged-out visitors
// to /welcome, same as before; the logged-in My Farm dashboard (group 4)
// still isn't built, so a logged-in tap goes to Settings (group 5, now
// built) rather than the farm admin view the prototype's gear icon reaches —
// the closest real destination until 4.1 exists.
export function BottomNav({ active, loggedIn }: { active: "Map" | "Messages" | "Profile"; loggedIn: boolean }) {
  const router = useRouter();

  function tap(label: (typeof TABS)[number][0]) {
    if (label === "Map") {
      router.push("/map");
      return;
    }
    if (!loggedIn) {
      router.push("/welcome");
      return;
    }
    if (label === "Messages") {
      router.push("/messages");
      return;
    }
    router.push("/settings");
  }

  return (
    <div className="navbar3">
      {TABS.map(([label, icon]) => (
        <a key={label} className={active === label ? "active" : ""} onClick={() => tap(label)}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          {label}
        </a>
      ))}
    </div>
  );
}
