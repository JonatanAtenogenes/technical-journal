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
import { DeleteSeriesButton } from '@/app/admin/(protected)/series/_components/delete-series-button';

type SeriesRow = {
  id: string;
  slug: string;
  series_i18n: { title: string }[];
  projects: { id: string }[];
};

export default async function AdminSeriesPage() {
  const supabase = await createClient();

  const { data: series, error } = await supabase
    .from('series')
    .select(
      `
      id,
      slug,
      series_i18n!inner ( title ),
      projects ( id )
    `,
    )
    .is('deleted_at', null)
    .eq('series_i18n.locale', 'en')
    .order('slug')
    .returns<SeriesRow[]>();

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load series: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Series</h1>
        <Button nativeButton={false} render={<Link href="/admin/series/new" />}>
          New series
        </Button>
      </div>

      {series.length === 0 && (
        <p className="text-center text-muted-foreground">No series yet.</p>
      )}

      {/* Mobile: stacked cards. Hidden from md up. */}
      <div className="flex flex-col gap-3 md:hidden">
        {series.map((s) => (
          <div key={s.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">
                {s.series_i18n[0]?.title ?? s.slug}
              </span>
              <Badge variant="outline">{s.projects.length} parts</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{s.slug}</p>
            <div className="flex items-center justify-between pt-1">
              <Button
                nativeButton={false}
                render={<Link href={`/admin/series/${s.slug}`} />}
                variant="ghost"
                size="sm"
              >
                Edit
              </Button>
              <DeleteSeriesButton
                seriesId={s.id}
                seriesTitle={s.series_i18n[0]?.title ?? s.slug}
                variant="icon"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table. Hidden below md. */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Parts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {series.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">
                {s.series_i18n[0]?.title ?? s.slug}
              </TableCell>
              <TableCell className="text-muted-foreground">{s.slug}</TableCell>
              <TableCell>
                <Badge variant="outline">{s.projects.length}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    nativeButton={false}
                    render={<Link href={`/admin/series/${s.slug}`} />}
                    variant="ghost"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <DeleteSeriesButton
                    seriesId={s.id}
                    seriesTitle={s.series_i18n[0]?.title ?? s.slug}
                    variant="icon"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
