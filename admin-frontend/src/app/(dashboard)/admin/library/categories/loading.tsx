import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryCategoriesLoading() {
  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border bg-card">
        <div className="h-12 border-b flex items-center px-4">
          <Skeleton className="h-4 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b flex items-center px-4 gap-4">
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 shrink-0 ml-auto" />
          </div>
        ))}
        {/* Pagination skeleton */}
        <div className="h-14 flex items-center justify-between px-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
