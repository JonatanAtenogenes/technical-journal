import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlProxy = createMiddleware(routing);

// Single network-boundary file for the whole app (Next.js 16 only allows one).
// Admin routes bypass next-intl entirely — no locale prefix, no locale
// detection/redirect — and instead run Supabase session refresh + route
// protection. Every other route keeps the original next-intl behavior.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    return await handleAdminAuth(request);
  }

  return intlProxy(request);
}

async function handleAdminAuth(request: NextRequest) {
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
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
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

  const isLoginRoute = request.nextUrl.pathname.startsWith('/admin/login');

  if (!isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = '/admin';
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

// Matcher unchanged from the original next-intl setup — it already
// covers /admin, so /admin routes just get handled by the branch above
// instead of being excluded from proxy execution entirely.
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
