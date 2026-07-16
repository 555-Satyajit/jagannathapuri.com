"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Search, User, Heart, ShoppingCart, Menu, Phone, X, ChevronDown, Globe } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import CartDrawer from "@/components/cart/CartDrawer";

const indianLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'or', label: 'Odia' },
  { code: 'bn', label: 'Bengali' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
];

export default function HeaderClient({ siteConfig }: { siteConfig: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [mounted, setMounted] = useState(false);
  
  // Cart & Auth state
  const { items, setCartOpen } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  
  // Search state
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    // get current language from googtrans cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match) {
      setCurrentLang(match[1]);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
    } else {
      const cookieValue = '/en/' + langCode;
      document.cookie = "googtrans=" + cookieValue + "; path=/";
      document.cookie = "googtrans=" + cookieValue + "; path=/; domain=" + location.hostname;
    }
    location.reload();
  };

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const config = siteConfig?.value || {};
  const logoUrl = config.logo || null;

  const topBarLinks = config.top_bar_links || [];
  const navLinks = config.navbar_links || [];

  return (
    <header className="w-full z-50 flex flex-col fixed top-0 left-0 transition-all duration-300">
      {/* Top Promotional Bar - hides on scroll */}
      {config.promo_status !== false && (
        <div 
          className={`bg-orange-50 border-b border-orange-100 text-orange-900 text-[13px] font-medium px-4 flex justify-between items-center transition-all duration-500 ${
            isScrolled ? "h-0 min-h-0 py-0 opacity-0 border-transparent overflow-hidden" : "h-10 min-h-[40px] py-2 opacity-100 overflow-visible z-50 relative"
          }`}
        >
          <div className="container mx-auto max-w-7xl flex justify-between items-center px-4">
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-1.5 hover:text-orange-600 cursor-pointer transition-colors">
                <Phone className="w-3.5 h-3.5" /> Support: {config.support_phone || '888-777-999'}
              </span>
            </div>
            
            <div className="flex-1 text-center flex items-center justify-center gap-2">
              <span className="opacity-90">{config.promo_text || "Special Offering for Ratha Yatra"}</span>
              <span className="bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                {config.promo_tag || "25% OFF"}
              </span>
              <span className="opacity-90">{config.promo_suffix || "Today"}</span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[13px] opacity-90">
              {topBarLinks.map((link: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <Link href={link.url} className="hover:text-orange-600 transition-colors">
                    {link.label}
                  </Link>
                  {index < topBarLinks.length - 1 && <span className="text-orange-200">|</span>}
                </div>
              ))}
              {/* Google Translate Integration (Hidden) */}
              <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}></div>
              
              {/* Custom Language Selector */}
              <div className="relative group/lang flex items-center">
                <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                  <Globe className="w-3.5 h-3.5 opacity-70 mr-0.5" />
                  <span className="uppercase">{indianLanguages.find(l => l.code === currentLang)?.label || 'English'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all duration-300 z-50">
                  <div className="w-36 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden py-1">
                    {indianLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-orange-50 ${currentLang === lang.code ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-zinc-600 hover:text-orange-600'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Area */}
      <div 
        className={`w-full transition-all duration-300 border-b border-zinc-200/50 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-sm py-2" 
            : "bg-white py-3 md:py-4"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between h-full">
          
          {/* Logo (Left Side) */}
          <div className="flex justify-start z-10">
            <Link href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 scale-[1.3] md:scale-[1.6] origin-left" />
              ) : (
                <span className="text-2xl md:text-3xl font-serif font-bold text-orange-600 tracking-tight">
                  Jagannath<span className="text-orange-900">apuri</span>
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden xl:flex items-center justify-center gap-5 xl:gap-7 px-4">
            {navLinks.map((link: any) => (
              <div key={link.label} className="relative group">
                <Link 
                  href={link.url || '#'}
                  className="flex items-center gap-1 text-zinc-700 font-medium hover:text-orange-600 transition-colors text-[14px] xl:text-[15px] whitespace-nowrap"
                >
                  {link.label}
                  {link.sub_links && link.sub_links.length > 0 && (
                    <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>

                {link.sub_links && link.sub_links.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden py-2">
                      {link.sub_links.map((sub: any) => (
                        <Link 
                          key={sub.label} 
                          href={sub.url}
                          className="block px-5 py-2.5 text-sm text-zinc-600 hover:text-orange-600 hover:bg-orange-50/50 transition-colors text-center"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Icons (Right Side) */}
          <div className="flex items-center justify-end gap-3 sm:gap-5 z-10">
            {/* Search Input (Hidden on smaller screens, expands on large desktop) */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 lg:w-40 xl:w-56 pl-10 pr-4 py-2 bg-zinc-100/70 border-transparent focus:bg-white border focus:border-orange-300 rounded-full text-sm outline-none transition-all focus:ring-4 focus:ring-orange-500/10"
              />
              <button type="submit" className="absolute left-4">
                <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-600 transition-colors" />
              </button>
            </form>

            {/* Mobile Search Icon & Expanding Input */}
            <div className="lg:hidden relative">
               <button 
                 onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                 className="text-zinc-600 hover:text-orange-600 transition-colors flex items-center"
               >
                 <Search className="w-[22px] h-[22px]" />
               </button>
               {isMobileSearchOpen && (
                 <form 
                   onSubmit={handleSearch}
                   className="absolute top-full right-0 mt-4 w-64 bg-white p-2 rounded-2xl shadow-xl border border-zinc-100 flex items-center"
                 >
                   <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm outline-none focus:border-orange-300"
                      autoFocus
                   />
                   <button type="submit" className="absolute right-4 p-1 text-orange-600">
                     <Search className="w-4 h-4" />
                   </button>
                 </form>
               )}
            </div>

            {/* User Account */}
            {isAuthenticated && user ? (
              <Link href="/profile" className="text-zinc-600 hover:text-orange-600 transition-colors flex items-center justify-center w-[26px] h-[26px] rounded-full bg-orange-100 text-orange-600 font-bold text-xs">
                {user.fullName.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link href="/login" className="text-zinc-600 hover:text-orange-600 transition-colors">
                <User className="w-[22px] h-[22px]" />
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/profile" className="hidden sm:block text-zinc-600 hover:text-orange-600 transition-colors relative">
              <Heart className="w-[22px] h-[22px]" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="text-zinc-600 hover:text-orange-600 transition-colors flex items-center gap-2 group">
              <div className="relative">
                <ShoppingCart className="w-[22px] h-[22px]" />
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ring-2 ring-white">
                  {mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
                </span>
              </div>
              <span className="hidden xl:block font-bold text-sm text-zinc-800 ml-1">
                ₹{mounted ? items.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString("en-IN") : "0"}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="xl:hidden text-zinc-800 p-1 focus:outline-none ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <CartDrawer />

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 shadow-xl absolute top-full left-0 w-full z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col p-4">
            {navLinks.map((link: any) => (
              <div key={link.label} className="border-b border-zinc-100 last:border-0">
                {link.sub_links && link.sub_links.length > 0 ? (
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between py-4 text-zinc-800 font-medium hover:text-orange-600 transition-colors cursor-pointer list-none">
                      {link.label}
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="flex flex-col gap-1 pl-4 pb-4">
                      {link.sub_links.map((sub: any) => (
                        <Link 
                          key={sub.label} 
                          href={sub.url}
                          className="py-2.5 block text-sm text-zinc-600 hover:text-orange-600 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link 
                    href={link.url || '#'}
                    className="py-4 block text-zinc-800 font-medium hover:text-orange-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="py-6 flex flex-col gap-5 bg-orange-50/50 -mx-4 px-8 mt-4">
              <div className="flex flex-col gap-3 text-zinc-700">
                <div 
                  className="flex items-center justify-between font-medium cursor-pointer"
                  onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                >
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5" />
                    <span>Language</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 font-bold">
                    <span className="uppercase">{indianLanguages.find(l => l.code === currentLang)?.label || 'English'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMobileLangOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {/* Expandable Language List */}
                {isMobileLangOpen && (
                  <div className="pl-9 pr-2 py-2 grid grid-cols-2 gap-2">
                    {indianLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentLang === lang.code 
                            ? 'bg-orange-100 text-orange-700 font-bold' 
                            : 'bg-white/50 text-zinc-600 hover:bg-orange-100 hover:text-orange-600'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-zinc-700">
                <Phone className="w-5 h-5" />
                <span className="font-medium">Call Us: {config.support_phone || '888-777-999'}</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-700">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Saved Items (Wishlist)</span>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Google Translate Scripts */}
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            if (window.google && window.google.translate) {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en', 
                includedLanguages: 'en,hi,or,bn,mr,ta,te,kn,ml',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          }
        `}
      </Script>
      <Script 
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
        strategy="afterInteractive" 
      />
    </header>
  );
}
