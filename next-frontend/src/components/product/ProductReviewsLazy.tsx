import prisma from "@/lib/prisma";
import ProductReviews from "./ProductReviews";

interface ProductReviewsLazyProps {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export default async function ProductReviewsLazy({ productId, averageRating, reviewCount }: ProductReviewsLazyProps) {
  // Lazily fetch reviews independent of the main product page load
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      reviews: {
        include: { customer: true },
        orderBy: { created_at: 'desc' }
      }
    }
  });

  return (
    <ProductReviews 
      reviews={(product?.reviews || []) as any[]} 
      averageRating={averageRating} 
      reviewCount={reviewCount} 
      productId={productId}
    />
  );
}
