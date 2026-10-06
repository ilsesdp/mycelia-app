import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/settings/EditProfileForm";

// Ports SCREENS['5.3'] — edits the same farm row (and the same
// profiles.contact_name) that onboarding collected, not a second copy.
// "Directions" (driving/arrival notes, separate from the structured
// address) has its own column — see farms.directions — and so do
// website/instagram/facebook, both written here and by onboarding's
// Website & social media fields (1.11).
export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const [{ data: farm }, { data: profile }] = await Promise.all([
    supabase.from("farms").select("id, name, address, about, directions, website, instagram, facebook, cover_photo_url").eq("owner_id", user.id).maybeSingle(),
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
      initialWebsite={farm.website ?? ""}
      initialInstagram={farm.instagram ?? ""}
      initialFacebook={farm.facebook ?? ""}
      initialContactName={profile?.contact_name ?? ""}
      initialCoverPhotoUrl={farm.cover_photo_url}
    />
  );
}
