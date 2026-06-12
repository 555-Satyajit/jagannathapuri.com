import { Suspense } from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import ServicesList from "@/components/services/ServicesList";

export const metadata: Metadata = {
  title: "Spiritual Services & Custom Orders | Jay Subhdra",
  description: "Explore our bespoke spiritual services, custom idol carving, special rituals, and bulk temple sourcing directly from Puri.",
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
