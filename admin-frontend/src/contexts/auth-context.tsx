"use client"

import * as React from "react"

type User = {
  id: number
  full_name: string
  email: string
  avatar: string
  role: {
    name: string
    permissions: { name: string }[]
  }
}

type AuthContextType = {
  user: User | null
  loading: boolean
  hasPermission: (module: string, action?: string) => boolean
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  hasPermission: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/admin/auth/me')
        const data = await res.json()
        if (data.success && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user session", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const hasPermission = React.useCallback((moduleName: string, action: string = "Read") => {
    if (!user || !user.role || !user.role.permissions) return false
    
    // Admin / Super Admin bypass (God Mode)
    const roleName = user.role.name.toLowerCase()
    if (roleName === 'admin' || roleName === 'super admin' || roleName === 'superadmin') {
      return true
    }
    
    // Otherwise check specific permission array
    const exactMatch = `${moduleName}:${action}`
    return user.role.permissions.some(p => p.name === exactMatch)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => React.useContext(AuthContext)
