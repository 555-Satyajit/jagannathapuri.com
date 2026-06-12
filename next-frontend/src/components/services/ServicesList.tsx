import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { Star, PhoneCall } from "lucide-react";

interface ServiceProps {
  id: number;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  rating: number;
  reviewsCount: number;
}

export default function ServicesList({ services }: { services: ServiceProps[] }) {
  if (!services || services.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <p>No services are currently available. Please check back later.</p>
      </div>
    );
  }

  return (
    <section className="bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 font-bold mb-8 text-center">Our Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="flex flex-col group rounded-2xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
            >
              {service.image ? (
                <div className="relative w-full h-48 overflow-hidden bg-zinc-50">
                  <Image
                    src={getImageUrl(service.image)}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-orange-50 flex items-center justify-center">
                  <span className="text-orange-200 text-5xl">
                    <i className={service.icon || "fas fa-om"} />
                  </span>
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                {service.subtitle && (
                  <p className="text-orange-600 font-semibold text-xs uppercase tracking-wider mb-2">
                    {service.subtitle}
                  </p>
                )}
                
                <h3 className="text-lg font-serif font-bold text-zinc-900 mb-2">
                  {service.title}
                </h3>
                
                {service.description && (
                  <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-4">
                  <a 
                    href="tel:+918895822941" 
                    className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold py-2.5 rounded-full transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Enquire Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
