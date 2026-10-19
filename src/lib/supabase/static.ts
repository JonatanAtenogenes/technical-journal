import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Used in generateStaticParams and any other public-read context
// that runs without an HTTP request (no cookies, no session).
// Safe for public data only — do not use this client for anything
// that depends on auth.uid() or RLS tied to the logged-in user.
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
