import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
      {/* Row 1: Welcome (1), Order Status (1), Stats+Chart (1) */}
      <Skeleton className="col-span-1 h-[250px] rounded-xl" />
      <Skeleton className="col-span-1 h-[250px] rounded-xl" />
      <div className="col-span-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[110px] rounded-xl" />
          <Skeleton className="h-[110px] rounded-xl" />
        </div>
        <Skeleton className="h-[116px] rounded-xl" />
      </div>

      {/* Row 2: Weekly Order + Sales Overview (2), Sales Statistics (1) */}
      <Skeleton className="col-span-1 md:col-span-2 h-[350px] rounded-xl" />
      <Skeleton className="col-span-1 h-[350px] rounded-xl" />

      {/* Row 3: Total Users (1), Top Selling (2) */}
      <Skeleton className="col-span-1 md:col-span-3 xl:col-span-1 h-[400px] rounded-xl" />
      <Skeleton className="col-span-1 md:col-span-3 xl:col-span-2 h-[400px] rounded-xl" />
    </div>
  );
}
