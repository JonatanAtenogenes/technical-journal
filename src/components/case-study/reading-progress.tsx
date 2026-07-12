'use client';

import { useEffect, useMemo, useState } from 'react';
import { TableOfContentsItem } from '@/components/case-study/table-of-contents';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUpIcon } from 'lucide-react';
import { HEADING_INDEX } from '@/lib/constants/secret-keys';

type FlatSection = { id: string; title: string };

function flattenSections(items: TableOfContentsItem[]): FlatSection[] {
  return items.flatMap((item) => [
    { id: item.id, title: item.title },
    ...(item.subitems ?? []).flatMap((subItem) => [
      { id: subItem.id, title: subItem.title },
      ...(subItem.subitems ?? []),
    ]),
  ]);
}

type ReadingProgressProps = {
  items: TableOfContentsItem[];
};

export default function ReadingProgress({ items }: ReadingProgressProps) {
  // Memoized so the reference only changes when `items` actually
  // changes — prevents the effect below from re-running on every render.
  const sections = useMemo(() => flattenSections(items), [items]);

  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    let ticking = false;

    function update() {
      // How far through the whole page we've scrolled.
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      // Last heading whose top has already crossed the offset line is
      // the "current" section — same idea as a scrollspy.
      const offset = 120;
      let current = sections[0]?.id;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }

      setActiveId(current);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  // Single source of truth for hash syncing — fires whenever activeId
  // changes, whether that change came from scrolling or from picking an
  // item in the dropdown below.
  useEffect(() => {
    if (activeId) {
      window.history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  // Restores reading position after a locale switch. LocaleSwitcher
  // stores the active heading's index in sessionStorage right before
  // navigating; here we read it once on mount, jump to the matching
  // heading in the newly rendered (translated) article, and clear it.
  useEffect(() => {
    const saved = sessionStorage.getItem(HEADING_INDEX);

    if (saved === null) return;

    const index = Number(saved);

    if (index === -1) {
      // The reader was above the first heading (still on the hero) —
      // land back at the real top of the page instead of jumping to
      // the first heading, which would skip past the hero.
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      const target = sections[index];

      if (target) {
        const el = document.getElementById(target.id);
        el?.scrollIntoView({ behavior: 'instant', block: 'start' });
        setActiveId(target.id);
      }
    }

    sessionStorage.removeItem(HEADING_INDEX);
    // Intentionally run once on mount only.
  }, []);

  const activeTitle =
    sections.find((section) => section.id === activeId)?.title ?? '';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur-sm">
      <Progress value={progress} className={'h-0.5 rounded-none'} />

      <div className="mt-2 container mx-auto flex items-center justify-between px-4 py-2 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              'flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
            }
          >
            {activeTitle}
            <ChevronUpIcon className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={'bg-popover/95 before:backdrop-blur-none'}
            align="start"
            side="top"
          >
            {sections.map((section) => (
              <DropdownMenuItem
                key={section.id}
                onClick={() => {
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              >
                {section.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.round(progress)}
        </span>
      </div>
    </div>
  );
}
