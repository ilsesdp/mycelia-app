import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

// Landed on only by the password-recovery link, after auth/confirm/route.ts
// has verified it and set a real session cookie for this browser. Reached
// directly (bookmarked, link already used, or just typed in) with no
// session — send them back to request a fresh link instead of showing a
// form that will just fail on save.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");

  return <ResetPasswordForm />;
}
