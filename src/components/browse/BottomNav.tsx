"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

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
  const [hasUnread, setHasUnread] = useState(false);

  // BottomNav gets no userId prop (it's used from 8 places, none of which
  // have one handy), so it resolves the current user itself. Realtime is
  // already scoped to messages visible under this user's own RLS (see
  // getMyThreads), so a plain count-of-unread works without filtering by
  // participant explicitly.
  useEffect(() => {
    if (!loggedIn) return;
    const supabase = createClient();
    let myId: string | null = null;

    async function refresh() {
      if (!myId) return;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", myId)
        .is("read_at", null);
      setHasUnread(!!count && count > 0);
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      myId = user.id;
      refresh();
      channel = supabase
        .channel("bottomnav-unread")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, refresh)
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loggedIn]);

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
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Icon name={icon} size={20} />
            {label === "Messages" && hasUnread && (
              <span
                aria-label="Unread messages"
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--text-brand)",
                  border: "1.5px solid var(--bg-canvas)",
                }}
              />
            )}
          </span>
          {label}
        </a>
      ))}
    </div>
  );
}
