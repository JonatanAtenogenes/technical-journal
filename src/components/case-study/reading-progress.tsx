'use client';

import { useEffect, useState } from 'react';
import { TableOfContentsItem } from '@/components/case-study/table-of-contents';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUpIcon } from 'lucide-react';

type FlatSection = { id: string; title: string };

function flattenSections(items: TableOfContentsItem[]): FlatSection[] {
  return items.flatMap((item) => [
    { id: item.id, title: item.title },
    ...(item.subitems ?? []),
  ]);
}

type ReadingProgressProps = {
  items: TableOfContentsItem[];
};

export default function ReadingProgress({ items }: ReadingProgressProps) {
  const sections = flattenSections(items);
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
          <DropdownMenuContent align="start" side="top">
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
