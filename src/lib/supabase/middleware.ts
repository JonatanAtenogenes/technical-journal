import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Refreshes the auth session on every request and protects /admin routes.
// This must run in the middleware because Server Components cannot write
// cookies, so relying on them alone would let sessions expire silently.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: avoid writing logic between createServerClient and
  // getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname.startsWith('/admin/login');

  if (isAdminRoute && !user && !isLoginRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = '/admin';
    return NextResponse.redirect(adminUrl);
  }

  return supabaseResponse;
}
