import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import prisma from "@/lib/prisma";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ProductCard from "@/components/shared/ProductCard";

export default async function FeaturedProducts() {
  let featuredProducts: any[] = [];
  let saleEndDate = null;
  
  try {
    const [products, config] = await Promise.all([
      prisma.product.findMany({
        where: { is_featured: true, status: 1 },
        include: { category: true },
        take: 8
      }),
      prisma.siteConfig.findUnique({
        where: { key: 'featured_sale_end_date' }
      })
    ]);
    
    featuredProducts = products;
    if (config && config.value) {
      saleEndDate = String(config.value);
    } else {
      // Fallback: 3 days from now if not set
      const d = new Date();
      d.setDate(d.getDate() + 3);
      saleEndDate = d.toISOString();
    }
  } catch (e) {
    console.error("Prisma not ready yet or no data", e);
    // Fallback: 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    saleEndDate = d.toISOString();
  }

  return (
    <section className="w-full py-24 px-6 bg-zinc-50/50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">Featured Specialties</h2>
            <p className="text-zinc-500 mt-2 font-medium">Handpicked sacred items for you</p>
          </div>
          <div className="hidden md:block">
            {saleEndDate && <CountdownTimer targetDate={saleEndDate} />}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {featuredProducts.map((product: any) => (
            <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Global style for hiding webkit scrollbar but allowing scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `}} />
      </div>
    </section>
  );
}
