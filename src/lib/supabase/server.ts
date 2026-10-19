import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Used inside Server Components, Server Actions, and Route Handlers.
// Must be created per-request because it reads the request's cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll was called from a Server Component, not a Server Action
            // or Route Handler. This can be safely ignored if there is
            // middleware refreshing the session (see middleware.ts below).
          }
        },
      },
    },
  );
}
