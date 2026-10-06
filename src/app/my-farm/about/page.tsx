import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId, getMyFarmIdentity } from "@/lib/myFarm";
import { OwnerShell } from "@/components/myfarm/OwnerShell";
import { HoursBox } from "@/components/farm/HoursBox";
import { DirectionsButton } from "@/components/farm/DirectionsButton";
import { ConnectOnline } from "@/components/farm/ConnectOnline";
import Link from "next/link";

// Ports SCREENS['4.8'] (owner). The public-preview render (formerly
// ?preview=1) has been removed. The prototype's "Message {farmName}"
// button is left out here — this is always the owner looking at their own
// farm, and a message-yourself button has no real destination.
export default async function MyFarmAboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  const [farm, { data: farmRow }, { data: profile }] = await Promise.all([
    getMyFarmIdentity(supabase, farmId),
    supabase.from("farms").select("about, directions, website, instagram, facebook").eq("id", farmId).maybeSingle(),
    supabase.from("profiles").select("contact_email, contact_phone, email_visibility, phone_visibility").eq("id", user.id).maybeSingle(),
  ]);
  if (!farm) redirect("/settings");

  const about = farmRow?.about || "Add a sentence or two about your farm from Edit profile.";
  const email = profile?.contact_email || "";
  const phone = profile?.contact_phone || "";
  const showEmail = !!email && profile?.email_visibility !== "nobody";
  const showPhone = !!phone && profile?.phone_visibility !== "nobody";

  return (
    <OwnerShell farm={farm} activeTab="About">
      <div className="label-caps">Your story</div>
      <div style={{ height: 10 }} />
      <p className="body-m" style={{ lineHeight: "20px" }}>
        {about}
      </p>
      <div style={{ height: 20 }} />
      <div className="label-caps">Hours</div>
      <div style={{ height: 8 }} />
      <HoursBox hours={farm.hours} />
      {farmRow?.directions && (
        <>
          <div style={{ height: 20 }} />
          <div className="label-caps">Arrival instructions</div>
          <div style={{ height: 10 }} />
          <p className="body-m" style={{ lineHeight: "20px" }}>
            {farmRow.directions}
          </p>
        </>
      )}
      <div style={{ height: 16 }} />
      <DirectionsButton address={farm.address} />
      {(farmRow?.website || farmRow?.instagram || farmRow?.facebook) && (
        <>
          <div style={{ height: 24 }} />
          <ConnectOnline website={farmRow?.website ?? null} instagram={farmRow?.instagram ?? null} facebook={farmRow?.facebook ?? null} />
        </>
      )}
      <div style={{ height: 24 }} />
      <div className="label-caps">Contact</div>
      {showEmail && <p className="body-s">{email}</p>}
      {showPhone && <p className="body-s">{phone}</p>}
      {!showEmail && !showPhone && (
        <>
          {email || phone ? (
            <>
              <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
                Hidden from visitors.
              </p>
              <div style={{ height: 4 }} />
              <Link href="/settings/privacy" style={{ cursor: "pointer", textDecoration: "none", color: "var(--text-link)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14 }}>
                Change who can see this
              </Link>
            </>
          ) : (
            <p className="body-s" style={{ color: "var(--text-tertiary)" }}>
              Add contact details from Account settings.
            </p>
          )}
        </>
      )}
    </OwnerShell>
  );
}
