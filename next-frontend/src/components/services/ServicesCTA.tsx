import { PhoneCall } from "lucide-react";

export default function ServicesCTA() {
  return (
    <section className="py-20 lg:py-32 bg-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)]" />
      </div>
      
      <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
          Have a Custom Request?
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Whether you need a specific dimension for an idol, a special ritual arrangement, or bulk orders for a temple, we are here to help. Reach out to discuss your spiritual needs.
        </p>
        
        <a 
          href="tel:+918895822941" 
          className="inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-900/50"
        >
          <PhoneCall className="w-5 h-5" />
          Call Us Now
        </a>
        <p className="text-zinc-500 mt-6 text-sm">
          Available Mon-Sat, 9:00 AM to 6:00 PM IST
        </p>
      </div>
    </section>
  );
}
