export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] pt-24 pb-20">
      <div className="container max-w-7xl mx-auto px-6">
        
        {/* Page Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full">
            
            {/* Mobile Category Dropdown Skeleton */}
            <div className="block lg:hidden w-full h-12 bg-zinc-200 animate-pulse rounded-xl mb-8"></div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i}
                  className="flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200"
                >
                  <div className="w-full h-32 md:h-56 bg-zinc-100 animate-pulse"></div>
                  <div className="p-3 md:p-6 flex flex-col flex-1">
                    <div className="flex gap-1.5 md:gap-2 mb-2 md:mb-4">
                      <div className="h-4 md:h-5 w-12 md:w-16 bg-zinc-100 animate-pulse rounded-sm"></div>
                    </div>
                    <div className="h-4 md:h-6 w-3/4 bg-zinc-200 animate-pulse rounded mb-2 md:mb-4"></div>
                    <div className="space-y-1 md:space-y-2 mb-3 md:mb-6">
                      <div className="h-2.5 md:h-4 w-full bg-zinc-100 animate-pulse rounded"></div>
                      <div className="h-2.5 md:h-4 w-5/6 bg-zinc-100 animate-pulse rounded"></div>
                    </div>
                    <div className="mt-auto pt-2 md:pt-4 border-t border-zinc-100 flex justify-between">
                      <div className="h-3 md:h-4 w-16 md:w-24 bg-zinc-200 animate-pulse rounded"></div>
                      <div className="h-3 md:h-4 w-12 md:w-20 bg-zinc-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-8">
            <div className="hidden lg:block bg-white rounded-2xl border border-zinc-200 p-6 h-64 animate-pulse"></div>
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 h-96 animate-pulse"></div>
          </aside>

        </div>
      </div>
    </div>
  );
}
