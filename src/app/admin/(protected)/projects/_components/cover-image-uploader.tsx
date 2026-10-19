'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  uploadCoverImage,
  removeCoverImage,
} from '@/app/admin/(protected)/images/actions';
import { getImagePublicUrl } from '@/lib/supabase/storage';

type CoverImage = {
  id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt: { en?: string; es?: string } | null;
} | null;

export function CoverImageUploader({
  projectId,
  initialCover,
}: {
  projectId: string;
  initialCover: CoverImage;
}) {
  const [cover, setCover] = useState<CoverImage>(initialCover);
  const [altEn, setAltEn] = useState(initialCover?.alt?.en ?? '');
  const [altEs, setAltEs] = useState(initialCover?.alt?.es ?? '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPendingFile(file ?? null);
    setError(null);
  }

  function handleUpload() {
    if (!pendingFile) return;
    if (!altEn.trim()) {
      setError('English alt text is required (accessibility).');
      return;
    }

    startTransition(async () => {
      const result = await uploadCoverImage(
        projectId,
        pendingFile,
        altEn,
        altEs,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCover({ ...result.image, alt: { en: altEn, es: altEs } });
      setPendingFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }

  function handleRemove() {
    if (!cover) return;
    startTransition(async () => {
      const result = await removeCoverImage(cover.id, cover.storage_path);
      if (!result.success) {
        setError(result.error ?? 'Failed to remove cover image.');
        return;
      }
      setCover(null);
      setAltEn('');
      setAltEs('');
    });
  }

  return (
    <div className="space-y-4">
      <Label>Cover image</Label>

      {cover && (
        <div className="flex items-start gap-4">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-md border bg-muted">
            <Image
              src={getImagePublicUrl(cover.storage_path)}
              alt={cover.alt?.en ?? ''}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                  Remove cover
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove cover image?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the file from storage. You can upload
                  a new one afterward.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cover-alt-en">Alt text (English)</Label>
          <Input
            id="cover-alt-en"
            value={altEn}
            onChange={(e) => setAltEn(e.target.value)}
            placeholder="Screenshot of the dashboard"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover-alt-es">Alt text (Spanish)</Label>
          <Input
            id="cover-alt-es"
            value={altEs}
            onChange={(e) => setAltEs(e.target.value)}
            placeholder="Captura del dashboard"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sm:max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!pendingFile || isPending}
          onClick={handleUpload}
        >
          <Upload className="size-4" />
          {isPending
            ? 'Uploading...'
            : cover
              ? 'Replace cover'
              : 'Upload cover'}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
