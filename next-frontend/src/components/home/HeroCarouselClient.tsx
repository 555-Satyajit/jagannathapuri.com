"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarouselClient({ heroes }: { heroes: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroes.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(interval);
  }, [heroes.length]);

  if (heroes.length === 0) return null;

  const activeHero = heroes[currentIndex];

  const getImageUrl = (img?: string | null) => {
    if (!img) return "https://placehold.co/1920x800?text=Jay+Subhdra";
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return `/uploads/${img}`;
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroes.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + heroes.length) % heroes.length);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden group">
      
      {/* Background Images */}
      {heroes.map((hero, index) => (
        <div 
          key={hero.id || index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
        >
          {/* Mobile Image (shown on small screens) */}
          <div className="block md:hidden absolute inset-0">
            <Image
              src={getImageUrl(hero.mobileImage || hero.image)}
              alt="Hero Background Mobile"
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
          
          {/* Desktop Image (shown on medium and larger screens) */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src={getImageUrl(hero.image)}
              alt="Hero Background Desktop"
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        </div>
      ))}

      {/* Content */}
      <div className="container relative z-20 w-full max-w-7xl h-full mx-auto">
        {heroes.map((hero, index) => (
          <div 
            key={hero.id || index}
            className={`absolute top-1/2 left-6 lg:left-12 max-w-2xl space-y-6 transition-all duration-700 ${
              index === currentIndex 
                ? "opacity-100 translate-y-[-50%] pointer-events-auto" 
                : "opacity-0 translate-y-[-40%] pointer-events-none"
            }`}
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-yellow-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hero.header}</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-xl">
              {hero.title}
            </h1>
            
            {/* Description */}
            <div className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed font-normal drop-shadow-lg">
              <span dangerouslySetInnerHTML={{ __html: hero.description }} />
            </div>

            {/* Button */}
            <div className="pt-4">
              <Link 
                href={hero.buttonLink || '/shop'}
                className="group/btn relative inline-flex items-center justify-between pl-8 pr-2 py-2 bg-[#ff5e14] text-white rounded-full font-semibold text-lg transition-transform hover:scale-105 shadow-xl"
                style={{ minWidth: "180px" }}
              >
                <span className="pr-4">{hero.buttonText || 'Shop Now'}</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/15 transition-colors group-hover/btn:bg-black/25">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Controls (Only show if multiple heroes) */}
      {heroes.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 hover:scale-110 shadow-2xl"
          >
            <ChevronLeft className="w-7 h-7 ml-[-2px]" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 hover:scale-110 shadow-2xl"
          >
            <ChevronRight className="w-7 h-7 mr-[-2px]" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
            {heroes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentIndex ? "w-8 h-2 bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.8)]" : "w-2 h-2 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
