'use client';

import { startTransition, useState, useTransition } from 'react';
import { softDeleteProject } from '../actions';
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
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type DeleProjectButtonProps = {
  projectId: string;
  projectTitle: string;
  // "icon": compact trigger for the desktop table row.
  // "full": labeled trigger for mobile cards / the edit page footer.
  variant?: 'icon' | 'full';
};

export function DeleteProjectButton({
  projectId,
  projectTitle,
  variant = 'full',
}: DeleProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await softDeleteProject(projectId);
      // softDeleteProject redirects to /admin on success (even when
      // already there, which just refreshes the list) — so reaching this
      // line means it returned an error instead of NEXT_REDIRECT.
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
            <Button variant={'ghost'} size={'icon'} aria-label="Hide Project">
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button type="button" variant={'destructive'}>
              Hide Project
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hide &quot;{projectTitle}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This hides the project from the site and admin list. It isn&apos;t
            permanently deleted - this can be undone later from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // stay open until the action resolves
              handleConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? 'Hiding...' : 'Hide project'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
