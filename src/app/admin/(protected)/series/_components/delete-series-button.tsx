'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { softDeleteSeries } from '@/app/admin/(protected)/series/actions';

export function DeleteSeriesButton({
  seriesId,
  seriesTitle,
  variant = 'full',
}: {
  seriesId: string;
  seriesTitle: string;
  variant?: 'icon' | 'full';
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await softDeleteSeries(seriesId);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          variant === 'icon' ? (
            <Button variant="ghost" size="icon" aria-label="Hide series">
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button type="button" variant="destructive">
              Hide series
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hide &quot;{seriesTitle}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This also hides every currently-visible project inside this series
            (they won&apos;t be auto-restored if you undo this later — each
            would need restoring individually). The series itself isn&apos;t
            permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? 'Hiding...' : 'Hide series'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
