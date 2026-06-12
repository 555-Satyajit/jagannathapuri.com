"use client";

import dynamic from "next/dynamic";
import animationData from "@/../public/assets/delivery-truck-loader.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieLoaderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function LottieLoader({ className, width = 120, height = 120 }: LottieLoaderProps) {
  return (
    <div className={className} style={{ width, height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Lottie animationData={animationData} loop={true} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
