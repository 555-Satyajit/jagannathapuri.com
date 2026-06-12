export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <section className="bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="h-10 w-48 bg-zinc-200 animate-pulse rounded-full mx-auto mb-8"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className="flex flex-col rounded-2xl overflow-hidden border border-zinc-200 bg-white"
              >
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-zinc-100 animate-pulse"></div>
                
                {/* Content Placeholder */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Subtitle Placeholder */}
                  <div className="h-3 w-24 bg-zinc-200 animate-pulse rounded mb-3"></div>
                  
                  {/* Title Placeholder */}
                  <div className="h-6 w-3/4 bg-zinc-200 animate-pulse rounded mb-4"></div>
                  
                  {/* Description Placeholder */}
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="h-4 w-full bg-zinc-100 animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-zinc-100 animate-pulse rounded"></div>
                    <div className="h-4 w-5/6 bg-zinc-100 animate-pulse rounded"></div>
                  </div>
                  
                  {/* Button Placeholder */}
                  <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-4">
                    <div className="h-10 w-full bg-zinc-200 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
