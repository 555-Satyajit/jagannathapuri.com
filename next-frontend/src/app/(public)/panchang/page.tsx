import prisma from "@/lib/prisma"
import Link from "next/link"
import { ChevronRight, Calendar, Moon, Sun, Sparkles, Star } from "lucide-react"
import PanchangDateNavigator from "@/components/panchang/PanchangDateNavigator"

export const metadata = {
  title: "Daily Panchang & Almanac | Jagannathapuri",
  description: "Access the complete Vedic calendar with accurate Tithi, Nakshatra, and auspicious timings.",
}

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  // 1. Determine selected date (UTC 00:00:00 logic to match DB)
  let selectedDate = new Date();
  if (resolvedSearchParams.date) {
    const [y, m, d] = resolvedSearchParams.date.split('-').map(Number);
    if (y && m && d) {
       selectedDate = new Date(Date.UTC(y, m - 1, d)); // e.g. 2026-02-18T00:00:00.000Z
    }
  } else {
    selectedDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
  }

  const nextDay = new Date(selectedDate);
  nextDay.setUTCDate(selectedDate.getUTCDate() + 1);

  // 2. Fetch Data
  const [panchang, upcomingFestivals] = await Promise.all([
    prisma.panchang.findFirst({
      where: {
        date: {
          gte: selectedDate,
          lt: nextDay,
        }
      }
    }),
    prisma.festival.findMany({
      where: {
        date: {
          gte: selectedDate,
        },
        status: 'Active'
      },
      orderBy: {
        date: 'asc'
      },
      take: 10
    })
  ]);

  // Safely parse JSON data
  const panchangData: any = panchang?.data || null;
  const sections = panchangData?.sections || [];
  
  const firstSection = sections.length > 0 ? sections[0] : null;
  const otherSections = sections.slice(1).filter((s: any) => s.title !== 'Panchang Details');
  const detailsSection = sections.find((s: any) => s.title === 'Panchang Details');

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      {/* Minimal Header (Consistent with Shop/Daily Rituals) */}
      <div className="bg-[#fcfaf8] pt-24 pb-12 px-6 border-b border-zinc-100">
        <div className="container max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-medium text-xs mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-900 font-bold">Temple</span>
          </div>
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-100 text-orange-600 text-sm font-bold border border-orange-200 mb-6 uppercase tracking-widest">
            <Calendar className="w-4 h-4" /> Vedic Calendar 2026
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-zinc-900 mb-6 tracking-tight">
            Daily Panchang & Almanac
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto tracking-wide">
            Access the complete Vedic calendar with accurate Tithi, Nakshatra, and auspicious timings for every day.
          </p>
        </div>
      </div>

      <div className="container max-w-[1400px] mx-auto px-4 md:px-6 mt-12">
        
        {/* Date Navigator Client Component */}
        <PanchangDateNavigator />

        {panchang ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: Summary & Timings (3 cols) */}
            <div className="xl:col-span-3 flex flex-col gap-6">
              
              {firstSection && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                  <h3 className="text-xl font-bold text-zinc-900 font-serif leading-tight mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    {firstSection.title}
                  </h3>
                  <div className="space-y-3 relative z-10">
                    {firstSection.fields?.map((field: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                        <span className="text-zinc-500 font-medium">{field.label}</span>
                        <span className="font-bold text-zinc-900 text-right">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherSections.map((section: any, sIdx: number) => (
                <div key={sIdx} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
                  <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.fields?.map((field: any, fIdx: number) => (
                      <div key={fIdx} className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                        <span className="text-orange-600 font-bold text-xs block mb-1 uppercase tracking-wider">
                          {field.label}
                        </span>
                        <span className="text-zinc-900 font-bold text-sm">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMN 2: Data Grid - Panchang Details (6 cols) */}
            <div className="xl:col-span-6 h-full">
              {detailsSection ? (
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-zinc-200 h-full">
                  <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-8 flex items-center gap-3 border-b border-zinc-100 pb-4">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    Panchang Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {detailsSection.fields?.map((field: any, idx: number) => (
                      <div key={idx} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">
                          {field.label}
                        </span>
                        <h4 className="font-bold text-zinc-900 text-base leading-snug">
                          {field.value}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 h-full flex items-center justify-center">
                  <p className="text-zinc-500 italic font-medium">No specific Panchang Details found for this date.</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: Upcoming Festivals (3 cols) */}
            <div className="xl:col-span-3 h-full">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 h-full flex flex-col">
                <h3 className="text-xl font-bold text-zinc-900 font-serif mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  Upcoming Festivals
                </h3>
                
                <div className="flex-1 flex flex-col gap-2">
                  {upcomingFestivals.length > 0 ? (
                    upcomingFestivals.map((fest: any) => {
                      const festDateStr = fest.date.toISOString().split('T')[0];
                      const selDateStr = selectedDate.toISOString().split('T')[0];
                      const isToday = festDateStr === selDateStr;
                      
                      return (
                        <div 
                          key={fest.id} 
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            isToday 
                              ? 'bg-orange-50 border-orange-200 shadow-sm' 
                              : 'bg-white border-zinc-100 hover:border-zinc-300'
                          }`}
                        >
                          <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-orange-600' : 'text-zinc-500'}`}>
                            {fest.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className={`text-sm font-bold text-right ${isToday ? 'text-zinc-900' : 'text-zinc-700'}`}>
                            {fest.name}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-8 text-center bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
                      <p className="text-xs text-zinc-500 font-medium">No upcoming festivals found.</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 mt-auto">
                  <Link href="/festivals" className="block w-full text-center py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">
                    View Full Calendar
                  </Link>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-zinc-200 text-center min-h-[400px] flex flex-col justify-center items-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-zinc-900 mb-3">No Panchang Data Found</h3>
            <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
              Astrological data for <span className="text-zinc-900 font-bold">{selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span> is not yet available in our database.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
