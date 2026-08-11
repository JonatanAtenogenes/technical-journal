'use client';

import { CreateProjectInput } from '@/app/admin/(protected)/projects/schema';
import { useRouter } from 'next/router';
import React, { useState, useTransition } from 'react';
import {
  createProject,
  softDeleteProject,
  updateProject,
} from '@/app/admin/(protected)/projects/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { markdown } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { Textarea } from '@/components/ui/textarea';

type LocaleContent = CreateProjectInput['en'];

const emptyLocaleContent: LocaleContent = {
  title: '',
  description: '',
  category: '',
  part_tags: [],
  mdx_content: '',
};

type LinkEntry = { label: string; url: string; icon: string };

type ProjectFormProps = {
  seriesOptions: { id: string; label: string }[];
  // When provided, the form runs in edit mode: fields are pre-filled,
  // submit calls updateProject instead of createProject, and a delete
  // button is shown. Absent (create mode) means an empty form.
  initialData?: {
    id: string;
    meta: CreateProjectInput['meta'];
    en: LocaleContent;
    es: LocaleContent;
  };
};

export function ProjectForm({ seriesOptions, initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // --- Locale-independent fields ---
  const [slug, setSlug] = useState(initialData?.meta.slug ?? '');
  const [status, setStatus] = useState<'draft' | 'in-progress' | 'published'>(
    initialData?.meta.status ?? 'draft',
  );
  const [startYear, setStartYear] = useState(
    initialData?.meta.start_year?.toString() ?? '',
  );
  const [seriesId, setSeriesId] = useState<string>(
    initialData?.meta.series_id ?? '',
  );
  const [partNumber, setPartNumber] = useState(
    initialData?.meta.part_number?.toString() ?? '',
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.meta.tags.join(', ') ?? '',
  ); // comma-separated
  const [links, setLinks] = useState<LinkEntry[]>(
    (initialData?.meta.links as LinkEntry[]) ?? [],
  );

  // --- Per-locale content ---
  const [en, setEn] = useState<LocaleContent>(
    initialData?.en ?? emptyLocaleContent,
  );
  const [es, setEs] = useState<LocaleContent>(
    initialData?.es ?? emptyLocaleContent,
  );

  function addLink() {
    setLinks((prev) => [...prev, { label: '', url: '', icon: 'github' }]);
  }

  function updateLink(index: number, patch: Partial<LinkEntry>) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input: CreateProjectInput = {
      meta: {
        slug,
        status,
        start_year: startYear ? Number(startYear) : undefined,
        series_id: seriesId || undefined,
        part_number: partNumber ? Number(partNumber) : undefined,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        links,
      },
      en: {
        ...en,
        part_tags: en.part_tags,
      },
      es: {
        ...es,
        part_tags: es.part_tags,
      },
    };

    startTransition(async () => {
      const result = isEditMode
        ? await updateProject(initialData!.id, input)
        : await createProject(input);
      // Both actions redirect on success, so reaching this line means
      // an error was returned instead of NEXT_REDIRECT being thrown.
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initialData) return;
    if (!confirm(`Hide "${en.title || slug}"? This can be undone later.`)) {
      return;
    }
    startTransition(async () => {
      const result = await softDeleteProject(initialData.id);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={'space-y-8 max-w-3xl'}>
      {/* Locale-independent metadata */}
      <section className={'space-y-4'}>
        <h2 className={'text-lg font-medium'}>Metadata</h2>

        <div className={'grid gap-4 sm:grid-cols-2'}>
          <div className={'space-y-2'}>
            <Label htmlFor={'slug'}>Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={'my-project'}
              required
            />
          </div>

          <div className={'space-y-2'}>
            <Label htmlFor={'status'}>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger id={'status'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'draft'}>Draft</SelectItem>
                <SelectItem value={'in-progress'}>In progress</SelectItem>
                <SelectItem value={'published'}>Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_year">Start year</Label>
            <Input
              id="start_year"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="2025"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="series">Series (optional)</Label>
            <Select
              value={seriesId}
              onValueChange={(value) => setSeriesId(value ?? '')}
            >
              <SelectTrigger id="series">
                <SelectValue placeholder="Standalone project" />
              </SelectTrigger>
              <SelectContent>
                {seriesOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {seriesId && (
            <div className="space-y-2">
              <Label htmlFor="part_number">Part number</Label>
              <Input
                id="part_number"
                type="number"
                min={1}
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="1"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">
            Tags (comma-separated, affects home filtering)
          </Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="nextjs, supabase, typescript"
          />
        </div>

        {/* Links repeater */}
        <div className="space-y-2">
          <Label>Links</Label>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  className="sm:w-32"
                />
                <Input
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={link.icon}
                  onValueChange={(v) => updateLink(i, { icon: v ?? '' })}
                >
                  <SelectTrigger className="sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">github</SelectItem>
                    <SelectItem value="globe">globe</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(i)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              Add link
            </Button>
          </div>
        </div>
      </section>

      {/* Per-locale content */}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditMode
              ? 'Saving...'
              : 'Creating...'
            : isEditMode
              ? 'Save changes'
              : 'Create project'}
        </Button>
        {isEditMode && (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            Hide project
          </Button>
        )}
      </div>
    </form>
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
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          value={value.category}
          onChange={(e) => onChange({ ...value, category: e.target.value })}
          placeholder="Developer Tools"
        />
      </div>

      <div className="space-y-2">
        <Label>Part tags (comma-separated, display-only)</Label>
        <Input
          value={value.part_tags.join(', ')}
          onChange={(e) =>
            onChange({
              ...value,
              part_tags: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>MDX content</Label>
        <div className="rounded-md border overflow-hidden">
          <CodeMirror
            value={value.mdx_content}
            height="400px"
            extensions={[markdown()]}
            onChange={(v) => onChange({ ...value, mdx_content: v })}
          />
        </div>
      </div>
    </div>
  );
}
