import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsHub } from "@/components/settings/SettingsHub";

// Ports SCREENS['5.2'] — the Settings hub. Reachable by any logged-in
// account (visitor or farm owner): "Your farm" only shows when this
// account actually owns one, since Edit profile edits farm fields that
// don't exist otherwise. The prototype's back arrow goes to My farm
// (4.1, not built yet) — there's nowhere real to send it back to yet, so
// this has no back arrow at all rather than a dead link.
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: farm } = await supabase.from("farms").select("id, name").eq("owner_id", user.id).maybeSingle();

  return <SettingsHub hasFarm={!!farm} />;
}
