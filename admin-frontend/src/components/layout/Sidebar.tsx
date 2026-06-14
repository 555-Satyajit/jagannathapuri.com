'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon 
} from 'lucide-react';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Products',
    icon: Package,
    href: '/products',
  },
  {
    label: 'Categories',
    icon: Tags,
    href: '/categories',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/orders',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/users',
  },
  {
    label: 'Banners',
    icon: ImageIcon,
    href: '/banners',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold tracking-tight">Admin<span className="text-primary">Panel</span></h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition ${
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400'
              }`}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
