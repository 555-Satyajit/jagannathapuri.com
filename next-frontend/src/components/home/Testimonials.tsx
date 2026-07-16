"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
          if (scrollContainer.scrollLeft >= maxScroll - 10) {
            // Reached the end, scroll back to start smoothly
            scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Scroll right by one card width roughly
            const cardWidth = window.innerWidth < 768 ? 320 : 440; // card width + gap
            scrollContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
          }
        }
      }, 3500); // Auto-scroll every 3.5 seconds
    };

    startAutoScroll();

    // Pause on hover
    const pauseScroll = () => clearInterval(scrollInterval);
    const resumeScroll = () => startAutoScroll();

    scrollContainer.addEventListener('mouseenter', pauseScroll);
    scrollContainer.addEventListener('mouseleave', resumeScroll);
    scrollContainer.addEventListener('touchstart', pauseScroll);
    scrollContainer.addEventListener('touchend', resumeScroll);

    return () => {
      clearInterval(scrollInterval);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', pauseScroll);
        scrollContainer.removeEventListener('mouseleave', resumeScroll);
        scrollContainer.removeEventListener('touchstart', pauseScroll);
        scrollContainer.removeEventListener('touchend', resumeScroll);
      }
    };
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Aarti Sharma",
      location: "Mumbai, Maharashtra",
      quote: "The authenticity of the Mahaprasad from Jagannathapuri is truly divine. It arrived perfectly packed and brought the blessings of Lord Jagannath directly to our home.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      location: "Delhi",
      quote: "I've been ordering spiritual resources and Puja items from here for months. The quality is unmatched and it truly feels like a piece of Puri is with us during our daily prayers.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      id: 3,
      name: "Priyanka Das",
      location: "Bhubaneswar, Odisha",
      quote: "A seamless experience from ordering to delivery. The craftsmanship on the idols is exquisite. Highly recommend this platform for anyone seeking authentic Odia spiritual items.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    },
    {
      id: 4,
      name: "Vikram Singh",
      location: "Bangalore, Karnataka",
      quote: "Finding pure and authentic Puja samagri online used to be difficult until I found Jagannathapuri. Their fast delivery and beautiful packaging make every festival special.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026705d",
    },
    {
      id: 5,
      name: "Sunita Mishra",
      location: "Kolkata, West Bengal",
      quote: "The intricate details on the spiritual jewelry are gorgeous. I bought a pendant last week and I haven't taken it off since. Beautiful work by the artisans of Puri.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026707d",
    },
    {
      id: 6,
      name: "Anil Patra",
      location: "Hyderabad, Telangana",
      quote: "I ordered the complete Jagannath ritual kit for my parents' anniversary. They were absolutely thrilled with the authenticity and the divine aura it brought to their Puja room.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026708d",
    }
  ];

  return (
    <section className="w-full py-24 px-6 bg-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-50/50 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-yellow-50/50 blur-[100px]" />
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Devotee Experiences
          </h2>
          <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
            Discover what our community has to say about their spiritual journey and experiences with our authentic offerings.
          </p>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-12 pt-2 snap-x snap-mandatory scrollbar-hide px-4 md:px-0" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="snap-center shrink-0 w-[300px] md:w-[420px] bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group flex flex-col h-full"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-orange-100 group-hover:text-orange-200 transition-colors" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-zinc-700 font-medium text-[15px] md:text-lg leading-relaxed mb-8 relative z-10 flex-1">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{testimonial.name}</h4>
                  <p className="text-xs text-zinc-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
