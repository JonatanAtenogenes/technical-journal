import { getImagePublicUrl } from '@/lib/supabase/storage';

export type ContentImage = {
  slot_key: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  alt: { en?: string; es?: string } | null;
  caption: { en?: string; es?: string };
};

// MDX custom components can't fetch their own data or receive extra
// context props from the author (the MDX just writes
// <ProjectImage slot="arch-diagram-1" />, nothing else). So instead of
// each instance querying the DB itself, the caller fetches all of a
// project's content images ONCE and builds a components map via this
// factory — the lookup below is then just an in-memory find(), no
// per-image network round trip.
export function createMdxComponents(
  images: ContentImage[],
  locale: 'en' | 'es',
) {
  return {
    ProjectImage: ({ slot }: { slot: string }) => {
      const image = images.find((img) => img.slot_key === slot);

      if (!image) {
        // Renders inline instead of throwing, so one missing/renamed
        // slot doesn't break the whole compile — visible in both the
        // admin preview and (if it ever ships broken) the public site,
        // which is the point: it should be obvious and easy to spot.
        return (
          <div
            style={{
              border: '1px dashed #e11d48',
              borderRadius: '6px',
              padding: '1rem',
              color: '#e11d48',
              fontSize: '0.875rem',
            }}
          >
            Missing image for slot: <code>{slot}</code>
          </div>
        );
      }

      const alt = image.alt?.[locale] ?? image.alt?.en ?? '';
      const caption = image.caption?.[locale] ?? image.caption?.en;

      return (
        <figure>
          <img
            src={getImagePublicUrl(image.storage_path)}
            alt={alt}
            width={image.width ?? 1200}
            height={image.height ?? 630}
            style={{ width: '100%', height: 'auto' }}
            loading="eager"
          />
          {caption && (
            <figcaption style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              {caption}
            </figcaption>
          )}
        </figure>
      );
    },
  };
}
