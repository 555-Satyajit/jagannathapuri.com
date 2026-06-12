"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
}

export default function LibraryMobileFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (val: string) => {
    if (val === "all") {
      router.push("/library");
    } else {
      router.push(`/library?category=${val}`);
    }
  };

  return (
    <div className="block lg:hidden w-full mb-8">
      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full bg-white h-12 rounded-xl border-zinc-200 focus:ring-orange-500 font-medium">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-zinc-200 bg-white shadow-xl">
          <SelectItem value="all" className="font-medium cursor-pointer focus:bg-orange-50 focus:text-orange-900 rounded-lg">
            All Articles
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem 
              key={cat.id} 
              value={cat.slug}
              className="font-medium cursor-pointer focus:bg-orange-50 focus:text-orange-900 rounded-lg"
            >
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
