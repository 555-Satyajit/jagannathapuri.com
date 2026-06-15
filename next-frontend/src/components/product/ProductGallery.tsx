"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const validImages = images && images.length > 0 ? images : [null];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveImageIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
      setActiveImageIndex(index);
    },
    [emblaApi]
  );

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Desktop Main Image (Hidden on Mobile) */}
      <div className="hidden md:block relative aspect-[4/5] w-full bg-[#f4f2ee] rounded-3xl overflow-hidden shadow-inner cursor-zoom-in">
        <Image
          src={getImageUrl(validImages[activeImageIndex])}
          alt={`${productName} - Image ${activeImageIndex + 1}`}
          fill
          priority
          className="object-cover object-center transition-opacity duration-500 mix-blend-multiply"
        />
      </div>

      {/* Mobile Swipeable Slider (Hidden on Desktop) */}
      <div className="md:hidden relative w-full overflow-hidden rounded-3xl bg-[#f4f2ee]" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {validImages.map((img, idx) => (
            <div key={idx} className="relative flex-[0_0_100%] min-w-0 aspect-[4/5]">
              <Image
                src={getImageUrl(img)}
                alt={`${productName} - Image ${idx + 1}`}
                fill
                priority={idx === 0}
                className="object-cover object-center mix-blend-multiply"
              />
            </div>
          ))}
        </div>
        
        {/* Mobile Dots Pagination */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx ? "bg-orange-600 w-4" : "bg-zinc-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Thumbnails (Hidden on Mobile) */}
      {validImages.length > 1 && (
        <div className="hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`relative shrink-0 w-24 h-32 rounded-xl overflow-hidden transition-all duration-300 ${
                activeImageIndex === idx
                  ? "ring-2 ring-orange-600 ring-offset-2 opacity-100"
                  : "opacity-60 hover:opacity-100 bg-[#f4f2ee]"
              }`}
            >
              <Image
                src={getImageUrl(img)}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
