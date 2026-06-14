import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Table Frame */}
      <div className="border rounded-xl bg-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        
        {/* Table Rows */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
