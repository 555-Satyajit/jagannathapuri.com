import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartClient from "@/components/product/AddToCartClient";
import ProductSpecs from "@/components/product/ProductSpecs";
import ProductReviewsLazy from "@/components/product/ProductReviewsLazy";
import YouMayAlsoLike from "@/components/product/YouMayAlsoLike";
import { getImageUrl } from "@/lib/utils";
import { Suspense } from "react";
import type { Metadata } from "next";

// Generate SEO metadata based on the product
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.meta_title || `${product.product_name} | Jay Subhdra`,
    description: product.meta_description || product.description?.substring(0, 160) || `Buy ${product.product_name} online.`,
    keywords: product.meta_keywords || "spiritual items, pooja, rudraksha",
  };
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch product and its category only (reviews are lazy loaded)
  const product = await prisma.product.findUnique({
    where: { slug, status: 1 },
    include: { 
      category: true
    }
  });

  if (!product) {
    notFound();
  }

  // Calculate pricing logic
  const isSale = product.on_sale && product.sale_price !== null && product.sale_price > 0;
  const displayPrice = isSale ? product.sale_price! : product.price_amount;
  const originalPrice = product.regular_price || product.price_amount;

  // Rating Display Logic
  // If the product has NO reviews in the DB, we show the mock demo average (4.5) just for the UI preview
  const activeReviewCount = product.reviewCount > 0 ? product.reviewCount : 2; // 2 is from our DEMO_REVIEWS
  const activeAvgRating = product.reviewCount > 0 ? product.averageRating : 4.5;

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-24">
      {/* Elegant Breadcrumb */}
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-zinc-500 font-medium text-xs uppercase tracking-widest">
          <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-zinc-900 transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-zinc-900 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          
          {/* Left Column: Asymmetrical Sticky Gallery */}
          <div className="w-full">
            <ProductGallery images={product.images} productName={product.product_name} />
          </div>

          {/* Right Column: Sticky Product Info */}
          <div className="w-full flex flex-col pt-4 lg:pt-12">
            
            {/* Header / Title */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-orange-600 font-bold tracking-widest uppercase text-sm">
                  {product.product_brand || product.category?.name || "Exclusive Collection"}
                </p>
                {product.sku && (
                  <span className="text-zinc-400 font-mono text-xs tracking-wider">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight mb-4 tracking-tight">
                {product.product_name}
              </h1>
              
              {/* Dynamic Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center text-amber-400 cursor-pointer hover:opacity-80 transition-opacity">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(activeAvgRating) ? 'fill-current' : 'fill-transparent stroke-zinc-300'}`} />
                  ))}
                </div>
                <span className="text-zinc-500 font-medium text-sm cursor-pointer hover:text-zinc-900 transition-colors">
                  ({activeReviewCount} Reviews)
                </span>
                
                {/* Stock Status Badge */}
                <div className="ml-4 pl-4 border-l border-zinc-200">
                  {product.quantity > 0 ? (
                    <span className="text-emerald-600 font-bold text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock ({product.quantity})
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold text-sm">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-4 mb-6">
                <span className="text-3xl font-extrabold text-zinc-900">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                {isSale && (
                  <span className="text-xl font-medium text-zinc-400 line-through mb-1">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Description (Editorial Style) */}
            {product.description && (
              <div className="mb-10 prose prose-zinc max-w-none prose-p:leading-relaxed prose-p:tracking-wide">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Interactive Add To Cart */}
            <div className="mb-12">
              <AddToCartClient 
                productId={product.id} 
                productName={product.product_name} 
                price={displayPrice}
                maxQuantity={product.quantity || 10}
                image={
                  product.images && Array.isArray(product.images) && product.images.length > 0 
                    ? getImageUrl(product.images[0] as string)
                    : undefined
                }
              />
            </div>

            {/* Bento Specs */}
            <ProductSpecs specifications={product.specifications} />

          </div>
        </div>

        {/* Dynamic Reviews Section (Lazy Loaded) */}
        <Suspense fallback={
          <div className="pt-16 mt-16 border-t border-zinc-100 flex flex-col items-center justify-center min-h-[400px] animate-pulse">
            <div className="h-8 w-64 bg-zinc-200 rounded-md mb-8" />
            <div className="flex gap-12 w-full max-w-5xl">
              <div className="w-[320px] shrink-0 space-y-4">
                <div className="h-20 bg-zinc-200 rounded-2xl" />
                <div className="h-32 bg-zinc-200 rounded-2xl" />
                <div className="h-12 bg-zinc-200 rounded-full" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="h-48 bg-zinc-200 rounded-3xl" />
                <div className="h-48 bg-zinc-200 rounded-3xl" />
              </div>
            </div>
          </div>
        }>
          <ProductReviewsLazy 
            productId={product.id} 
            averageRating={product.averageRating} 
            reviewCount={product.reviewCount} 
          />
        </Suspense>
        
      </div>
      
      {/* You May Also Like Section (Lazy Loaded) */}
      <Suspense fallback={
        <div className="py-24 border-t border-zinc-100 bg-white">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="h-10 w-64 bg-zinc-200 rounded-md mb-10 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[420px] bg-zinc-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }>
        <YouMayAlsoLike currentProductId={product.id} categoryId={product.category_id} />
      </Suspense>
    </div>
  );
}
