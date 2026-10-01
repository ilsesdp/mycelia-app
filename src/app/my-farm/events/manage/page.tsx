import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, type EventRow } from "@/lib/myFarm";
import { AppBar } from "@/components/ui/AppBar";
import { EventCard } from "@/components/myfarm/EventCard";

// Ports SCREENS['4.21'] (stand-in — no Figma spec).
export default async function ManageEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const { data: events } = await supabase.from("events").select("id, name, event_date, starts_at, ends_at, notes, photo_url").eq("farm_id", farmId).order("event_date");
  const list = (events ?? []) as EventRow[];

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/my-farm/events" backLabel="Events" title="Manage events" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {list.length === 0 ? (
          <p className="body-m" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px 0" }}>
            No events yet.
          </p>
        ) : (
          list.map((ev, i) => (
            <div key={ev.id}>
              {i > 0 && <div style={{ height: 8 }} />}
              <EventCard ev={ev} editable backTo="manage" />
            </div>
          ))
        )}
        <div style={{ height: 16 }} />
        <Link href="/my-farm/events/new?backTo=manage" className="btn btn-primary">
          + Add an event
        </Link>
      </div>
    </main>
  );
}
