import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

// Ports SCREENS['5.10'].
export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  return <ChangePasswordForm email={user.email ?? ""} />;
}
