"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { LottieLoader } from "@/components/ui/lottie-loader";

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically parses the hash fragment containing the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          router.push("/login?error=auth_failed");
          return;
        }

        if (session && session.user) {
          // Send the access token to the Express backend to synchronize the local session cookie
          const response = await fetch("/api/auth/session/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: session.access_token }),
            credentials: "include", // Ensure session cookies are sent/received
          });

          const result = await response.json();

          if (result.success || response.ok) {
            // Setup Zustand user store
            const user = session.user;
            setUser({
              id: user.id,
              email: user.email || "",
              fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            });
            
            setTimeout(() => {
              if (result.isNewOrNoPassword) {
                router.push("/set-password");
              } else {
                router.push("/profile");
              }
            }, 1000);
          } else {
            console.error("Backend session verification failed", result.error);
            router.push("/login?error=sync_failed");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Callback handling error:", err);
        router.push("/login?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <LottieLoader width={350} height={350} />
        </div>
        <div className={`transition-opacity duration-700 ${showText ? 'opacity-100' : 'opacity-0'} -mt-24`}>
          <p className="text-zinc-600 text-lg font-medium text-center animate-pulse">
            Authenticating securely...
          </p>
        </div>
      </div>
    </div>
  );
}
