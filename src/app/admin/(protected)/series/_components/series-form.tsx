'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createSeries,
  updateSeries,
} from '@/app/admin/(protected)/series/actions';
import { DeleteSeriesButton } from '@/app/admin/(protected)/series/_components/delete-series-button';
import type { CreateSeriesInput } from '@/app/admin/(protected)/series/schema';

type LocaleContent = CreateSeriesInput['en'];
const emptyLocaleContent: LocaleContent = { title: '', description: '' };

type SeriesFormProps = {
  initialData?: {
    id: string;
    meta: CreateSeriesInput['meta'];
    en: LocaleContent;
    es: LocaleContent;
  };
  // Read-only context shown in edit mode: the projects currently
  // belonging to this series, so you can see what you'd be affecting.
  projects?: { slug: string; title: string; partNumber: number | null }[];
};

export function SeriesForm({ initialData, projects }: SeriesFormProps) {
  const isEditMode = Boolean(initialData);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initialData?.meta.slug ?? '');
  const [tagsInput, setTagsInput] = useState(
    initialData?.meta.tags.join(', ') ?? '',
  );
  const [en, setEn] = useState<LocaleContent>(
    initialData?.en ?? emptyLocaleContent,
  );
  const [es, setEs] = useState<LocaleContent>(
    initialData?.es ?? emptyLocaleContent,
  );

  function submitForm() {
    setError(null);

    const input: CreateSeriesInput = {
      meta: {
        slug,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      },
      en,
      es,
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateSeries(initialData!.id, input)
        : await createSeries(input);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-w-0 max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Metadata</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="home-server"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="self-hosted, rust, react"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Content</h2>
        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="es">Español</TabsTrigger>
          </TabsList>
          <TabsContent value="en">
            <LocaleFields value={en} onChange={setEn} />
          </TabsContent>
          <TabsContent value="es">
            <LocaleFields value={es} onChange={setEs} />
          </TabsContent>
        </Tabs>
      </section>

      {isEditMode && projects && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Projects in this series</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects assigned yet — add this series to a project from the
              project&apos;s Basic info step.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {projects
                .slice()
                .sort((a, b) => (a.partNumber ?? 0) - (b.partNumber ?? 0))
                .map((p) => (
                  <li key={p.slug} className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {p.partNumber ? `Part ${p.partNumber}` : '—'}
                    </span>
                    <a
                      href={`/admin/projects/${p.slug}`}
                      className="underline underline-offset-2"
                    >
                      {p.title}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" disabled={isPending} onClick={submitForm}>
          {isPending
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
              ? 'Save changes'
              : 'Create series'}
        </Button>
        {isEditMode && (
          <DeleteSeriesButton
            seriesId={initialData!.id}
            seriesTitle={en.title || slug}
            variant="full"
          />
        )}
      </div>
    </div>
  );
}

function LocaleFields({
  value,
  onChange,
}: {
  value: LocaleContent;
  onChange: (v: LocaleContent) => void;
}) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
