"use client";

import { useState } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import Lottie from "lottie-react";
import successAnimation from "@/../public/assets/Sucess.json";

export default function OrderSuccess({ orderId }: { orderId: string }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-y-auto">
      <div className="flex flex-col items-center justify-center py-16 px-6 max-w-2xl mx-auto text-center min-h-full">
        
        {/* Success Image */}
        <div className="relative w-64 h-64 -mt-8 mb-2 drop-shadow-sm flex items-center justify-center">
          <Lottie 
            animationData={successAnimation} 
            loop={false} 
            onComplete={() => setShowDetails(true)}
            style={{ width: '100%', height: '100%' }} 
          />
        </div>
        
        {showDetails && (
          <>
            <style>{`
              @keyframes slideUpFade {
                0% { opacity: 0; transform: translateY(40px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-slide-up {
                opacity: 0;
                animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>
            
            <div className="animate-slide-up w-full flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-serif font-black text-zinc-900 mb-4 tracking-tight">
                Order Confirmed!
              </h2>
              
              <p className="text-lg text-zinc-500 mb-10 max-w-lg mx-auto leading-relaxed">
                Thank you for choosing Jagannathapuri. We are carefully preparing your sacred items and will notify you once they ship.
              </p>

              <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-8 w-full mb-10 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
                
                <div className="text-left w-full sm:w-auto relative z-10">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4" /> Order Number
                  </p>
                  <p className="font-mono text-2xl font-black text-zinc-900 tracking-tight">{orderId}</p>
                </div>
                
                <div className="hidden sm:block w-px h-16 bg-gradient-to-b from-transparent via-zinc-200 to-transparent"></div>
                
                <div className="text-left sm:text-right w-full sm:w-auto relative z-10">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1.5">Estimated Delivery</p>
                  <p className="font-medium text-lg text-zinc-900">3 - 5 Business Days</p>
                </div>
              </div>

              <Link href="/shop" className="group">
                <Button className="h-14 px-10 bg-zinc-900 hover:bg-orange-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-orange-600/20 transition-all duration-300 transform group-hover:-translate-y-1">
                  Continue Your Journey
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
