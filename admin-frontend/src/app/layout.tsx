import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCheck, X, Search, ExternalLink, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/site-config`, {
      next: { revalidate: 60 }
    });
    
    if (res.ok) {
      const config = await res.json();
      const seo = config?.seo || {};
      const general = config?.general || {};
      
      const iconPath = general.favicon || seo.favicon || "/favicon.ico";
      const iconUrl = iconPath;
      
      return {
        title: `${seo.meta_title?.split('|')[0]?.trim() || "Jagannathapuri"} | Admin`,
        description: "Modern Admin Panel for Jagannathapuri",
        manifest: "/manifest.json",
        icons: {
          icon: iconUrl,
        }
      };
    }
  } catch (err) {
    console.error("Failed to fetch site config for metadata:", err);
  }

  return {
    title: "Jagannathapuri | Admin",
    description: "Modern Admin Panel for Jagannathapuri",
    manifest: "/manifest.json"
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-svh flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
