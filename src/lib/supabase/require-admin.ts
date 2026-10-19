import { createClient } from '@/lib/supabase/server';

// Verifies on the server that the caller has a valid session AND is the
// admin. Server Actions are public HTTP endpoints, so every action under
// /admin must call this first instead of relying only on the proxy.
// Returns null when the caller is not allowed.
export async function requireAdmin() {
  const supabase = await createClient();

  // getUser() validates the token with the Auth server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // The admin identity lives in a single place: the is_admin() function
  const { data: isAdmin } = await supabase.rpc('is_admin');

  if (isAdmin !== true) {
    return null;
  }

  return { supabase, user };
}
