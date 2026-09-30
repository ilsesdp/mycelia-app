import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request. This is the
 * @supabase/ssr-recommended pattern, adapted to Next.js 16's proxy.ts
 * (the renamed middleware.ts — see AGENTS.md: this Next.js version renamed
 * the file/export, the cookie APIs used here are unchanged).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not remove this call. getUser() validates the session
  // against Supabase Auth (getSession() alone just reads the cookie and can
  // be spoofed client-side).
  await supabase.auth.getUser();

  return response;
}
