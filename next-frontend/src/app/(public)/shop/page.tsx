import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ShopSidebar from "@/components/shop/ShopSidebar";
import ProductCard from "@/components/shared/ProductCard";
import Pagination from "@/components/shop/Pagination";
import ShopSkeleton from "@/components/shop/ShopSkeleton";
import { SearchX, ChevronRight } from "lucide-react";
import Link from "next/link";
// import { Prisma } from "@prisma/client";

import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug = typeof params.category === "string" ? params.category : undefined;

  if (categorySlug && categorySlug !== "all") {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (category) {
      return {
        title: category.meta_title || `${category.name} | Shop Jagannathapuri`,
        description: category.meta_description || category.description?.substring(0, 160) || `Browse our sacred collection of ${category.name}.`,
        keywords: category.meta_keywords || undefined,
      };
    }
  }

  return {
    title: "Shop | Jagannathapuri",
    description: "Browse our sacred collection of items.",
  };
}

const ITEMS_PER_PAGE = 20; // Increased to show more products per page

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams;
  return (
    <div className="bg-[#fcfaf8] min-h-screen">
      {/* Minimalist Quiet Luxury Hero Banner */}
      <div className="bg-[#fcfaf8] pt-24 pb-12 px-6 border-b border-zinc-100">
        <div className="container max-w-7xl mx-auto text-center">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-medium text-xs mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-900 font-bold">Shop</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-zinc-900 mb-6 tracking-tight">
            {params.search ? `Search results for "${params.search}"` : "Our Sacred Collection"}
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto tracking-wide">
            Discover handpicked spiritual items, rituals, and authentic treasures crafted with devotion.
          </p>
        </div>
      </div>

      <Suspense fallback={<ShopSkeleton />} key={JSON.stringify(params)}>
        <ShopContent searchParams={params} />
      </Suspense>
    </div>
  );
}

async function ShopContent({ searchParams }: { searchParams: any }) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  // Build Prisma Where clause
  const where: any = { status: 1 }; // Only active products
  
  if (searchParams.search) {
    const searchTerms = (searchParams.search as string).split(' ').filter(term => term.trim().length > 0);
    
    if (searchTerms.length > 0) {
      // Create an AND condition where EVERY word typed must match somewhere in the product
      where.AND = searchTerms.map(term => ({
        OR: [
          { product_name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { product_brand: { contains: term, mode: 'insensitive' } },
          { meta_keywords: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } }
        ]
      }));
    }
  }
  
  if (searchParams.category && searchParams.category !== 'all') {
    where.category = {
      slug: searchParams.category as string
    };
  }

  // Build Prisma OrderBy
  let orderBy: any = { created_at: 'desc' };
  if (searchParams.sort === 'price_asc') orderBy = { price_amount: 'asc' };
  if (searchParams.sort === 'price_desc') orderBy = { price_amount: 'desc' };
  if (searchParams.sort === 'name_asc') orderBy = { product_name: 'asc' };

  // Fetch Data
  const [products, totalProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: { category: true }
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { status: { in: ['Publish', 'Active'] } },
      include: {
        _count: {
          select: { products: { where: { status: 1 } } }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-[1400px] mx-auto px-6 py-8">
      
      {/* Horizontal Filter Bar */}
      <ShopSidebar categories={categories as any} totalProducts={totalProducts} />

      {/* Main Product Grid */}
      <div className="w-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 gap-4">
          <p className="text-zinc-500 font-medium text-sm uppercase tracking-widest">
            Showing <span className="text-zinc-900 font-bold">{products.length > 0 ? skip + 1 : 0}</span> to <span className="text-zinc-900 font-bold">{Math.min(skip + ITEMS_PER_PAGE, totalProducts)}</span> of <span className="text-zinc-900 font-bold">{totalProducts}</span>
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 gap-y-8 sm:gap-y-12">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
              
              <Pagination currentPage={page} totalPages={totalPages} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 mb-2">No products found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                We couldn't find any items matching your current filters. Try adjusting your search or clearing some filters to see more results.
              </p>
            </div>
        )}
      </div>
    </div>
  );
}
