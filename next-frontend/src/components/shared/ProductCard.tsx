"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addItem, setCartOpen } = useCartStore();
  const { items: wishlistItems, toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.includes(product.id);
  const imageArray = product.images as string[];
  const firstImage = imageArray && imageArray.length > 0 ? imageArray[0] : null;

  return (
    <div className={`group relative flex flex-col bg-transparent rounded-none overflow-visible transition-all duration-500 h-full ${className}`}>
      <Link href={`/product-details/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#f4f2ee] rounded-2xl group-hover:shadow-2xl group-hover:shadow-black/5 transition-all duration-500">
        <Image
          src={getImageUrl(firstImage)}
          alt={product.product_name}
          fill
          className="object-cover object-center transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply"
        />
        {product.on_sale && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-red-600/30">
            Sale
          </div>
        )}
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-t-3xl pointer-events-none" />
      </Link>
      
      {/* Wishlist Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isWishlisted ? 'bg-red-50 text-red-500 scale-110' : 'bg-white text-zinc-400 hover:text-red-500 hover:scale-110'}`}
      >
        <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="p-6 flex flex-col flex-1">
        <span className="text-[10px] text-orange-600/80 font-bold uppercase tracking-widest mb-2 block">
          {product.category?.name || 'Item'}
        </span>
        <Link href={`/product-details/${product.slug}`} className="font-bold text-[17px] text-zinc-900 leading-snug line-clamp-2 hover:text-orange-600 transition-colors mb-4">
          {product.product_name}
        </Link>
        <div className="mt-auto flex items-end justify-between pt-2 border-t border-zinc-50">
          <div className="flex flex-col">
            {product.on_sale ? (
              <>
                <span className="text-[13px] text-zinc-400 font-medium line-through mb-0.5">₹{product.regular_price}</span>
                <span className="text-2xl font-black text-zinc-900">₹{product.sale_price}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-zinc-900">₹{product.price_amount || product.regular_price}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              const price = product.on_sale ? product.sale_price : (product.price_amount || product.regular_price);
              addItem({
                id: product.id,
                name: product.product_name,
                price: price,
                quantity: 1,
                image: getImageUrl(firstImage)
              });
              setCartOpen(true);
            }}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-orange-600/20 group/btn"
          >
            <ShoppingBag className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
