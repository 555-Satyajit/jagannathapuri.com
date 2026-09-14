import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Paintbrush } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/shared/ProductCard";

export default async function PromotePatachitra() {
  let patachitras: any[] = [];
  
  try {
    patachitras = await prisma.product.findMany({
      where: { 
        status: 1,
        category: {
          name: {
            equals: 'Patachitra',
            mode: 'insensitive'
          }
        }
      },
      include: { category: true },
      take: 8
    });
  } catch (e) {
    console.error("Prisma not ready yet or no data", e);
  }

  if (patachitras.length === 0) return null;

  return (
    <section className="w-full py-24 px-6 bg-[#FDF9F1]">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-[#F3E8D6] pb-4">
          <div className="flex items-center gap-3">
            <Paintbrush className="w-8 h-8 text-[#D35400]" />
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4A2511] tracking-tight">Authentic Patachitra</h2>
              <p className="text-[#D35400] mt-2 font-medium italic">Handcrafted Heritage from Odisha</p>
            </div>
          </div>
          <div className="hidden md:block">
            <Link 
              href="/shop" 
              className="inline-flex items-center text-sm font-semibold text-[#D35400] hover:text-[#A04000] transition-colors gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {patachitras.map((product: any) => (
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
