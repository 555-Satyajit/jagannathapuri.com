"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, X, Volume2, BellOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // 1. Fetch unread notifications on load
    fetchUnread();
    
    // 2. Check push subscription status
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true);
            // Auto-sync to backend just in case it was lost
            fetch(`/api/admin/notifications/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sub)
            }).catch(console.error);
          }
        });
      });
    }

    // Optional: Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await fetch(`/api/admin/notifications/unread`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications are not supported by your browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Permission denied!");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!pubKey) {
        alert("Push notifications are not fully configured (missing VAPID key). Please restart your frontend server.");
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey as string)
      });

      await fetch(`/api/admin/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      setIsSubscribed(true);
      alert("Subscribed successfully! You will now receive push notifications.");
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/admin/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    for (const n of notifications) {
      await markAsRead(n.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground outline-none mr-2" />}>
        <Bell className="size-5" />
        {notifications.length > 0 && (
          <span className="absolute top-[6px] right-[8px] flex h-[9px] w-[9px] rounded-full bg-destructive border-2 border-white dark:border-slate-950"></span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            <div 
              role="button" 
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); markAllRead(); }} 
              className="flex items-center text-xs font-normal text-muted-foreground hover:text-primary cursor-pointer"
            >
              <CheckCheck className="mr-1 size-3" /> Mark all read
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        {!isSubscribed && (
          <div className="p-3 bg-primary/10 border-b border-primary/20 flex flex-col items-center gap-2 text-center">
            <Volume2 className="size-5 text-primary" />
            <p className="text-xs font-medium">Never miss an order!</p>
            <Button size="sm" onClick={subscribeToPush} className="w-full text-xs h-7">
              Enable Push Notifications
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
             <BellOff className="size-8 mb-2 opacity-20" />
             <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <DropdownMenuItem 
              key={n.id} 
              className="group flex flex-col items-start gap-1 p-3 cursor-pointer relative" 
              onSelect={(e) => {
                e.preventDefault(); // keep menu open if we want, or remove if we want it to close
                if (n.link) window.location.href = n.link;
                markAsRead(n.id);
              }}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {n.type === 'ORDER' ? '🛒' : '💬'} {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div 
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onPointerDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    markAsRead(n.id); 
                  }}
                >
                  <X className="size-4" />
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
