import CheckoutClient from "@/components/checkout/CheckoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Jay Subhdra",
  description: "Complete your order with Jay Subhdra",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-20">
      <div className="container max-w-7xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-zinc-900 tracking-tight mb-8">
          Checkout
        </h1>
        <CheckoutClient />
      </div>
    </div>
  );
}
