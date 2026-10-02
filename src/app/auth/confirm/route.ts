import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Where the signup confirmation link in the email actually lands. Supabase
// verifies the token server-side before ever reaching us, then forwards the
// visitor here either as `token_hash` + `type` (the OTP-style link its
// templates generate by default) or as a PKCE `code` — this handles both.
// Without this route, the browser was landing on `/` with an unconsumed
// `?code=...` and no session, which is why confirming looked broken and a
// separate log-in was needed: verifying the token here establishes the real
// session (through the same cookie-syncing server client proxy.ts uses), so
// a signup confirmation sends the visitor straight into onboarding already
// logged in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${type === "signup" ? "/onboarding/path" : "/login"}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/onboarding/path`);
    }
  }

  // Expired, already-used, or malformed link — "Send it again" on
  // check-email covers the expired case; this just avoids a dead end.
  return NextResponse.redirect(`${origin}/login?error=confirm-failed`);
}
