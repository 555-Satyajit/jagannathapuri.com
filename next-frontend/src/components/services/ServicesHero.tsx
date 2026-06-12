import Image from "next/image";

export default function ServicesHero() {
  return (
    <section className="relative bg-[#fcfaf8] overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-zinc-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-100/50 blur-3xl opacity-50" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-50/50 blur-3xl opacity-50" />
      </div>

      <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-orange-50 border border-orange-100">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-semibold text-orange-700 tracking-wider uppercase">Bespoke Offerings</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-zinc-900 mb-6 tracking-tight leading-tight">
          Spiritual Services & <br /> Custom Creations
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Beyond our curated collection, we offer bespoke idol carving, personalized rituals, and bulk sourcing directly from the holy city of Puri.
        </p>
      </div>
    </section>
  );
}
