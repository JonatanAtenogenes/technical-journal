import { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

// This layout wraps every /admin route except /admin/login,
// which has its own minimal layout (no nav, no sign-out button).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={'flex min-h-screen'}>
      <aside className={'w-56 shrink-0 border-r px-4 py-6'}>
        <nav className={'flex flex-col gap-2'}>
          <Link href={'/admin'} className={'text-sm font-medium'}>
            Projects
          </Link>
          <Link href={'/admin/series'} className={'text-sm font-medium'}>
            Series
          </Link>
          <Link href={'/admin/images'} className={'text-sm font-medium'}>
            Images
          </Link>
        </nav>
        <form action={signOut} className={'mt-8'}>
          <Button variant={'outline'} size={'sm'} type={'submit'}>
            Sign Out
          </Button>
        </form>
      </aside>
      <main className={'flex-1 p-6'}>{children}</main>
    </div>
  );
}
