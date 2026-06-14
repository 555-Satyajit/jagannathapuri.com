import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCheck, X, Search, ExternalLink, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { UserNav } from "@/components/user-nav";
import { AuthProvider } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-950 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <h1 className="text-sm font-semibold ml-2">Admin Dashboard</h1>
            {/* Space for right header items like avatar */}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:flex items-center mr-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-8 h-9 bg-muted/50 border-none focus-visible:ring-1"
                />
                <div className="absolute right-2.5 top-2 flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>

              <Button variant="outline" size="sm" className="hidden sm:flex h-9 gap-2 mr-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">View Store</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground outline-none" />}>
                  <Bell className="size-5" />
                  <span className="absolute top-[6px] right-[8px] flex h-[9px] w-[9px] rounded-full bg-destructive border-2 border-white dark:border-slate-950"></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center justify-between">
                      Notifications
                      <div role="button" className="flex items-center text-xs font-normal text-muted-foreground hover:text-primary cursor-pointer">
                        <CheckCheck className="mr-1 size-3" /> Mark all read
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="group flex flex-col items-start gap-1 p-3 cursor-pointer relative">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-sm">New Order #1024</span>
                      <span className="text-xs text-muted-foreground">2m ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pr-4">
                      Rahul Sharma just placed an order for 2 items totaling ₹1,450.
                    </p>
                    <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X className="size-3.5" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="group flex flex-col items-start gap-1 p-3 cursor-pointer relative">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-sm">Low Stock Alert</span>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pr-4">
                      "Premium Incense Sticks" is running low on inventory (only 3 left).
                    </p>
                    <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X className="size-3.5" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="group flex flex-col items-start gap-1 p-3 cursor-pointer relative">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-sm">New Customer</span>
                      <span className="text-xs text-muted-foreground">5h ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pr-4">
                      Priya Patel registered a new account.
                    </p>
                    <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <X className="size-3.5" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-2 text-center text-sm font-medium text-primary cursor-pointer justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
    </AuthProvider>
  )
}
