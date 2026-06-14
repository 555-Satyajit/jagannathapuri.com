import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-xl bg-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-background" />
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Frame */}
      <div className="border rounded-xl bg-card overflow-hidden mt-4">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
