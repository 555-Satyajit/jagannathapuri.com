import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  )
}
