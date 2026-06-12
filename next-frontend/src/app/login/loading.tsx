import { Skeleton } from "@/components/ui/skeleton"

export default function LoginLoading() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-6">
            <div className="space-y-2 text-center">
              <Skeleton className="h-8 w-4/5 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex items-center gap-4 py-2">
                <Skeleton className="h-[1px] flex-1" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[1px] flex-1" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      </div>
    </div>
  )
}
