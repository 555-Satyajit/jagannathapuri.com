import { create } from 'zustand';

interface WishlistStore {
  items: number[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/api/wishlist/items", { 
        credentials: "include",
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        set({ items: data.items.map((item: any) => item.productId) });
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: number) => {
    const { items } = get();
    const isWishlisted = items.includes(productId);

    // Optimistic UI update
    if (isWishlisted) {
      set({ items: items.filter(id => id !== productId) });
    } else {
      set({ items: [...items, productId] });
    }

    try {
      const endpoint = isWishlisted ? "/api/auth/api/wishlist/remove" : "/api/auth/api/wishlist/add";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      
      if (!data.success) {
        // Revert on failure
        get().fetchWishlist();
      }
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
      // Revert on failure
      get().fetchWishlist();
    }
  }
}));
