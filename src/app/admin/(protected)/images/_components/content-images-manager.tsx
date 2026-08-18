'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Check, Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  uploadImage,
  deleteImage,
} from '@/app/admin/(protected)/images/actions';
import { getImagePublicUrl } from '@/lib/supabase/storage';

export type ContentImageRow = {
  id: string;
  storage_path: string;
  slot_key: string;
  width: number | null;
  height: number | null;
  alt: { en?: string; es?: string } | null;
};

export function ContentImagesManager({
  projectId,
  initialImages,
}: {
  projectId: string;
  initialImages: ContentImageRow[];
}) {
  const [images, setImages] = useState(initialImages);

  function handleUploaded(image: ContentImageRow) {
    setImages((prev) => [...prev, image]);
  }

  function handleDeleted(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Content images</Label>
          <p className="text-xs text-muted-foreground">
            Reference these inside the MDX body via{' '}
            <code>{'<ProjectImage slot="..." />'}</code>.
          </p>
        </div>
        <UploadImageDialog projectId={projectId} onUploaded={handleUploaded} />
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No images yet — click &quot;New image&quot; to upload one.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <ContentImageCard
              key={image.id}
              image={image}
              onDelete={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadImageDialog({
  projectId,
  onUploaded,
}: {
  projectId: string;
  onUploaded: (image: ContentImageRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [slotKey, setSlotKey] = useState('');
  const [altEn, setAltEn] = useState('');
  const [altEs, setAltEs] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSlotKey('');
    setAltEn('');
    setAltEs('');
    setPendingFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleUpload() {
    if (!pendingFile) {
      setError('Choose a file first.');
      return;
    }
    if (!slotKey.trim()) {
      setError(
        "Slot key is required — it's how you'll reference this image in MDX.",
      );
      return;
    }
    if (!altEn.trim()) {
      setError('English alt text is required (accessibility).');
      return;
    }

    startTransition(async () => {
      const result = await uploadImage({
        file: pendingFile,
        kind: 'content',
        projectId,
        altEn,
        altEs,
        slotKey: slotKey.trim(),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onUploaded({
        id: result.image.id,
        storage_path: result.image.storage_path,
        slot_key: slotKey.trim(),
        width: result.image.width,
        height: result.image.height,
        alt: { en: altEn, es: altEs },
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" />}>
        <Plus className="size-4" />
        New image
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload content image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slot-key">Slot key</Label>
            <Input
              id="slot-key"
              value={slotKey}
              onChange={(e) => setSlotKey(e.target.value)}
              placeholder="arch-diagram-1"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="content-alt-en">Alt text (English)</Label>
              <Input
                id="content-alt-en"
                value={altEn}
                onChange={(e) => setAltEn(e.target.value)}
                placeholder="Architecture diagram"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-alt-es">Alt text (Spanish)</Label>
              <Input
                id="content-alt-es"
                value={altEs}
                onChange={(e) => setAltEs(e.target.value)}
                placeholder="Diagrama de arquitectura"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-file">Image file</Label>
            <Input
              id="content-file"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                setPendingFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" disabled={isPending} onClick={handleUpload}>
            {isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContentImageCard({
  image,
  onDelete,
}: {
  image: ContentImageRow;
  onDelete: (imageId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(`<ProjectImage slot="${image.slot_key}" />`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteImage(image.id, image.storage_path);
      if (!result.success) {
        setError(result.error ?? 'Failed to delete image.');
        return;
      }
      onDelete(image.id);
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Top: image */}
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={getImagePublicUrl(image.storage_path)}
          alt={image.alt?.en ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Bottom: data + actions */}
      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-medium">{image.slot_key}</p>
        {image.alt?.en && (
          <p className="truncate text-xs text-muted-foreground">
            {image.alt.en}
          </p>
        )}

        <div className="flex items-center gap-1 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? 'Copied' : 'Copy tag'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any <code>{`<ProjectImage slot="${image.slot_key}" />`}</code>{' '}
                  tag still in the MDX body will show as missing after this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
