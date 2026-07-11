import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '../shared/theme-toggle';

export default function CaseStudyHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-12 items-center justify-between px-4">
        <Link
          href={'/'}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Case Studies
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
