import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Sunrise, Flame, BookOpen, Clock, Info, ChevronRight, ChevronDown, Sparkles } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"

export const metadata = {
  title: "Jagannath Temple Daily Rituals | Niti & Timings | Jagannathapuri",
  description: "Discover the sacred daily rituals (Niti) of Lord Jagannath at the Puri Temple. Learn about the exact timings of Mangala Alati, Abakasha, and Sandhya Dhupa.",
  keywords: "Jagannath temple rituals, Puri temple timings, Mangala Alati, Lord Jagannath Niti, Sandhya Dhupa, Puri darshan timings",
}

const getIcon = (iconName: string) => {
  if (!iconName) return <Sun className="w-5 h-5" />;
  if (iconName.includes('sun')) return <Sun className="w-5 h-5" />;
  if (iconName.includes('moon')) return <Moon className="w-5 h-5" />;
  if (iconName.includes('sunrise') || iconName.includes('morning')) return <Sunrise className="w-5 h-5" />;
  if (iconName.includes('fire') || iconName.includes('flame')) return <Flame className="w-5 h-5" />;
  if (iconName.includes('book')) return <BookOpen className="w-5 h-5" />;
  if (iconName.includes('info')) return <Info className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
}

export default async function DailyRitualsPage() {
  const [rituals, darshans, facts] = await Promise.all([
    prisma.dailyRitual.findMany({ where: { status: 'Active' }, orderBy: { created_at: 'asc' } }),
    prisma.darshanTiming.findMany({ where: { status: 'Active' }, orderBy: { created_at: 'asc' } }),
    prisma.templeFact.findMany({ where: { status: 'Active' }, orderBy: { created_at: 'desc' } })
  ]);

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      {/* Minimal Header (Matches Shop Page) */}
      <div className="bg-[#fcfaf8] pt-24 pb-12 px-6 border-b border-zinc-100">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-medium text-xs mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-900 font-bold">Temple</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-zinc-900 mb-6 tracking-tight">
            Temple Rituals & Darshan
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto tracking-wide">
            Explore the recommended spiritual practices, temple timings, and fascinating facts.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 mt-16 space-y-24">
        
        {/* Live Temple Updates - Vertical Feed */}
        {rituals.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <div className="relative">
                  <Flame className="w-6 h-6 relative z-10" />
                  <span className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-zinc-900">Live Temple Updates</h2>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                   ନୀତି ଅପଡେଟ୍ (Live)
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {rituals.map((ritual: any) => (
                <div key={ritual.id} className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-orange-300 hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-amber-300 opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="flex gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
                      {getIcon(ritual.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {ritual.time}
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-zinc-800 leading-relaxed text-balance">
                        {ritual.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Darshan Timings - Compact List with Inline Chips */}
        {darshans.length > 0 && (
          <section className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-zinc-900">Darshan Timings</h2>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">Plan your visit</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {darshans.map((darshan: any) => (
                <div key={darshan.id} className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 hidden sm:flex">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-zinc-900 leading-none">{darshan.name}</h3>
                        <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider leading-none">
                          {darshan.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-zinc-800 font-bold bg-amber-50/50 px-4 py-2 rounded-xl border border-amber-100/50 sm:border-0 sm:bg-transparent sm:p-0">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="tracking-tight">{darshan.timeRange}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Temple Facts - Simple Grid */}
        {facts.length > 0 && (
          <section className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-zinc-900">Temple Facts</h2>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1">Divine Mysteries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facts.map((fact: any) => (
                <div key={fact.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-600 shrink-0">
                    {getIcon(fact.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{fact.title}</h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {fact.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
