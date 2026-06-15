import prisma from "@/lib/prisma";
import ProductCard from "@/components/shared/ProductCard";

interface YouMayAlsoLikeProps {
  currentProductId: number;
  categoryId?: number | null;
}

export default async function YouMayAlsoLike({ currentProductId, categoryId }: YouMayAlsoLikeProps) {
  let relatedProducts: any[] = [];
  
  try {
    if (categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: {
          category_id: categoryId,
          status: 1,
          id: { not: currentProductId }
        },
        include: { category: true },
        take: 4,
        orderBy: { created_at: 'desc' }
      });
    }

    // Fallback if not enough products in the same category
    if (relatedProducts.length < 4) {
      const moreProducts = await prisma.product.findMany({
        where: {
          status: 1,
          id: { notIn: [currentProductId, ...relatedProducts.map((p: any) => p.id)] }
        },
        include: { category: true },
        take: 4 - relatedProducts.length,
        orderBy: { created_at: 'desc' } // Or random if supported, but desc is safer
      });
      relatedProducts = [...relatedProducts, ...moreProducts];
    }

  } catch (error) {
    console.error("Failed to fetch related products", error);
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="py-24 border-t border-zinc-100 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight mb-10">You May Also Like</h2>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 scrollbar-hide">
          {relatedProducts.map((product: any) => (
            <div key={product.id} className="w-[calc(50%-0.5rem)] min-w-[calc(50%-0.5rem)] shrink-0 snap-start md:w-auto md:min-w-0 md:shrink">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
