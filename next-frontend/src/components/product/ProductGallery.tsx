"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // If no images exist, show a placeholder
  const validImages = images && images.length > 0 ? images : [null];

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Main Large Image */}
      <div className="relative aspect-[4/5] w-full bg-[#f4f2ee] rounded-3xl overflow-hidden shadow-inner cursor-zoom-in">
        <Image
          src={getImageUrl(validImages[activeImageIndex])}
          alt={`${productName} - Image ${activeImageIndex + 1}`}
          fill
          priority
          className="object-cover object-center transition-opacity duration-500 mix-blend-multiply"
        />
      </div>

      {/* Thumbnails (only show if multiple images) */}
      {validImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
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
