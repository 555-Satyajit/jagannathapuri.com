import prisma from "@/lib/prisma";
import HeroCarouselClient from "./HeroCarouselClient";

export default async function Hero() {
  let heroes: string | any[] = [];
  try {
    heroes = await prisma.heroSection.findMany({ 
      where: { status: 'Active' }, 
      orderBy: { order: 'asc' } 
    });
  } catch (e) {
    console.error("Prisma not ready yet or no data", e);
  }

  // Fallback hero if none are in the database
  if (heroes.length === 0) {
    heroes = [{
      id: "default",
      title: "Experience Divine Grace",
      header: "Blessings from the Holy Dham",
      description: "Authentic offerings and spiritual heritage from the sacred city of Puri.",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=2000"
    }];
  }

  return <HeroCarouselClient heroes={heroes} />;
}
