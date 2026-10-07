'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ContentImageRow,
  ContentImagesManager,
} from './content-images-manager';

type ProjectOption = { id: string; label: string };

export function ImagesPageClient({
  projects,
  defaultProjectId,
  imagesByProject,
}: {
  projects: ProjectOption[];
  defaultProjectId: string | null;
  imagesByProject: Record<string, ContentImageRow[]>;
}) {
  const [selectedId, setSelectedId] = useState(defaultProjectId ?? '');

  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No projects yet — create one first, then come back here to add images.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-2">
        <Label htmlFor="project-select">Project</Label>
        <Select
          value={selectedId}
          onValueChange={(value) => setSelectedId(value ?? '')}
          items={projects.map((p) => ({ label: p.label, value: p.id }))}
        >
          <SelectTrigger id="project-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId && (
        // key forces a clean remount when switching projects, so the
        // manager's internal state doesn't carry over stale images from
        // the previously selected project.
        <ContentImagesManager
          key={selectedId}
          projectId={selectedId}
          initialImages={imagesByProject[selectedId] ?? []}
        />
      )}
    </div>
  );
}
