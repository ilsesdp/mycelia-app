import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettingsContext } from "@/lib/settings";
import { PrivacyForm } from "@/components/settings/PrivacyForm";

// Ports SCREENS['5.5'].
export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { profile } = await getSettingsContext(supabase, user.id);

  return (
    <PrivacyForm
      initialEmailVisibility={profile.emailVisibility}
      initialPhoneVisibility={profile.phoneVisibility}
      initialMessageVisibility={profile.messageVisibility}
    />
  );
}
