import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});



export const metadata: Metadata = {
  title: "Jay Subhdra | Sacred Treasures from Puri",
  description: "Authentic offerings and spiritual heritage from the sacred city of Puri.",
};

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
