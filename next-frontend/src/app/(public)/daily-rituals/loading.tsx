import { Flame, Sun, Info, ChevronRight } from "lucide-react"

export default function DailyRitualsLoading() {
  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24 animate-pulse">
      {/* Skeleton Header */}
      <div className="bg-[#fcfaf8] pt-24 pb-12 px-6 border-b border-zinc-100">
        <div className="container max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-3 bg-zinc-200 rounded-full"></div>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <div className="w-12 h-3 bg-zinc-200 rounded-full"></div>
          </div>
          <div className="w-3/4 max-w-lg h-12 md:h-14 bg-zinc-200 rounded-2xl mb-6"></div>
          <div className="w-2/3 max-w-md h-5 bg-zinc-100 rounded-full"></div>
          <div className="w-1/2 max-w-sm h-5 bg-zinc-100 rounded-full mt-2"></div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Skeleton Daily Rituals */}
        <section className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-orange-100/50 flex items-center justify-center text-orange-300">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="w-40 h-8 bg-zinc-200 rounded-lg mb-2"></div>
              <div className="w-24 h-4 bg-zinc-100 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border border-zinc-100 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 shrink-0"></div>
                <div className="w-full">
                  <div className="w-3/4 h-4 bg-zinc-200 rounded-full mb-2"></div>
                  <div className="w-1/2 h-3 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skeleton Darshan Timings */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-300">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="w-48 h-8 bg-zinc-200 rounded-lg mb-2"></div>
              <div className="w-32 h-4 bg-zinc-100 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-amber-50 shrink-0 hidden sm:block"></div>
                  <div className="w-full sm:w-1/2">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-32 h-5 bg-zinc-200 rounded-md"></div>
                      <div className="w-16 h-4 bg-amber-50 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="w-32 h-8 bg-amber-50/50 rounded-xl sm:bg-zinc-100"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Skeleton Temple Facts */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-300">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <div className="w-40 h-8 bg-zinc-200 rounded-lg mb-2"></div>
              <div className="w-32 h-4 bg-zinc-100 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-zinc-100 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 shrink-0"></div>
                <div className="w-full">
                  <div className="w-2/3 h-6 bg-zinc-200 rounded-lg mb-3"></div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full mb-2"></div>
                  <div className="w-5/6 h-3 bg-zinc-100 rounded-full mb-2"></div>
                  <div className="w-4/6 h-3 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
