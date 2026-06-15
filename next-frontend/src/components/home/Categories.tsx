import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function Categories() {
  let items: any[] = [];
  try {
    const [categories, services] = await Promise.all([
      prisma.category.findMany({
        where: { status: { in: ['Publish', 'Active'] }, parentId: null },
        include: { _count: { select: { products: true } } },
        orderBy: { created_at: 'desc' }
      }),
      prisma.service.findMany({
        where: { status: { in: ['Publish', 'Active'] } },
        orderBy: { created_at: 'desc' }
      })
    ]);

    items = [
      ...services.map((s: any) => ({
        id: `srv-${s.id}`,
        name: s.title,
        image: s.image,
        link: s.link || `/services`
      })),
      ...categories.map((c: any) => ({
        id: `cat-${c.id}`,
        name: c.name,
        image: c.image,
        link: `/shop?category=${c.slug}`
      }))
    ];
  } catch (e) {
    console.error("Prisma not ready yet or no data", e);
  }

  const getImageUrl = (img?: string | null) => {
    if (!img) return "https://placehold.co/600x800?text=Jay+Subhdra";
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return `/uploads/${img}`;
  };

  if (items.length === 0) return null;

  return (
    <section className="w-full py-10 px-6 bg-transparent">
      <div className="container max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex justify-center md:justify-start items-center mb-6">
          <h2 className="text-xl md:text-3xl font-bold text-zinc-900 tracking-tight text-center md:text-left">
            Categories & Services
          </h2>
        </div>
        
        {/* Horizontal Slider */}
        <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((item: any) => (
            <Link key={item.id} href={item.link} className="group block snap-start shrink-0 w-[80px] md:w-[100px]">
              <div className="flex flex-col items-center justify-start h-full">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-50 flex items-center justify-center mb-3 overflow-hidden relative group-hover:scale-105 transition-transform duration-300 border-2 border-transparent group-hover:border-orange-200 shadow-sm">
                  {item.image ? (
                    <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-orange-500" />
                  )}
                </div>
                <h3 className="font-medium text-zinc-800 text-center text-xs md:text-sm group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                  {item.name}
                </h3>
              </div>
            </Link>
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
