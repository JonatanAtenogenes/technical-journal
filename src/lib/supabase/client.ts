import { createBrowserClient } from '@supabase/ssr';

// Used inside Client Components only.
// Reads the public env vars, safe to expose to the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
