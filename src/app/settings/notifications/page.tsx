import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettingsContext } from "@/lib/settings";
import { NotificationsForm } from "@/components/settings/NotificationsForm";

// Ports SCREENS['5.4'].
export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { profile } = await getSettingsContext(supabase, user.id);

  return (
    <NotificationsForm
      initialChannel={profile.messageChannel}
      initialMsgOn={profile.notifMsgOn}
      initialMarketOn={profile.notifMarketOn}
      initialEventOn={profile.notifEventOn}
      initialPause={profile.notifPause}
      contactPhone={profile.contactPhone}
    />
  );
}
