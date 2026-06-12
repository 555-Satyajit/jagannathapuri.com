import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsLoading() {
  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      {/* Breadcrumb Skeleton */}
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 bg-zinc-200" />
          <Skeleton className="h-3 w-3 rounded-full bg-zinc-200" />
          <Skeleton className="h-4 w-12 bg-zinc-200" />
          <Skeleton className="h-3 w-3 rounded-full bg-zinc-200" />
          <Skeleton className="h-4 w-24 bg-zinc-200" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          
          {/* Left Column: Gallery Skeleton */}
          <div className="w-full flex flex-col gap-4">
            <Skeleton className="aspect-[4/5] w-full rounded-3xl bg-[#f4f2ee]" />
            <div className="flex gap-4">
              <Skeleton className="w-24 h-32 rounded-xl bg-[#f4f2ee]" />
              <Skeleton className="w-24 h-32 rounded-xl bg-[#f4f2ee]" />
              <Skeleton className="w-24 h-32 rounded-xl bg-[#f4f2ee]" />
            </div>
          </div>

          {/* Right Column: Product Info Skeleton */}
          <div className="w-full flex flex-col pt-4 lg:pt-12">
            
            {/* Header / Title */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32 bg-zinc-200" />
                <Skeleton className="h-4 w-24 bg-zinc-200" />
              </div>
              <Skeleton className="h-12 w-full mb-3 bg-zinc-200" />
              <Skeleton className="h-12 w-2/3 mb-6 bg-zinc-200" />
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-6 w-32 bg-zinc-200" />
                <Skeleton className="h-6 w-24 bg-zinc-200" />
              </div>

              {/* Price */}
              <Skeleton className="h-10 w-40 mb-6 bg-zinc-200" />
            </div>

            {/* Description */}
            <div className="mb-10 flex flex-col gap-3">
              <Skeleton className="h-4 w-full bg-zinc-200" />
              <Skeleton className="h-4 w-full bg-zinc-200" />
              <Skeleton className="h-4 w-5/6 bg-zinc-200" />
              <Skeleton className="h-4 w-4/6 bg-zinc-200" />
            </div>

            {/* Add To Cart */}
            <div className="mb-12 flex flex-col gap-3">
              <Skeleton className="h-4 w-20 bg-zinc-200" />
              <Skeleton className="h-12 w-36 rounded-full bg-zinc-200" />
              <div className="flex flex-col gap-3 mt-3">
                <Skeleton className="h-14 w-full rounded-full bg-zinc-200" />
                <Skeleton className="h-14 w-full rounded-full bg-zinc-200" />
              </div>
            </div>

            {/* Specs */}
            <div className="pt-8 border-t border-zinc-100">
              <Skeleton className="h-6 w-40 mb-6 bg-zinc-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full rounded-2xl bg-zinc-200" />
                <Skeleton className="h-20 w-full rounded-2xl bg-zinc-200" />
                <Skeleton className="h-20 w-full rounded-2xl bg-zinc-200" />
                <Skeleton className="h-20 w-full rounded-2xl bg-zinc-200" />
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="pt-12 mt-12 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <Skeleton className="h-8 w-48 bg-zinc-200" />
              <Skeleton className="h-16 w-32 bg-zinc-200" />
              <Skeleton className="h-12 w-full rounded-full bg-zinc-200 mt-4" />
            </div>
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              <Skeleton className="h-48 w-full rounded-xl bg-zinc-200" />
              <Skeleton className="h-48 w-full rounded-xl bg-zinc-200" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
