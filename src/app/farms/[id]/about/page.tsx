import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFarmHeader, resolveBackHref } from "@/lib/farmProfile";
import { FarmProfileShell } from "@/components/farm/FarmProfileShell";
import { HoursBox } from "@/components/farm/HoursBox";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { MessageAction } from "@/components/farm/MessageAction";
import { ConnectOnline } from "@/components/farm/ConnectOnline";

// Ports SCREENS['2.4'] — the farm profile's About tab. Contact info comes
// from farm_public_contact, the view that already nulls out email/phone per
// the owner's Everyone/Growers-only/Nobody visibility choice (5.5 Privacy —
// see its definition), so there's no extra filtering to do here: if a field
// comes back null, this visitor simply isn't shown it.
export default async function FarmAboutPage({ params, searchParams }: PageProps<"/farms/[id]/about">) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [farm, { data: hours }, { data: contact }] = await Promise.all([
    getFarmHeader(supabase, id),
    supabase.from("farm_hours").select("day_of_week, open_time, close_time, closed").eq("farm_id", id),
    supabase.from("farm_public_contact").select("contact_email, contact_phone").eq("farm_id", id).maybeSingle(),
  ]);

  if (!farm) notFound();

  return (
    <FarmProfileShell farm={farm} activeTab="About" backHref={resolveBackHref(sp.from)} loggedIn={!!user}>
      <div className="label-caps">Your story</div>
      <div style={{ height: 10 }} />
      <p className="body-m" style={{ lineHeight: "20px" }}>
        {farm.about || "This farm hasn't shared their story yet."}
      </p>
      <div style={{ height: 20 }} />
      <div className="label-caps">Hours</div>
      <div style={{ height: 8 }} />
      <HoursBox hours={hours ?? []} />
      {farm.directions && (
        <>
          <div style={{ height: 20 }} />
          <div className="label-caps">Directions</div>
          <div style={{ height: 10 }} />
          <p className="body-m" style={{ lineHeight: "20px" }}>
            {farm.directions}
          </p>
        </>
      )}
      <div style={{ height: 16 }} />
      <DirectionsButton address={farm.address} />
      {(farm.website || farm.instagram || farm.facebook) && (
        <>
          <div style={{ height: 24 }} />
          <ConnectOnline website={farm.website} instagram={farm.instagram} facebook={farm.facebook} />
        </>
      )}
      <div style={{ height: 24 }} />
      <div className="label-caps">Contact</div>
      {contact?.contact_email && <p className="body-s">{contact.contact_email}</p>}
      {contact?.contact_phone && <p className="body-s">{contact.contact_phone}</p>}
      {!contact?.contact_email && !contact?.contact_phone && (
        <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
          This farm hasn&apos;t shared contact details here.
        </p>
      )}
      <div style={{ height: 8 }} />
      <MessageAction variant="button" farmId={farm.id} farmName={farm.name} loggedIn={!!user} />
    </FarmProfileShell>
  );
}
