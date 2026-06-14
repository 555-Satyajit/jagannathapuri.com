"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<{ username: string; email: string; role?: { name: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/admin/auth/me', {
          headers: { 'Accept': 'application/json' }
        })
        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user) return "AD"
    return user.username.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1 outline-none" />}>
        <Avatar className="h-8 w-8 border border-border/50">
          <AvatarImage src="/avatars/01.png" alt={user?.username || "Admin"} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {isLoading ? "Loading..." : user?.username || "Admin User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isLoading ? "Please wait..." : user?.email || "No email available"}
            </p>
            {user?.role && (
              <p className="text-[10px] font-semibold text-primary mt-1 uppercase tracking-wider">
                {user.role.name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
