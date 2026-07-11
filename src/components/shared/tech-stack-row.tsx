'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const techStack = ['React', '.NET', 'Rust', 'Python', 'SQL', 'Docker'];

export default function TechStackRow() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
      <ToggleGroup multiple variant={'outline'} className={'w-max'}>
        {techStack.map((tech) => (
          <ToggleGroupItem key={tech} value={tech} className={'text-sm'}>
            {tech}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
