import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export function CategoriesSkeleton() {
  return (
    <section className="w-full py-10 px-6 bg-transparent">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-center md:justify-start items-center mb-6">
          <Skeleton className="h-8 md:h-10 w-64 rounded-md" />
        </div>
        <div className="flex overflow-hidden gap-4 md:gap-8 pb-4 pt-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-start h-full shrink-0 w-[80px] md:w-[100px]">
              <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full mb-3" />
              <Skeleton className="h-3 w-16 md:w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="w-full py-20 px-6 bg-transparent">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-4">
          <div>
            <Skeleton className="h-8 md:h-10 w-72 rounded-md mb-2" />
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <Skeleton className="h-5 w-32 hidden md:block rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="group flex flex-col bg-white rounded-3xl p-3 shadow-sm border border-zinc-100">
              <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
              <div className="flex flex-col gap-2 px-1 pb-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExploreTreasuresSkeleton() {
  return (
    <section className="w-full py-16 px-6 bg-zinc-50 border-y border-zinc-100">
      <div className="container max-w-7xl mx-auto flex flex-col items-center">
        <Skeleton className="h-8 w-64 rounded-md mb-4" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md mb-8" />
        
        {/* Tabs Skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 w-full max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="group flex flex-col bg-white rounded-3xl p-3 shadow-sm border border-zinc-100">
               <Skeleton className="w-full aspect-[4/5] rounded-2xl mb-4" />
               <div className="flex flex-col gap-2 px-1 pb-2">
                 <Skeleton className="h-4 w-3/4 rounded-md" />
                 <Skeleton className="h-6 w-20 rounded-md mt-2" />
               </div>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpiritualResourcesSkeleton() {
  return (
    <section className="w-full py-24 px-6 bg-zinc-50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-zinc-300" />
              <Skeleton className="h-8 md:h-10 w-72 rounded-md" />
            </div>
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-5 w-32 hidden md:block rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
              <Skeleton className="w-full aspect-[16/10]" />
              <div className="p-6 flex flex-col flex-1 gap-3">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md mb-4" />
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSkeleton() {
  return (
    <section className="w-full py-24 px-6 bg-white overflow-hidden relative">
      <div className="container max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        <Skeleton className="h-8 md:h-10 w-64 rounded-md mb-4 bg-zinc-200" />
        <Skeleton className="h-5 w-96 rounded-md mb-12 bg-zinc-200" />
        
        <div className="w-full max-w-4xl bg-white rounded-[2rem] p-8 md:p-12 relative overflow-visible border border-zinc-100 shadow-sm">
           <Skeleton className="h-6 w-32 rounded-md mb-6 bg-zinc-200" />
           <Skeleton className="h-6 md:h-8 w-full rounded-md mb-3 bg-zinc-200" />
           <Skeleton className="h-6 md:h-8 w-5/6 rounded-md mb-8 bg-zinc-200" />
           <div className="flex items-center gap-4">
             <Skeleton className="h-12 w-12 rounded-full bg-zinc-200" />
             <div>
                <Skeleton className="h-5 w-32 rounded-md mb-1 bg-zinc-200" />
                <Skeleton className="h-4 w-24 rounded-md bg-zinc-200" />
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center bg-orange-50 overflow-hidden">
      <div className="absolute inset-0 bg-white/50 animate-pulse" />
      <div className="container relative z-20 w-full max-w-7xl h-full mx-auto flex items-center">
        <div className="max-w-2xl space-y-6 ml-6 lg:ml-12 w-full">
          <Skeleton className="h-8 w-48 rounded-full bg-zinc-200" />
          <Skeleton className="h-16 md:h-20 w-3/4 rounded-xl bg-zinc-200" />
          <Skeleton className="h-16 md:h-20 w-2/3 rounded-xl bg-zinc-200" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-5 w-full rounded-md bg-zinc-200" />
            <Skeleton className="h-5 w-5/6 rounded-md bg-zinc-200" />
            <Skeleton className="h-5 w-4/6 rounded-md bg-zinc-200" />
          </div>
          <div className="pt-8">
            <Skeleton className="h-14 w-48 rounded-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CurrentRitualSkeleton() {
  return (
    <section className="w-full py-16 px-6 bg-orange-50/50">
      <div className="container max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-xl flex flex-col md:flex-row items-stretch border border-orange-100">
          <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto min-h-[300px]">
            <Skeleton className="w-full h-full absolute inset-0" />
          </div>
          <div className="p-10 md:p-16 flex flex-col justify-center w-full md:w-1/2 gap-4">
            <Skeleton className="h-8 w-48 rounded-full mb-2" />
            <Skeleton className="h-10 w-64 rounded-md" />
            <Skeleton className="h-8 w-48 rounded-md mb-2" />
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-5/6 rounded-md mb-4" />
            <div className="flex items-center gap-4 mt-4">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
