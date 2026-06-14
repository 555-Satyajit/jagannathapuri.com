import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <Skeleton className="h-32 w-1/3 rounded-lg" />
            <Skeleton className="h-32 w-1/3 rounded-lg" />
            <Skeleton className="h-32 w-1/3 rounded-lg" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
