import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettingsContext } from "@/lib/settings";
import { ContactSupportForm } from "@/components/settings/ContactSupportForm";

// Ports SCREENS['5.8'].
export default async function ContactSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { profile, farm } = await getSettingsContext(supabase, user.id);

  return <ContactSupportForm userEmail={profile.contactEmail ?? user.email ?? ""} farmName={farm?.name ?? null} />;
}
