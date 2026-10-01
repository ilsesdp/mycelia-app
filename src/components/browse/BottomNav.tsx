"use client";

import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

type TabLabel = "Map" | "Messages" | "Profile";
const TABS: readonly [TabLabel, IconName][] = [
  ["Map", "map"],
  ["Messages", "msg"],
  ["Profile", "user"],
];

// Ports navBar3(). "Map" always goes to the real map (2.1), same as the
// prototype's navBar3 ['Map','2.1'] — the list view (2.7/2.9) is reached via
// the view-switch menu on the map, or stays wherever a visitor already is.
// Messages now routes to the real inbox. Profile routes logged-out visitors
// to /welcome, same as before; a logged-in tap now goes to My Farm (4.1,
// group 4, now built) exactly like the prototype's own navBar3 ['Profile',
// '4.1'] — My Farm itself sends a logged-in visitor with no farm on to
// Settings, since there's nothing of theirs to manage there.
export function BottomNav({ active, loggedIn }: { active: TabLabel; loggedIn: boolean }) {
  const router = useRouter();

  function tap(label: TabLabel) {
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
    router.push("/my-farm");
  }

  return (
    <div className="navbar3">
      {TABS.map(([label, icon]) => (
        <a key={label} className={active === label ? "active" : ""} onClick={() => tap(label)}>
          <Icon name={icon} size={20} />
          {label}
        </a>
      ))}
    </div>
  );
}
