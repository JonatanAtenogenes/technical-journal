'use server';

import { createClient } from '@/lib/supabase/server';
import { IMAGE_BUCKET } from '@/lib/supabase/storage';
import sizeOf from 'image-size';

type UploadImageInput = {
  file: File;
  kind: 'cover' | 'content';
  // Content images belong to a project (FK + cascade delete). Cover
  // images don't store project_id — they're reached the other direction,
  // via projects.cover_image_id — but we still need it here to namespace
  // the storage path per project.
  projectId: string;
  altEn: string;
  altEs?: string;
  captionEn?: string;
  captionEs?: string;
  // Required for kind === "content": the identifier referenced inside
  // MDX via <ProjectImage slot="..." />. Unused for covers.
  slotKey?: string;
  position?: number;
};

type UploadResult =
  | {
      success: true;
      image: {
        id: string;
        storage_path: string;
        width: number | null;
        height: number | null;
      };
    }
  | { success: false; error: string };

export async function uploadImage(
  input: UploadImageInput,
): Promise<UploadResult> {
  if (input.kind === 'content' && !input.slotKey) {
    return {
      success: false,
      error: 'slot_key is required for content images.',
    };
  }

  const supabase = await createClient();
  const buffer = Buffer.from(await input.file.arrayBuffer());

  // width/height are nullable in the schema — used only to reserve
  // layout space (avoid CLS). If dimension reading fails for any reason,
  // the upload still proceeds without blocking on it.
  let width: number | null = null;
  let height: number | null = null;
  try {
    const dimensions = sizeOf(buffer);
    width = dimensions.width ?? null;
    height = dimensions.height ?? null;
  } catch {}

  const safeName = input.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const folder = input.kind === 'cover' ? 'covers' : 'content';
  const storagePath = `${folder}/${input.projectId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: input.file.type,
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: image, error: insertError } = await supabase
    .from('images')
    .insert({
      storagePath: storagePath,
      alt: { en: input.altEn, es: input.altEs ?? '' },
      caption:
        input.captionEn || input.captionEs
          ? { en: input.captionEn ?? '', es: input.captionEs ?? '' }
          : null,
      width,
      height,
      kind: input.kind,
      project_id: input.kind === 'content' ? input.projectId : null,
      slot_key: input.kind === 'content' ? input.slotKey : null,
      position: input.position ?? null,
    })
    .select('id, storage_path, width, height')
    .single();

  if (insertError) {
    // Roll back the uploaded file so a failed insert doesn't leave an
    // orphaned object sitting in Storage with no matching DB row.
    await supabase.storage.from(IMAGE_BUCKET).remove([storagePath]);

    if (insertError.code === '23505') {
      return {
        success: false,
        error: 'An image with this slot key already exists for this project.',
      };
    }
    return { success: false, error: insertError.message };
  }

  return { success: true, image };
}

export async function deleteImage(imageId: string, storagePath: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .remove([storagePath]);

  if (storageError) {
    return { success: false, error: storageError.message };
  }

  const { error: dbError } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId);

  if (dbError) {
    return {
      success: false,
      error: dbError.message,
    };
  }

  return { success: true };
}
