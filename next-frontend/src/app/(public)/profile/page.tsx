"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDashboard from "@/components/profile/ProfileDashboard";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-32 pb-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", { method: "POST" }).catch(() => {});
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <ProfileDashboard handleLogout={handleLogout} />
      </div>
    </div>
  );
}
