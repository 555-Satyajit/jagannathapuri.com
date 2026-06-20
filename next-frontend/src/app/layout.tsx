import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});



export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/site-config`, {
      next: { revalidate: 60 } // Refresh cache every 60 seconds
    });
    
    if (res.ok) {
      const config = await res.json();
      const seo = config?.seo || {};
      const general = config?.general || {};
      
      const iconPath = general.favicon || seo.favicon || "/favicon.ico";
      const iconUrl = iconPath;
      
      return {
        title: seo.meta_title || "Jagannathapuri | Sacred Treasures from Puri",
        description: seo.meta_description || "Authentic offerings and spiritual heritage from the sacred city of Puri.",
        keywords: seo.meta_keywords || "Puri, Jagannath, Mahaprasad",
        icons: {
          icon: iconUrl,
        }
      };
    }
  } catch (err) {
    console.error("Failed to fetch site config for metadata:", err);
  }

  // Fallback metadata if backend fails
  return {
    title: "Jagannathapuri | Sacred Treasures from Puri",
    description: "Authentic offerings and spiritual heritage from the sacred city of Puri.",
  };
}

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col font-sans text-zinc-900 bg-zinc-50 overflow-x-hidden">
        <NextTopLoader color="#ea580c" showSpinner={false} shadow="0 0 10px #ea580c,0 0 5px #ea580c" />
        {children}
      </body>
    </html>
  );
}
