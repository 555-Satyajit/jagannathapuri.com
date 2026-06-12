"use client";

import { Heart, Search, Loader2 } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function WishlistTab() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/auth/api/wishlist/items", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    // Optimistically remove from UI
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));

    try {
      const res = await fetch("/api/auth/api/wishlist/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        fetchWishlist();
      }
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
      fetchWishlist();
    }
  };

  const filteredItems = wishlistItems.filter(item => 
    item.product?.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            My Wishlist <span className="bg-orange-100 text-orange-600 text-sm py-0.5 px-2 rounded-full">{wishlistItems.length}</span>
          </h1>
          <p className="text-zinc-500 mt-1">Products you've saved for later.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-[4/3] bg-zinc-200 relative"></div>
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-zinc-200 rounded-full"></div>
                <div className="h-5 w-3/4 bg-zinc-200 rounded-full"></div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-5 w-16 bg-zinc-200 rounded-full"></div>
                  <div className="h-4 w-12 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="relative group/wishlist">
              <ProductCard product={item.product} />
              <button 
                onClick={() => removeFromWishlist(item.productId)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500 hover:scale-110 transition-transform"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-orange-200" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            {searchQuery ? "No matching products" : "Your wishlist is empty"}
          </h2>
          <p className="text-zinc-500 max-w-sm mb-8">
            {searchQuery 
              ? "Try adjusting your search term."
              : "Save items you love to your wishlist. Review them anytime and easily move them to your cart."}
          </p>
          {!searchQuery && (
            <Link href="/shop">
              <Button className="bg-zinc-900 hover:bg-orange-600 text-white rounded-xl px-8 h-12 font-bold transition-colors">
                Explore Products
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
