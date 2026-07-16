import Link from "next/link";
import { MapPin, Phone, ArrowRight, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import NewsletterForm from "./NewsletterForm";

export default async function Footer() {
  let configMap: Record<string, string> = {};
  let headerConfig: any = null;
  
  try {
    const configs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['contact', 'header']
        }
      }
    });
    configs.forEach((c: any) => {
      if (c.key === 'header') {
        headerConfig = c.value;
      } else if (c.key === 'contact') {
        configMap = { ...configMap, ...c.value };
      } else {
        configMap[c.key] = c.value;
      }
    });
  } catch (e) {
    console.error("Failed to fetch footer config", e);
  }

  const phone = configMap['phone'] || "+91 98765 43210";
  const email = configMap['email'] || "support@jagannathapuri.com";
  const address = configMap['address'] || "Grand Road, Puri, Odisha 752001, India";
  const logoUrl = headerConfig?.logo || null;
  
  return (
    <footer className="w-full bg-white text-zinc-900 relative mt-auto border-t border-zinc-200">
      <div className="absolute top-0 left-0 w-[100%] h-[100%] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] right-[10%] w-[40%] h-[50%] bg-orange-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Main Footer Content */}
      <div className="container max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="flex flex-col">
            <Link href="/" className="mb-6 inline-block">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain scale-[1.3] origin-left" />
              ) : (
                <span className="text-2xl md:text-3xl font-serif font-bold text-orange-600 tracking-tight">
                  Jagannath<span className="text-zinc-900">apuri</span>
                </span>
              )}
            </Link>
            <p className="text-zinc-600 leading-relaxed mb-8">
              {configMap['brand_description'] || "Bringing the authentic spiritual heritage and sacred treasures from the divine city of Puri directly to your doorstep."}
            </p>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-zinc-600">{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-zinc-600">{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-zinc-600">{email}</span>
              </div>
            </div>
          </div>

          {/* About Column */}
          <div className="lg:pl-8">
            <h4 className="text-zinc-900 font-bold text-lg mb-6">About</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/shop" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Shop</Link></li>
              <li><Link href="/library" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Library</Link></li>
              <li><Link href="/services" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Service</Link></li>
              <li><Link href="/privacy-policy" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Terms & Conditions</Link></li>
              <li><Link href="/daily-rituals" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Daily Rituals</Link></li>
            </ul>
          </div>

          {/* My Account Column */}
          <div>
            <h4 className="text-zinc-900 font-bold text-lg mb-6">My Account</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/account" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Your Account</Link></li>
              <li><Link href="/return-policy" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Return Policies</Link></li>
              <li><Link href="/wishlist" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> Wishlist</Link></li>
              <li><Link href="/faq" className="text-zinc-600 hover:text-orange-600 transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-500" /> FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div>
            <h4 className="text-zinc-900 font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-zinc-600 text-sm mb-6">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            
            <div className="mb-8">
              <NewsletterForm />
            </div>

            <h4 className="text-zinc-900 font-bold text-lg mb-6">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a href={configMap['facebook_url'] || "#"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href={configMap['instagram_url'] || "#"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href={configMap['linkedin_url'] || "#"} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-200 bg-zinc-50">
        <div className="container max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Jagannathapuri. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Secured Payments via</span>
            <div className="font-bold tracking-wider text-zinc-700">RAZORPAY</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
