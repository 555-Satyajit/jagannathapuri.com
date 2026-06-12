"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Package, Heart, Settings, LogOut, ChevronRight } from "lucide-react";
import AccountTab from "./AccountTab";
import OrdersTab from "./OrdersTab";
import WishlistTab from "./WishlistTab";
import SettingsTab from "./SettingsTab";

type TabType = "account" | "orders" | "wishlist" | "settings";

interface ProfileDashboardProps {
  handleLogout: () => void;
}

export default function ProfileDashboard({ handleLogout }: ProfileDashboardProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("account");

  if (!user) return null;

  const tabs = [
    { id: "account", label: "Account Details", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountTab user={user} />;
      case "orders":
        return <OrdersTab />;
      case "wishlist":
        return <WishlistTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <AccountTab user={user} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        {/* User Card */}
        <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl p-6 border border-zinc-200/60 shadow-xl shadow-black/[0.02] flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 rounded-full flex items-center justify-center text-2xl font-black shadow-inner">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="relative z-10">
            <h2 className="font-bold text-zinc-900 text-lg leading-tight">{user.fullName}</h2>
            <p className="text-sm text-zinc-500 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Desktop Sidebar / Mobile Horizontal Scroll */}
        <nav className="bg-white rounded-3xl p-3 lg:p-4 border border-zinc-200 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide gap-2 lg:gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm lg:text-base text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal group ${
                  isActive 
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-orange-400" : "text-zinc-400 group-hover:text-zinc-600"}`} /> 
                <span className="flex-1">{tab.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 hidden lg:block opacity-50" />}
              </button>
            );
          })}
          
          <div className="h-8 lg:h-px w-px lg:w-full bg-zinc-100 mx-2 lg:mx-0 lg:my-2 flex-shrink-0"></div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 font-semibold text-sm lg:text-base text-left transition-colors whitespace-nowrap lg:whitespace-normal"
          >
            <LogOut className="w-5 h-5 opacity-80" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 lg:p-10 border border-zinc-200 shadow-sm relative overflow-hidden min-h-[500px]">
        {renderContent()}
      </div>

    </div>
  );
}
