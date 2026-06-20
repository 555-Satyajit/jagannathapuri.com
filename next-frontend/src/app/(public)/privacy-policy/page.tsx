import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Jagannathapuri",
  description: "Read the Privacy Policy for Jagannathapuri. We ensure secure, transparent, and authentic delivery of spiritual items and Mahaprasad directly from Puri.",
};

export default async function PrivacyPolicyPage() {
  let content = "<p>The Privacy Policy is currently not available. Please check back later.</p>";

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "privacy_policy" },
    });

    if (config && config.value && typeof config.value === 'object' && 'content' in config.value) {
      content = (config.value as any).content;
    }
  } catch (error) {
    console.error("Failed to fetch privacy policy:", error);
  }

  return (
    <div className="py-12 md:py-20 bg-zinc-50 min-h-screen">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 mb-4">
            Privacy Policy
          </h1>
          <div className="h-1 w-20 bg-orange-600 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-zinc-100">
          <div 
            className="prose prose-zinc max-w-none prose-headings:font-serif prose-a:text-orange-600 hover:prose-a:text-orange-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
