import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Where both the signup-confirmation AND the password-recovery links in
// Supabase's emails actually land. Supabase verifies the token server-side
// before ever reaching us, then forwards the visitor here either as
// `token_hash` + `type` (the OTP-style link its templates generate by
// default) or as a PKCE `code` — this handles both. Without this route, the
// browser was landing on `/` with an unconsumed `?code=...` and no session,
// which is why confirming looked broken and a separate log-in was needed:
// verifying the token here establishes the real session (through the same
// cookie-syncing server client proxy.ts uses).
//
// A recovery link needs a different destination than a signup link —
// forgot-password/page.tsx's resetPasswordForEmail() passes
// `redirectTo: .../auth/confirm?next=/reset-password` specifically so this
// route knows to send THOSE visitors to the new-password screen instead of
// straight into the app. Supabase appends its own `code`/`token_hash`
// params onto that redirectTo, so `next` survives alongside them.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (type === "recovery") return NextResponse.redirect(`${origin}${next ?? "/reset-password"}`);
      return NextResponse.redirect(`${origin}${type === "signup" ? "/onboarding/path" : "/login"}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // The PKCE `code` shape carries no `type` of its own — `next` is what
      // tells a recovery link apart from a signup confirmation here.
      return NextResponse.redirect(`${origin}${next ?? "/onboarding/path"}`);
    }
  }

  // Expired, already-used, or malformed link — "Send it again" on
  // check-email covers the expired case; this just avoids a dead end.
  return NextResponse.redirect(`${origin}/login?error=confirm-failed`);
}
