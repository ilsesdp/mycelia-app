import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/settings/AccountForm";

// Ports SCREENS['5.6'] — the same contact email/phone onboarding's 1.11
// collected, not a second copy.
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: profile } = await supabase.from("profiles").select("contact_email, contact_phone").eq("id", user.id).maybeSingle();

  return (
    <AccountForm
      authEmail={user.email ?? ""}
      initialEmail={profile?.contact_email ?? ""}
      initialPhone={profile?.contact_phone ?? ""}
    />
  );
}
