"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ShopSidebarProps {
  categories: Category[];
  totalProducts: number;
}

export default function ShopSidebar({ categories, totalProducts }: ShopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract current filters from URL
  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "latest";

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Always reset to page 1 when changing filters
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => k !== "page" && k !== "search");

  return (
    <div className="sticky top-[72px] z-40 bg-[#fcfaf8]/90 backdrop-blur-md border-b border-zinc-200/60 py-4 mb-8">
      <div className="flex flex-row md:items-center justify-between gap-3 md:gap-4">
        
        {/* Mobile: Category Dropdown */}
        <div className="relative flex-1 md:hidden flex items-center">
          <Select value={currentCategory} onValueChange={(value) => updateFilters("category", value)}>
            <SelectTrigger className="w-full bg-white border border-zinc-200 rounded-full px-4 py-2 hover:border-zinc-400 focus:ring-0 focus:ring-offset-0 focus:border-zinc-900 transition-colors text-xs sm:text-sm font-semibold text-zinc-700 h-10 shadow-sm">
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Collections</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name} {cat._count?.products !== undefined ? `(${cat._count.products})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Horizontal Category Pills */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => updateFilters("category", "all")}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              currentCategory === "all"
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
            }`}
          >
            All Collections
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters("category", cat.slug)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                currentCategory === cat.slug
                  ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              {cat.name}
              {cat._count?.products !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${currentCategory === cat.slug ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown & Filter Info */}
        <div className="flex-1 md:flex-none flex items-center shrink-0">
          <Select value={currentSort} onValueChange={(value) => updateFilters("sort", value)}>
            <SelectTrigger className="w-full md:w-[180px] bg-white border border-zinc-200 rounded-full px-4 py-2 hover:border-zinc-400 focus:ring-0 focus:ring-offset-0 focus:border-zinc-900 transition-colors text-xs sm:text-sm font-semibold text-zinc-700 h-10 shadow-sm">
              <div className="flex items-center gap-2 text-left truncate">
                <SlidersHorizontal className="hidden sm:block w-4 h-4 text-zinc-400 shrink-0" />
                <SelectValue placeholder="Latest Arrivals" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Arrivals</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}
