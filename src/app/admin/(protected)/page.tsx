import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Shape returned by the query below. Only the fields the table needs.
type ProjectRow = {
  id: string;
  slug: string;
  status: string;
  updated_at: string;
  series: { slug: string } | null;
  // project_i18n is fetched for 'en' only — the admin list always
  // shows the English title regardless of which locales exist.
  project_i18n: { title: string }[];
};

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  // deleted_at IS NULL: soft-deleted projects don't show in the main list.
  // A future "trash" view can query the opposite.
  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      slug,
      status,
      updated_at,
      series:series_id ( slug ),
      project_i18n!inner ( title )
    `,
    )
    .is('deleted_at', null)
    .eq('project_i18n.locale', 'en')
    .order('updated_at', { ascending: false })
    .returns<ProjectRow[]>();

  if (error) {
    // Surfaced directly for now — this is a single-author admin panel,
    // not a public-facing page, so a raw error message is acceptable.
    return (
      <div className="text-sm text-destructive">
        Failed to load projects: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        {/* Base UI pattern: render prop instead of asChild */}
        <Button render={<Link href="/admin/projects/new" />}>
          New project
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No projects yet.
              </TableCell>
            </TableRow>
          )}
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                {project.project_i18n[0]?.title ?? '(untitled)'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.slug}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.series?.slug ?? '—'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{project.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(project.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {/* Base UI pattern: render prop instead of asChild */}
                <Button
                  render={<Link href={`/admin/projects/${project.slug}`} />}
                  variant="ghost"
                  size="sm"
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
