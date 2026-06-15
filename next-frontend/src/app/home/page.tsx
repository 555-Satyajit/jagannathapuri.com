import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import CurrentRitual from "@/components/home/CurrentRitual";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ExploreTreasures from "@/components/home/ExploreTreasures";
import SpiritualResources from "@/components/home/SpiritualResources";
import Testimonials from "@/components/home/Testimonials";
import { Suspense } from "react";
import { 
  HeroSkeleton,
  CategoriesSkeleton, 
  CurrentRitualSkeleton,
  ExploreTreasuresSkeleton, 
  FeaturedProductsSkeleton, 
  SpiritualResourcesSkeleton, 
  TestimonialsSkeleton 
} from "@/components/home/HomeSkeletons";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white font-sans text-zinc-900">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories />
      </Suspense>

      <Suspense fallback={<CurrentRitualSkeleton />}>
        <CurrentRitual />
      </Suspense>

      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<ExploreTreasuresSkeleton />}>
        <ExploreTreasures />
      </Suspense>

      <Suspense fallback={<SpiritualResourcesSkeleton />}>
        <SpiritualResources />
      </Suspense>

      {/* <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense> */}
    </main>
  );
}
