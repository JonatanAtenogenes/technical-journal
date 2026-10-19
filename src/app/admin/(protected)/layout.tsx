'use client';

import { ReactNode, useState } from 'react';
import { signOut } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import AdminNav from '@/app/admin/(protected)/_components/admin-nav';
import ThemeToggle from '@/components/shared/theme-toggle';

// This layout wraps every /admin route except /admin/login,
// which has its own minimal layout (no nav, no sign-out button).
export default function AdminLayout({ children }: { children: ReactNode }) {
  // Controls the mobile drawer open state. Closed by default; also closed
  // automatically when a nav link is tapped (see onNavigate below).
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar: hamburger trigger + sign out, hidden on md+ */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetTitle className="mb-4">Technical Journal Admin</SheetTitle>
              <AdminNav onNavigate={() => setMobileNavOpen(false)} />
              <form action={signOut} className="mt-8" suppressHydrationWarning>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium">Admin</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Desktop sidebar: static, always visible from md up */}
      <aside className="hidden w-56 shrink-0 border-r px-4 py-6 md:block">
        <AdminNav />
        <div className="mt-8 flex items-center gap-2">
          <form action={signOut} suppressHydrationWarning>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </aside>

      {/* min-w-0 is required here: without it, a flex child defaults to
          min-width:auto, so wide content inside (like an unwrapped long
          line in the MDX editor) can force this column wider than the
          space available next to the sidebar, causing page-level
          horizontal scroll. */}
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
