"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by rendering only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-zinc-200">
        <SheetHeader className="px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <SheetTitle className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-4">
              <ShoppingBag className="w-16 h-16 text-zinc-200" />
              <p className="font-medium text-lg text-zinc-900">Your cart is empty</p>
              <p className="text-sm max-w-[250px]">Explore our sacred collection to find something you'll love.</p>
              <Button onClick={() => setCartOpen(false)} variant="outline" className="mt-4 rounded-full font-bold">
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-zinc-100 pb-6 last:border-0 last:pb-0">
                {/* Image */}
                <div className="w-24 h-24 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-zinc-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-zinc-900 text-sm leading-tight line-clamp-2">{item.name}</h4>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="font-extrabold text-zinc-900 mt-1">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center mt-3 h-8 w-24 bg-white border border-zinc-200 rounded-full overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex-1 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition-colors h-full"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 flex items-center justify-center font-bold text-zinc-900 border-x border-zinc-100 h-full text-xs">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex-1 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors h-full"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex-shrink-0">
            <div className="flex justify-between items-end mb-6">
              <span className="text-zinc-500 font-medium">Subtotal</span>
              <span className="text-2xl font-extrabold text-zinc-900">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            
            <p className="text-xs text-zinc-500 mb-6 text-center">Shipping & taxes calculated at checkout.</p>
            
            {isAuthenticated ? (
              <Link href="/checkout" onClick={() => setCartOpen(false)} className="block w-full">
                <Button className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-600/20">
                  Proceed to Checkout
                </Button>
              </Link>
            ) : (
              <Link href="/login?callbackUrl=/checkout" onClick={() => setCartOpen(false)} className="block w-full">
                <Button className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-600/20">
                  Login to Checkout
                </Button>
              </Link>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
