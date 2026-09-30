import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * `cookies()` is async in this Next.js version (15+/16) — must be awaited.
 * Create a fresh client per request; do not module-cache this.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (not a Server Action/Route
            // Handler) — writes are ignored here. The session is still
            // refreshed on every request by proxy.ts, so this is safe.
          }
        },
      },
    }
  );
}
