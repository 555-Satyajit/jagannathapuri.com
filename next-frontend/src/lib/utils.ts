import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (img?: string | null) => {
  if (!img) return "https://placehold.co/600x600?text=Jagannathapuri";
  if (img.startsWith('http')) return img;
  if (img.startsWith('image-') || img.startsWith('mobileImage-') || img.startsWith('product_images-')) return `/uploads/${img}`;
  if (img.startsWith('review-')) return `/uploads/reviews/${img}`;
  return `/admin-assets/img/ecommerce-images/${img}`;
};
