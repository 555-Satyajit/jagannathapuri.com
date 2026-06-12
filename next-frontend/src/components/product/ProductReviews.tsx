"use client";

import { useState } from "react";
import {
  Star,
  UserCircle2,
  ThumbsUp,
  CheckCircle2,
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  images: string[];
  created_at: Date;
  helpfulCount: number;
  verified: boolean;
  customer?: {
    first_name: string;
    last_name: string;
  };
}

interface ProductReviewsProps {
  reviews?: any[];
  averageRating?: number;
  reviewCount?: number;
}

// Enterprise Mock Data
const MOCK_TOTAL_REVIEWS = 1428;
const MOCK_AVG_RATING = 4.8;
const DISTRIBUTION = [
  { stars: 5, percentage: 82, count: 1170 },
  { stars: 4, percentage: 12, count: 171 },
  { stars: 3, percentage: 4, count: 57 },
  { stars: 2, percentage: 1, count: 14 },
  { stars: 1, percentage: 1, count: 16 },
];

const DEMO_REVIEWS: Review[] = [
  {
    id: 1,
    rating: 5,
    comment:
      "Absolutely breathtaking craftsmanship. I was hesitant to order online, but the detail on this piece is incredible. It arrived perfectly packaged and brings such a serene energy to our daily rituals. The weight feels premium and authentic.",
    images: ["product_images-1776681601280-949096394.png"],
    created_at: new Date(Date.now() - 86400000 * 2),
    helpfulCount: 124,
    verified: true,
    customer: { first_name: "Aarti", last_name: "Sharma" },
  },
  {
    id: 2,
    rating: 4,
    comment:
      "Very beautiful and exactly as pictured. The only reason I am giving 4 stars instead of 5 is because shipping took 2 days longer than expected. Otherwise, the item itself is flawless.",
    images: [],
    created_at: new Date(Date.now() - 86400000 * 15),
    helpfulCount: 32,
    verified: true,
    customer: { first_name: "Vikram", last_name: "Singh" },
  },
  {
    id: 3,
    rating: 5,
    comment:
      "Purchased this for my mother's anniversary and she was moved to tears. The quality surpasses what you find in local markets. Highly highly recommend this store!",
    images: [],
    created_at: new Date(Date.now() - 86400000 * 45),
    helpfulCount: 89,
    verified: true,
    customer: { first_name: "Priya", last_name: "Desai" },
  },
];

export default function ProductReviews({
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="pt-16 mt-16 border-t border-zinc-100">
      {/* Compact Main Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight mb-2">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(MOCK_AVG_RATING) ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                />
              ))}
            </div>
            <span className="font-bold text-zinc-900">{MOCK_AVG_RATING}</span>
            <span className="text-zinc-500 font-medium">
              ({MOCK_TOTAL_REVIEWS.toLocaleString()} Reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Main Page Layout: Grid with Analytics on Left, 3 Reviews on Right */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-10">
        {/* LEFT: Analytics Breakdown (Now on main page) */}
        <div className="w-full lg:w-[320px] flex flex-col shrink-0">
          <div className="flex items-center gap-5 mb-8">
            <span className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">
              {MOCK_AVG_RATING}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(MOCK_AVG_RATING) ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-zinc-500">
                Based on {MOCK_TOTAL_REVIEWS} reviews
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-8">
            {DISTRIBUTION.map((dist) => (
              <div
                key={dist.stars}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <span className="text-sm font-bold text-zinc-600 w-10 flex items-center gap-1 group-hover:text-zinc-900">
                  {dist.stars} <Star className="w-3 h-3 fill-current" />
                </span>
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-400 w-10 text-right group-hover:text-zinc-600">
                  {dist.percentage}%
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold h-12 shadow-lg shadow-orange-600/20 mb-8">
            Write a Review
          </Button>

          <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-orange-600" />
              <h4 className="font-bold text-zinc-900 text-sm">
                Review Insights
              </h4>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Customers frequently highlight the{" "}
              <strong className="text-zinc-900 font-semibold">
                premium craftsmanship
              </strong>{" "}
              and{" "}
              <strong className="text-zinc-900 font-semibold">
                secure packaging
              </strong>
              .
            </p>
          </div>
        </div>

        {/* RIGHT: Top 3 Reviews Grid & Drawer Trigger */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {DEMO_REVIEWS.slice(0, 4).map((review) => (
              <Card
                key={review.id}
                className="border-zinc-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl h-full flex flex-col"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {review.customer?.first_name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                        {review.customer?.first_name}{" "}
                        {review.customer?.last_name}
                        {review.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-4 flex-1">
                    {review.comment}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {review.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0"
                        >
                          <Image
                            src={getImageUrl(img)}
                            alt="Review image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trigger Drawer */}
          <div className="flex justify-center lg:justify-start">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full md:w-auto h-14 px-10 rounded-full font-bold border-zinc-300 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm flex items-center gap-2 group"
                  />
                }
              >
                Read All {MOCK_TOTAL_REVIEWS.toLocaleString()} Reviews
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </SheetTrigger>

              {/* THE IMMERSIVE DRAWER (Now only contains the list and filters) */}
              <SheetContent
                side="right"
                className="!max-w-[100vw] sm:!max-w-[90vw] lg:!max-w-[800px] w-full p-0 bg-white overflow-y-auto border-l-0 sm:border-l"
              >
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-100 p-6 flex items-center justify-between">
                  <SheetTitle className="text-2xl font-serif font-bold text-zinc-900">
                    All Customer Reviews
                  </SheetTitle>
                </div>

                <div className="p-6 md:p-8 flex flex-col min-w-0">
                  {/* Filters */}
                  <div className="flex flex-col gap-4 mb-8 bg-white pb-2 border-b border-zinc-50">
                    <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search reviews (e.g., 'quality', 'packaging')..."
                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {["All", "With Photos", "5 Stars", "Critical"].map(
                        (filter) => (
                          <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                              activeFilter === filter
                                ? "bg-zinc-900 text-white shadow-md"
                                : "bg-white text-zinc-600 hover:bg-zinc-200 border border-zinc-200"
                            }`}
                          >
                            {filter}
                          </button>
                        ),
                      )}
                      <button className="shrink-0 ml-auto flex items-center justify-between gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                        <SlidersHorizontal className="w-4 h-4" /> Sort
                      </button>
                    </div>
                  </div>

                  {/* Review Cards (Mocking 10 here for the Drawer) */}
                  <div className="flex flex-col">
                    {DEMO_REVIEWS.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-zinc-100 py-6 last:border-0"
                      >
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                              {review.customer?.first_name[0]}
                            </div>
                            <div>
                              <div className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                {review.customer?.first_name}{" "}
                                {review.customer?.last_name}
                                {review.verified && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />{" "}
                                    Verified
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400 font-medium mt-0.5 block">
                                {new Date(review.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          {review.comment && (
                            <p className="text-zinc-700 text-[15px] leading-relaxed mb-5 font-medium">
                              {review.comment}
                            </p>
                          )}
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-2">
                              {review.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-28 h-28 rounded-xl overflow-hidden border border-zinc-200 shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity shadow-sm"
                                >
                                  <Image
                                    src={getImageUrl(img)}
                                    alt="Review image"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-6 mt-2">
                            <button className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-600 transition-colors group">
                              <ThumbsUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                              Helpful ({review.helpfulCount})
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-8 pb-12 flex justify-center">
                      <Button
                        variant="outline"
                        className="h-12 px-8 rounded-full font-bold border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-all shadow-sm"
                      >
                        Load More Reviews
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Sparkles icon for the AI insights
function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
