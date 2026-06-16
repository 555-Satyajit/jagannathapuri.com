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
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  images: string[];
  created_at: Date;
  helpfulCount: number;
  verified: boolean;
  customer?: {
    fullName?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface ProductReviewsProps {
  reviews?: any[];
  averageRating?: number;
  reviewCount?: number;
  productId?: number;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating"),
  comment: z.string().min(5, "Review must be at least 5 characters long"),
  images: z.any().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ProductReviews({
  reviews = [],
  averageRating = 0,
  reviewCount = 0,
  productId,
}: ProductReviewsProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const totalReviews = reviews.length > 0 ? reviews.length : reviewCount;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : averageRating.toFixed(1);

  // Calculate distribution
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (!productId) {
      setSubmitError("Product ID is missing. Please refresh the page.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const formData = new FormData();
      formData.append("productId", productId.toString());
      formData.append("rating", data.rating.toString());
      formData.append("comment", data.comment);
      
      selectedFiles.forEach(file => {
        formData.append("images", file);
      });

      const res = await fetch('/api/auth/api/submit-review', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
        form.reset();
        setSelectedFiles([]);
        router.refresh();
        setTimeout(() => {
          setDialogOpen(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        setSubmitError(result.error || "Please login to submit a review");
      }
    } catch (err) {
      setSubmitError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                />
              ))}
            </div>
            <span className="font-bold text-zinc-900">{avgRating}</span>
            <span className="text-zinc-500 font-medium">
              ({totalReviews.toLocaleString()} Reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Main Page Layout: Grid with Analytics on Left, 3 Reviews on Right */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-10">
        {/* LEFT: Analytics Breakdown */}
        <div className="w-full lg:w-[320px] flex flex-col shrink-0">
          <div className="flex items-center gap-5 mb-8">
            <span className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">
              {avgRating}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? "fill-current" : "fill-transparent stroke-zinc-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-zinc-500">
                Based on {totalReviews} reviews
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-8">
            {distribution.map((dist) => (
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold h-12 shadow-lg shadow-orange-600/20 mb-8">
                Write a Review
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-serif">Write a Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-zinc-700">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => form.setValue("rating", star)}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${star <= form.watch("rating") ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300"}`} />
                      </button>
                    ))}
                  </div>
                  {form.formState.errors.rating && <span className="text-red-500 text-xs">{form.formState.errors.rating.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-zinc-700">Your Review</label>
                  <textarea 
                    {...form.register("comment")}
                    rows={4}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600"
                    placeholder="Share your experience with this product..."
                  />
                  {form.formState.errors.comment && <span className="text-red-500 text-xs">{form.formState.errors.comment.message}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-zinc-700">Upload Images (Max 3)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 3);
                      setSelectedFiles(files);
                    }}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm"
                  />
                  {selectedFiles.length > 0 && (
                    <span className="text-xs text-zinc-500">{selectedFiles.length} image(s) selected</span>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || submitSuccess}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold h-12 mt-2 transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : submitSuccess ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Success</span>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                    {submitError}
                  </div>
                )}
              </form>
            </DialogContent>
          </Dialog>

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
          {reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-3xl border border-zinc-100 p-8 text-center min-h-[300px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Star className="w-8 h-8 text-zinc-300 fill-zinc-100" />
              </div>
              <h3 className="text-xl font-bold font-serif text-zinc-900 mb-2">No Reviews Yet</h3>
              <p className="text-zinc-500 text-sm max-w-sm">Be the first to share your experience with this product and help others make informed decisions.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {reviews.slice(0, 4).map((review) => (
                  <Card
                    key={review.id}
                    className="border-zinc-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl h-full flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold uppercase">
                          {review.customer?.fullName?.[0] || review.customer?.first_name?.[0] || 'A'}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                            {review.customer?.fullName || review.customer?.first_name || 'Anonymous'}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
                          {review.images.map((img: string, idx: number) => (
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
              {reviews.length > 4 && (
                <div className="flex justify-center lg:justify-start">
                  <Sheet>
                    <SheetTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full md:w-auto h-14 px-10 rounded-full font-bold border-zinc-300 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm flex items-center gap-2 group"
                        >
                          Read All {totalReviews.toLocaleString()} Reviews
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      }
                    />

                    {/* THE IMMERSIVE DRAWER */}
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
                        {/* Review Cards */}
                        <div className="flex flex-col">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="border-b border-zinc-100 py-6 last:border-0"
                            >
                              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg uppercase">
                                    {review.customer?.fullName?.[0] || review.customer?.first_name?.[0] || 'A'}
                                  </div>
                                  <div>
                                    <div className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                      {review.customer?.fullName || review.customer?.first_name || 'Anonymous'}
                                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" />{" "}
                                        Verified
                                      </span>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-medium mt-0.5 block">
                                      {new Date(review.created_at).toLocaleDateString(
                                        "en-IN",
                                        { year: "numeric", month: "long", day: "numeric" }
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
                                    {review.images.map((img: string, idx: number) => (
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </>
          )}
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
