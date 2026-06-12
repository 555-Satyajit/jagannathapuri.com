export default function ShopSkeleton() {
  return (
    <div className="container max-w-[1400px] mx-auto px-6 py-8">
      
      {/* Horizontal Filter Bar Skeleton */}
      <div className="sticky top-[72px] z-40 bg-[#fcfaf8]/90 py-4 mb-8 border-b border-zinc-200/60">
        <div className="flex flex-row md:items-center justify-between gap-3 md:gap-4">
          
          {/* Mobile Category Dropdown Skeleton */}
          <div className="relative flex-1 md:hidden h-10 bg-zinc-200 rounded-full animate-pulse" />

          {/* Desktop Category Pills Skeleton */}
          <div className="hidden md:flex items-center gap-2 overflow-hidden w-full md:w-auto">
             {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-28 bg-zinc-200 rounded-full animate-pulse shrink-0" />
             ))}
          </div>
          
          {/* Sort Dropdown Skeleton */}
          <div className="flex-1 md:flex-none h-10 md:w-40 bg-zinc-200 rounded-full animate-pulse shrink-0" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full">
        {/* Top Bar skeleton */}
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 gap-y-8 sm:gap-y-12">
          {Array.from({ length: 20 }, (_, i) => i).map((card) => (
            <div key={card} className="w-full flex flex-col bg-transparent rounded-none h-full">
              <div className="relative aspect-[4/5] bg-[#f4f2ee] rounded-2xl animate-pulse" />
              <div className="p-6 flex flex-col flex-1">
                <div className="h-3 bg-zinc-200 rounded w-1/4 mb-4 animate-pulse" />
                <div className="h-5 bg-zinc-200 rounded w-3/4 mb-6 animate-pulse" />
                <div className="mt-auto flex justify-between items-end pt-2 border-t border-zinc-50">
                  <div className="h-6 bg-zinc-200 rounded w-16 animate-pulse" />
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f2ee] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
