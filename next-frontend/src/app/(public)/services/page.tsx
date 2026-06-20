import { Suspense } from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import ServicesList from "@/components/services/ServicesList";

export const metadata: Metadata = {
  title: "Authentic Puja Services & Offerings in Puri | Jagannathapuri",
  description: "Book authentic Hindu puja services, special offerings, and personalized rituals conducted by expert pandits near the sacred Jagannath Temple in Puri.",
  keywords: "book puja Puri, Jagannath temple offerings, online puja services, spiritual rituals Odisha, pandit booking Puri",
};

export const revalidate = 3600; // Revalidate every hour

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: {
      status: "Active"
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <ServicesList services={services as any} />
    </div>
  );
}
