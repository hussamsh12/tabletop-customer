import { Skeleton } from '@/components/ui/skeleton';

export default function StoreLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="h-16 border-b bg-background">
        <div className="container h-full flex items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Category bar skeleton */}
      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="flex gap-2 p-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container px-4 py-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
