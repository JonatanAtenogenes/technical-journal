'use client';

import Link from 'next/link';

const links = [
  {
    href: '/admin',
    label: 'Projects',
  },
  {
    href: '/admin/series',
    label: 'Series',
  },
  {
    href: '/admin/image',
    label: 'Images',
  },
];

// Shared between the desktop sidebar and the mobile Sheet drawer,
// so the link list only has to be maintained in one place.
export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className={'flex flex-col gap-1'}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={'rounded-md px-3 py-2 text-sm font-medium hover:bg-muted'}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
