import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsHub } from "@/components/settings/SettingsHub";

// Ports SCREENS['5.2'] — the Settings hub. Reachable by any logged-in
// account (visitor or farm owner): "Your farm" only shows when this
// account actually owns one, since Edit profile edits farm fields that
// don't exist otherwise. The prototype's back arrow goes to My Farm
// (4.1), which is built now, so the AppBar in SettingsHub points there —
// a farmless visitor who landed here via My Farm's own redirect just
// bounces straight back, same as the prototype's own dead-end case.
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: farm } = await supabase.from("farms").select("id, name").eq("owner_id", user.id).maybeSingle();

  return <SettingsHub hasFarm={!!farm} />;
}
