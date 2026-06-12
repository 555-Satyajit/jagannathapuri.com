import { ChevronRight, Calendar, Sun, Moon, Sparkles, Star } from "lucide-react"

export default function PanchangLoading() {
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
          <div className="w-40 h-8 bg-orange-100/50 rounded-full mb-6"></div>
          <div className="w-3/4 max-w-lg h-12 md:h-14 bg-zinc-200 rounded-2xl mb-6"></div>
          <div className="w-2/3 max-w-md h-5 bg-zinc-100 rounded-full"></div>
          <div className="w-1/2 max-w-sm h-5 bg-zinc-100 rounded-full mt-2"></div>
        </div>
      </div>

      <div className="container max-w-[1400px] mx-auto px-4 md:px-6 mt-12">
        
        {/* Skeleton Navigator */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-zinc-100 gap-4 mb-10">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="w-10 h-10 rounded-full bg-orange-50"></div>
            <div className="w-48 h-8 bg-zinc-200 rounded-lg"></div>
            <div className="w-10 h-10 rounded-full bg-orange-50"></div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none w-24 h-10 bg-orange-200/50 rounded-xl"></div>
            <div className="flex-1 md:flex-none w-32 h-10 bg-zinc-100 rounded-xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Skeleton COLUMN 1 */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 h-64">
              <div className="flex items-center gap-2 mb-6">
                <Sun className="w-5 h-5 text-zinc-300" />
                <div className="w-24 h-6 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between border-b border-zinc-50 pb-3">
                    <div className="w-20 h-4 bg-zinc-100 rounded-full"></div>
                    <div className="w-16 h-4 bg-zinc-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 h-48">
              <div className="flex items-center gap-2 mb-6">
                <Moon className="w-4 h-4 text-zinc-300" />
                <div className="w-32 h-5 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-12 bg-orange-50/50 rounded-xl"></div>
                <div className="w-full h-12 bg-orange-50/50 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Skeleton COLUMN 2 */}
          <div className="xl:col-span-6 h-full">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-zinc-100 h-full min-h-[500px]">
              <div className="flex items-center gap-3 mb-8 border-b border-zinc-50 pb-4">
                <Sparkles className="w-6 h-6 text-zinc-300" />
                <div className="w-48 h-8 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-50">
                    <div className="w-24 h-3 bg-zinc-200 rounded-full mb-3"></div>
                    <div className="w-3/4 h-5 bg-zinc-300 rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton COLUMN 3 */}
          <div className="xl:col-span-3 h-full">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 h-full min-h-[500px] flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-zinc-300" />
                <div className="w-40 h-6 bg-zinc-200 rounded-md"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-4 rounded-xl border border-zinc-100 flex justify-between">
                    <div className="w-12 h-4 bg-zinc-200 rounded-full"></div>
                    <div className="w-24 h-4 bg-zinc-300 rounded-full"></div>
                  </div>
                ))}
              </div>
              <div className="pt-6 mt-auto">
                <div className="w-full h-10 bg-zinc-100 rounded-xl"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
