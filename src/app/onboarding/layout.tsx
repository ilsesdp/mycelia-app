import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProvider } from "@/lib/onboarding/context";

// Onboarding requires a real account — the prototype's flow assumes
// sign-up already happened (1.3 → 1.4). Anyone hitting these routes
// without a session goes to sign up first.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  return <OnboardingProvider>{children}</OnboardingProvider>;
}
