"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface AddToCartClientProps {
  productId: number;
  productName: string;
  price: number;
  maxQuantity: number;
  image?: string;
}

export default function AddToCartClient({ productId, productName, price, maxQuantity, image }: AddToCartClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, setCartOpen } = useCartStore();

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(maxQuantity, prev + 1));

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate slight delay for UI feedback
    setTimeout(() => {
      addItem({
        id: productId,
        name: productName,
        price,
        quantity,
        image
      });
      setIsAdding(false);
      setCartOpen(true);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6 pt-8 border-t border-zinc-100">
      
      {/* Quantity Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Quantity</label>
        <div className="flex items-center w-36 h-12 bg-white border border-zinc-200 rounded-full overflow-hidden">
          <button 
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="flex-1 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors h-full"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center justify-center font-bold text-zinc-900 border-x border-zinc-100 h-full">
            {quantity}
          </div>
          <button 
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity}
            className="flex-1 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors h-full"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {/* Add To Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={isAdding || maxQuantity === 0}
          className="relative overflow-hidden w-full h-14 bg-white border border-zinc-900 text-zinc-900 hover:bg-zinc-50 rounded-full font-bold text-lg transition-all duration-300 disabled:border-zinc-300 disabled:text-zinc-400 flex items-center justify-center gap-3 group"
        >
          <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {isAdding ? "Adding..." : maxQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        {/* Buy Now Button */}
        <button 
          disabled={isAdding || maxQuantity === 0}
          className="relative overflow-hidden w-full h-14 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 rounded-full font-bold text-lg transition-all duration-300 disabled:bg-zinc-300 disabled:shadow-none flex items-center justify-center gap-3"
        >
          {maxQuantity === 0 ? "Out of Stock" : "Buy Now"}
        </button>
      </div>

    </div>
  );
}
