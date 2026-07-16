"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  UserCog, 
  Ticket, 
  Store, 
  Settings 
} from "lucide-react"

const data = {
  user: {
    name: "Admin User",
    email: "admin@jagannathapuri.com",
    avatar: "/avatars/01.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard />,
      isActive: true,
      requiredModule: "Dashboard",
      items: [
        { title: "Analytics", url: "/" },
        { title: "Engagement Analytics", url: "/admin/engagement" },
      ],
    },
    {
      title: "Catalog",
      url: "/admin/ecommerce/products",
      icon: <Package />,
      requiredModule: "Catalog",
      items: [
        { title: "Categories", url: "/admin/ecommerce/categories" },
        { title: "Products", url: "/admin/ecommerce/products" },
        { title: "Attributes", url: "/admin/ecommerce/attributes" },
        { title: "Coupons", url: "/admin/ecommerce/coupons", requiredModule: "Coupons" },
      ],
    },
    {
      title: "User Management",
      url: "/admin/staff",
      icon: <UserCog />,
      requiredModule: "User Management",
      items: [
        { title: "Roles", url: "/admin/roles" },
        { title: "Permissions", url: "/admin/permissions" },
        { title: "Our Staff", url: "/admin/staff" },
      ],
    },
    {
      title: "Store Configuration",
      url: "/admin/settings/general",
      icon: <Store />,
      requiredModule: "Store Configuration",
      items: [
        { title: "Manage Home", url: "/admin/store/home" },
        { title: "Manage Library", url: "/admin/library/categories" },
        { title: "Daily Rituals", url: "/admin/daily-rituals" },
        { title: "Panchang", url: "/admin/panchang" },
        { title: "Festivals", url: "/admin/festivals" },
        { title: "Popups", url: "/admin/store/popup/list" },
        { title: "Newsletter", url: "/admin/newsletter/list" },
        { title: "General", url: "/admin/settings/general" },
        { title: "Shipping & Payment", url: "/admin/settings/shipping-payment" },
        { title: "Manage Contact", url: "/admin/store/contact" },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings/audit-logs",
      icon: <Settings />,
      requiredModule: "Settings",
      items: [
        { title: "Policies", url: "/admin/settings/policies" },
        { title: "Audit Logs", url: "/admin/settings/audit-logs" },
      ],
    },
  ],
  navSecondary: [
    { title: "Customers", url: "/admin/ecommerce/customers", icon: <Users />, requiredModule: "Customers" },
    { title: "Orders", url: "/admin/ecommerce/orders", icon: <ShoppingCart />, requiredModule: "Orders" },
    { title: "Transactions", url: "/admin/ecommerce/transactions", icon: <CreditCard />, requiredModule: "Transactions" },
    { title: "Tickets", url: "/admin/tickets/list", icon: <Ticket />, requiredModule: "Tickets" },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, hasPermission, loading } = useAuth()

  // Filter items based on permissions
  const filteredNavMain = data.navMain
    .filter(item => hasPermission(item.requiredModule))
    .map(item => ({
      ...item,
      items: item.items ? item.items.filter(subItem => 
        // @ts-ignore
        subItem.requiredModule ? hasPermission(subItem.requiredModule) : true
      ) : []
    }))
    
  const filteredNavSecondary = data.navSecondary.filter(item => hasPermission(item.requiredModule))

  const userData = user ? {
    name: user.full_name,
    email: user.email,
    avatar: user.avatar || data.user.avatar,
  } : data.user

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-base">Jagannathapuri</span>
                <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
