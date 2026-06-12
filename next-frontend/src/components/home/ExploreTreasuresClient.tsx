"use client";
import { useState } from "react";
import ProductCard from "@/components/shared/ProductCard";

export default function ExploreTreasuresClient({ tabs }: { tabs: any[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const currentTab = tabs.find(t => t.id === activeTab);
  const products = currentTab?.products || [];

  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Explore Puri Treasures
          </h2>
          <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
            Discover our exclusive collection of authentic, handcrafted spiritual items directly from the heart of Puri.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 bg-zinc-100 rounded-full overflow-x-auto max-w-full scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* Product Slider */}
        {products.length > 0 ? (
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {products.map((product: any) => (
              <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-[280px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-100">
            <p className="text-zinc-500 font-medium">No products available in this category.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
