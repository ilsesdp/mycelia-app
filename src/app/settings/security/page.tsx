import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SecurityForm } from "@/components/settings/SecurityForm";

// Ports SCREENS['5.10'] — password change — plus the prototype's "Delete my
// account" (5.11), which now lives here rather than on Contact information,
// matching the hub's own "Security" row.
export default async function SecurityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  return <SecurityForm email={user.email ?? ""} />;
}
