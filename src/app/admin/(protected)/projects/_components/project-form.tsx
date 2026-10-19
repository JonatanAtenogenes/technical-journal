'use client';

import {
  useState,
  useEffect,
  useRef,
  useTransition,
  type ReactNode,
} from 'react';
import { useTheme } from 'next-themes';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  createProject,
  updateProject,
} from '@/app/admin/(protected)/projects/actions';
import { renderMdxPreview } from '@/app/admin/(protected)/projects/preview-actions';
import type { CreateProjectInput } from '@/app/admin/(protected)/projects/schema';
import { DeleteProjectButton } from './delete-project-button';
import { CoverImageUploader } from './cover-image-uploader';

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
    cover: {
      id: string;
      storage_path: string;
      width: number | null;
      height: number | null;
      alt: { en?: string; es?: string } | null;
    } | null;
  };
};

const STEPS = [
  { label: 'Basic info' },
  { label: 'Content details' },
  { label: 'Body content' },
] as const;

// Base UI's <Select.Value> renders the raw value by default, not the
// matching item's label — passing `items` to <Select> tells it which
// label corresponds to each value once something is selected.
const STATUS_ITEMS = [
  { label: 'Completed', value: 'completed' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Paused', value: 'paused' },
  { label: 'Archived', value: 'archived' },
];

const ICON_ITEMS = [
  { label: 'github', value: 'github' },
  { label: 'globe', value: 'globe' },
  { label: 'external-link', value: 'external-link' },
];

export function ProjectForm({ seriesOptions, initialData }: ProjectFormProps) {
  const isEditMode = Boolean(initialData);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // --- Locale-independent fields (step 1) ---
  const [slug, setSlug] = useState(initialData?.meta.slug ?? '');
  const [status, setStatus] = useState<
    'completed' | 'in-progress' | 'paused' | 'archived'
  >(initialData?.meta.status ?? 'in-progress');
  const [startYear, setStartYear] = useState(
    initialData?.meta.end_year?.toString() ?? '',
  );
  const [endYear, setEndYear] = useState(
    initialData?.meta.end_year?.toString() ?? '',
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

  // --- Per-locale content (steps 2 and 3) ---
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

  // Lightweight per-step validation — just enough to stop someone from
  // reaching the content step with no slug, not a full re-implementation
  // of the Zod schema (that still runs server-side on submit).
  function validateStep(current: number): string | null {
    if (current === 0) {
      if (!slug.trim()) return 'Slug is required.';
    }
    if (current === 1) {
      if (!en.title.trim() || !en.description.trim()) {
        return 'English title and description are required.';
      }
      if (!es.title.trim() || !es.description.trim()) {
        return 'Spanish title and description are required.';
      }
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function submitForm() {
    setError(null);

    // Defensive: only send series_id if it actually looks like a UUID.
    // Guards against an empty-but-not-"" value ever reaching the server
    // and failing Zod's .uuid() check with an unhelpful message.
    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedSeriesId = UUID_RE.test(seriesId) ? seriesId : undefined;

    const input: CreateProjectInput = {
      meta: {
        slug,
        status,
        start_year: startYear ? Number(startYear) : undefined,
        end_year: endYear ? Number(endYear) : undefined,
        series_id: sanitizedSeriesId,
        part_number: partNumber ? Number(partNumber) : undefined,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        links,
      },
      en,
      es,
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

  // Kept only as a fallback for native form submission (e.g. pressing
  // Enter). The actual "Save"/"Create" button below no longer relies on
  // type="submit" — see the note on isLastStep flip further down.
  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!isLastStep) {
      return;
    }
    submitForm();
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <StepIndicator currentStep={step} />

      {step === 0 && (
        <BasicInfoStep
          slug={slug}
          setSlug={setSlug}
          status={status}
          setStatus={setStatus}
          startYear={startYear}
          setStartYear={setStartYear}
          endYear={endYear}
          setEndYear={setEndYear}
          seriesId={seriesId}
          setSeriesId={setSeriesId}
          partNumber={partNumber}
          setPartNumber={setPartNumber}
          tagsInput={tagsInput}
          setTagsInput={setTagsInput}
          links={links}
          addLink={addLink}
          updateLink={updateLink}
          removeLink={removeLink}
          seriesOptions={seriesOptions}
          projectId={initialData?.id}
          initialCover={initialData?.cover ?? null}
        />
      )}

      {step === 1 && (
        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="es">Español</TabsTrigger>
          </TabsList>
          <TabsContent value="en">
            <LocaleDetailsFields value={en} onChange={setEn} />
          </TabsContent>
          <TabsContent value="es">
            <LocaleDetailsFields value={es} onChange={setEs} />
          </TabsContent>
        </Tabs>
      )}

      {step === 2 && (
        <Tabs defaultValue="en">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="es">Español</TabsTrigger>
          </TabsList>
          <TabsContent value="en">
            <LocaleBodyField
              value={en}
              onChange={setEn}
              projectId={initialData?.id}
              locale="en"
            />
          </TabsContent>
          <TabsContent value="es">
            <LocaleBodyField
              value={es}
              onChange={setEs}
              projectId={initialData?.id}
              locale="es"
            />
          </TabsContent>
        </Tabs>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          {isEditMode && isLastStep && (
            <DeleteProjectButton
              projectId={initialData!.id}
              projectTitle={en.title || slug}
              variant="full"
            />
          )}
        </div>

        {isLastStep ? (
          <Button type="button" disabled={isPending} onClick={submitForm}>
            {isPending
              ? isEditMode
                ? 'Saving...'
                : 'Creating...'
              : isEditMode
                ? 'Save changes'
                : 'Create project'}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs',
              i === currentStep &&
                'border-primary bg-primary text-primary-foreground',
              i < currentStep && 'border-primary text-primary',
              i > currentStep && 'text-muted-foreground',
            )}
          >
            {i + 1}
          </span>
          <span
            className={cn(
              'hidden sm:inline',
              i === currentStep ? 'font-medium' : 'text-muted-foreground',
            )}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="mx-1 h-px w-4 bg-border sm:w-8" />
          )}
        </li>
      ))}
    </ol>
  );
}

function BasicInfoStep({
  slug,
  setSlug,
  status,
  setStatus,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  seriesId,
  setSeriesId,
  partNumber,
  setPartNumber,
  tagsInput,
  setTagsInput,
  links,
  addLink,
  updateLink,
  removeLink,
  seriesOptions,
  projectId,
  initialCover,
}: {
  slug: string;
  setSlug: (v: string) => void;
  status: 'completed' | 'in-progress' | 'paused' | 'archived';
  setStatus: (v: 'completed' | 'in-progress' | 'paused' | 'archived') => void;
  startYear: string;
  setStartYear: (v: string) => void;
  endYear: string;
  setEndYear: (v: string) => void;
  seriesId: string;
  setSeriesId: (v: string) => void;
  partNumber: string;
  setPartNumber: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  links: LinkEntry[];
  addLink: () => void;
  updateLink: (index: number, patch: Partial<LinkEntry>) => void;
  removeLink: (index: number) => void;
  seriesOptions: { id: string; label: string }[];
  // Cover upload needs an existing project row (FK), so it's only
  // available in edit mode. projectId is undefined while creating.
  projectId?: string;
  initialCover: {
    id: string;
    storage_path: string;
    width: number | null;
    height: number | null;
    alt: { en?: string; es?: string } | null;
  } | null;
}) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-project"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
            items={STATUS_ITEMS}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
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
          <Label htmlFor="end_year">
            End year (optional, leave empty if ongoing)
          </Label>
          <Input
            id="end_year"
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="2026"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="series">Series (optional)</Label>
          <Select
            value={seriesId}
            onValueChange={(value) => setSeriesId(value ?? '')}
            items={seriesOptions.map((s) => ({ label: s.label, value: s.id }))}
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
                items={ICON_ITEMS}
              >
                <SelectTrigger className="sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">github</SelectItem>
                  <SelectItem value="globe">globe</SelectItem>
                  <SelectItem value="external-link">external-link</SelectItem>
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

      {projectId ? (
        <CoverImageUploader projectId={projectId} initialCover={initialCover} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Cover image: save the project first, then come back here to add one.
        </p>
      )}
    </section>
  );
}

// Step 2: everything about the project's content except the MDX body itself.
function LocaleDetailsFields({
  value,
  onChange,
}: {
  value: LocaleContent;
  onChange: (v: LocaleContent) => void;
}) {
  return (
    <div className="grid gap-4 pt-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
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

      <div className="space-y-2 sm:col-span-2">
        <Label>Description</Label>
        <Textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
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
    </div>
  );
}

// Step 3: just the MDX body, isolated so CodeMirror only mounts once
// the earlier steps are already filled in.
// Step 3: MDX editor + live preview. The editor follows the app's theme
// (next-themes), and the preview is debounced and compiled server-side
// through the exact same remark/rehype pipeline as the public site — see
// preview-actions.ts for what's included and what's approximated.
function LocaleBodyField({
  value,
  onChange,
  projectId,
  locale,
}: {
  value: LocaleContent;
  onChange: (v: LocaleContent) => void;
  // Undefined while creating a new project — <ProjectImage> tags will
  // render as "missing" placeholders until the project is saved once.
  projectId?: string;
  locale: 'en' | 'es';
}) {
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === 'dark' ? githubDark : githubLight;

  const [previewContent, setPreviewContent] = useState<ReactNode>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startPreviewTransition(async () => {
        const result = await renderMdxPreview(
          value.mdx_content,
          projectId,
          locale,
        );
        if ('error' in result && result.error) {
          setPreviewError(result.error);
          setPreviewContent(null);
        } else {
          setPreviewError(null);
          setPreviewContent(result.content ?? null);
        }
      });
    }, 600); // debounce: avoid compiling MDX on every keystroke

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value.mdx_content]);

  const editor = (
    <div className="h-[60dvh] min-h-80 max-h-150 w-full min-w-0 rounded-md border overflow-hidden">
      <CodeMirror
        value={value.mdx_content}
        height="600px"
        theme={editorTheme}
        // Wrap long lines instead of letting them extend the editor's
        // intrinsic width — without this, a single long line of MDX can
        // push the whole page into horizontal scroll (see min-w-0 note
        // in the admin layout for the other half of this fix).
        extensions={[markdown(), EditorView.lineWrapping]}
        onChange={(v) => onChange({ ...value, mdx_content: v })}
      />
    </div>
  );

  const preview = (
    <PreviewPane
      content={previewContent}
      error={previewError}
      className="h-125 overflow-y-auto rounded-md border p-4"
    />
  );

  return (
    <div className="space-y-2 pt-4">
      <div className="flex items-center justify-between">
        <Label>MDX content</Label>
        {isPreviewPending && (
          <span className="text-xs text-muted-foreground">
            Updating preview…
          </span>
        )}
      </div>

      {/* GitHub-style: Write/Preview tabs at every screen size, so each
          view gets the full available width instead of splitting it. */}

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="pt-3">
          {editor}
        </TabsContent>
        <TabsContent value="preview" className="pt-3">
          {preview}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreviewPane({
  content,
  error,
  className,
}: {
  content: ReactNode;
  error: string | null;
  className?: string;
}) {
  if (error) {
    return (
      <div className={cn('text-sm text-destructive', className)}>
        Preview error: {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        Nothing to preview yet.
      </div>
    );
  }

  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
    >
      {content}
    </div>
  );
}
