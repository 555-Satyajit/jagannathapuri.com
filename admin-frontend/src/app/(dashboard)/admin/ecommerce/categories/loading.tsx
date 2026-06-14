import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 w-[250px] rounded-md" />
        <Skeleton className="h-10 w-[150px] rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-xl p-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
