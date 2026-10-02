import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Skeleton className="h-4 w-32" />

      <div className="mt-0 flex flex-col gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 border-b pb-8 last:border-b-0 last:pb-0 md:flex-row md:gap-8"
          >
            <div className="md:w-64 md:shrink-0">
              <Skeleton className="aspect-video w-full rounded-lg" />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
