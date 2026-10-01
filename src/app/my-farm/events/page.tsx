import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmIdentity, getMyFarmMarkets, type EventRow } from "@/lib/myFarm";
import { OwnerShell } from "@/components/myfarm/OwnerShell";
import { EventCard } from "@/components/myfarm/EventCard";
import { MarketFindUsRow } from "@/components/myfarm/MarketFindUsRow";
import { Icon } from "@/components/ui/Icon";

// Ports SCREENS['4.9'] (owner), SCREENS['4.15'] (empty state, owner and
// public-preview variants) — one route, same preview convention as /my-farm.
export default async function MyFarmEventsPage({ searchParams }: PageProps<"/my-farm/events">) {
  const sp = await searchParams;
  const preview = sp.preview === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const [farm, { data: events }, markets] = await Promise.all([
    getMyFarmIdentity(supabase, farmId),
    supabase.from("events").select("id, name, event_date, starts_at, ends_at, notes, photo_url").eq("farm_id", farmId).order("event_date"),
    getMyFarmMarkets(supabase, farmId),
  ]);
  if (!farm) redirect("/settings");

  const list = (events ?? []) as EventRow[];

  return (
    <OwnerShell farm={farm} activeTab="Events" preview={preview}>
      {list.length === 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="label-caps">Upcoming events</div>
            {!preview && (
              <Link href="/my-farm/events/manage" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
                Manage
              </Link>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 16px 8px" }}>
            <div className="empty-icon-ring">
              <Icon name="calendar" size={26} />
            </div>
            <div className="title-m" style={{ color: "var(--text-primary)", textAlign: "center" }}>
              No events yet
            </div>
            <p className="body-m" style={{ textAlign: "center" }}>
              {preview ? "This farm hasn't added any upcoming events." : "Add a market day or a farm visit so people know when to come."}
            </p>
            {!preview && (
              <>
                <div style={{ height: 6 }} />
                <Link href="/my-farm/events/new?backTo=events" className="btn btn-primary">
                  Add your first event
                </Link>
              </>
            )}
          </div>
          <div style={{ height: 20 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="label-caps">Also find us at</div>
            {!preview && (
              <Link href="/my-farm/markets" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
                Manage
              </Link>
            )}
          </div>
          <div style={{ height: 8 }} />
          <MarketFindUsRow markets={markets} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="label-caps">Upcoming events</div>
            {!preview && (
              <Link href="/my-farm/events/manage" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
                Manage
              </Link>
            )}
          </div>
          <div style={{ height: 14 }} />
          <EventCard ev={list[0]} editable={!preview} backTo="events" />
          {!preview && (
            <>
              <div style={{ height: 16 }} />
              <Link href="/my-farm/events/new?backTo=events" className="btn btn-primary">
                Add an event
              </Link>
            </>
          )}
          <div style={{ height: 24 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="label-caps">Also find us at</div>
            {!preview && (
              <Link href="/my-farm/markets" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
                Manage
              </Link>
            )}
          </div>
          <div style={{ height: 8 }} />
          <MarketFindUsRow markets={markets} />
        </>
      )}
    </OwnerShell>
  );
}
