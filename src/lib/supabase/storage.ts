// Bucket name — must match exactly what's created in the Supabase
// dashboard (Storage → New bucket → "project-images", public).
export const IMAGE_BUCKET = 'project-images';

// Pure string helper: Supabase's own getPublicUrl() is just this
// concatenation under the hood, but doing it directly avoids needing a
// Supabase client instance (and its async setup) in places that only
// need to render an <img src>, like Server Components or the MDX
// display component.
export function getImagePublicUrl(storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${storagePath}`;
}
