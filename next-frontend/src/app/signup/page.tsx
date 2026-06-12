import { SignupForm } from "@/components/signup-form"
import prisma from "@/lib/prisma"
import { Suspense } from "react"

export default async function SignupPage() {
  let siteConfig = null;
  try {
    siteConfig = await prisma.siteConfig.findUnique({
      where: { key: "header" },
    });
  } catch (error) {
    console.error("Failed to load header config", error);
  }
  
  const config = siteConfig?.value ? (typeof siteConfig.value === 'string' ? JSON.parse(siteConfig.value) : siteConfig.value) : {};
  const logoUrl = config.logo || null;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 md:h-12 w-auto object-contain origin-left" />
            ) : (
              <span className="text-xl md:text-2xl font-serif font-bold text-orange-600 tracking-tight">
                Jay <span className="text-orange-900">Subhdra</span>
              </span>
            )}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div>Loading form...</div>}>
              <SignupForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/assets/images/404/confirm-order.png"
          alt="Sacred artifacts"
          className="absolute inset-0 h-full w-full object-cover bg-orange-50/30"
        />
      </div>
    </div>
  )
}
