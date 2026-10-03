import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/settings/EditProfileForm";

// Ports SCREENS['5.3'] — edits the same farm row (and the same
// profiles.contact_name) that onboarding collected, not a second copy.
// The Instagram/Facebook/Website fields are left out: no column for any of
// them exists in the schema yet, same reason the About tab's own Follow
// section is omitted. "Directions" (driving/arrival notes, separate from the
// structured address) does have its own column — see farms.directions.
export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const [{ data: farm }, { data: profile }] = await Promise.all([
    supabase.from("farms").select("id, name, address, about, directions, cover_photo_url").eq("owner_id", user.id).maybeSingle(),
    supabase.from("profiles").select("contact_name").eq("id", user.id).maybeSingle(),
  ]);

  if (!farm) redirect("/settings");

  return (
    <EditProfileForm
      farmId={farm.id}
      initialName={farm.name}
      initialAddress={farm.address ?? ""}
      initialAbout={farm.about ?? ""}
      initialDirections={farm.directions ?? ""}
      initialContactName={profile?.contact_name ?? ""}
      initialCoverPhotoUrl={farm.cover_photo_url}
    />
  );
}
