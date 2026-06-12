import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function SpiritualResources() {
  let categories: any[] = [];
  
  try {
    categories = await prisma.libraryCategory.findMany({
      where: { 
        status: "Active",
        show_on_home: true
      },
      orderBy: { created_at: "desc" },
      take: 3,
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch spiritual resource categories", error);
  }

  if (!categories || categories.length === 0) return null;

  const getImageUrl = (img?: string | null) => {
    if (!img) return "https://placehold.co/600x800?text=Jay+Subhdra";
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return `/uploads/${img}`;
  };

  return (
    <section className="w-full py-24 px-6 bg-zinc-50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-orange-600" />
              Spiritual Resources
            </h2>
            <p className="text-zinc-500 mt-2 font-medium">Explore categories of divine stories, rituals, and heritage.</p>
          </div>
          <Link href="/library" className="hidden md:flex items-center gap-2 font-bold text-orange-600 hover:text-orange-700 transition-colors">
            View All Library <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category: any) => (
            <Link 
              href={`/library/category/${category.slug}`} 
              key={category.id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-zinc-100"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                <Image
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                  {category._count?.contents || 0} Articles
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-zinc-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-zinc-500 line-clamp-3 mb-6">
                    {category.description}
                  </p>
                )}
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-50">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider group-hover:text-orange-700 transition-colors">
                    Explore Category
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
