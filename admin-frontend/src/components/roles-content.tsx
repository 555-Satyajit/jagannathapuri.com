"use client"

import * as React from "react"
import { MoreVertical, Plus, Search, Pencil, Trash, UserCog, Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RolesContent() {
  const [rolesData, setRolesData] = React.useState<any[]>([])
  const [usersData, setUsersData] = React.useState<any[]>([])
  const [permissionsList, setPermissionsList] = React.useState<any[]>([])
  
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Edit state
  const [editingRole, setEditingRole] = React.useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rolesRes, usersRes, permsRes] = await Promise.all([
        fetch('/api/admin/roles/data'),
        fetch('/api/admin/roles/staff-data'),
        fetch('/api/admin/permissions/data')
      ])
      
      const rolesResult = await rolesRes.json()
      const usersResult = await usersRes.json()
      const permsResult = await permsRes.json()
      
      if (rolesResult.data) setRolesData(rolesResult.data)
      if (usersResult.data) setUsersData(usersResult.data)
      if (permsResult.data) setPermissionsList(permsResult.data)
        
    } catch (error) {
      console.error('Failed to fetch roles data:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const openAddRole = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const openEditRole = (role: any) => {
    setEditingRole(role)
    setDialogOpen(true)
  }

  const filteredUsers = usersData.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Roles List</h2>
        <p className="text-muted-foreground">
          A role provides access to predefined menus and features.
        </p>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground flex justify-center gap-4">
            <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
            <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
            <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
          </div>
        ) : rolesData.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">Total {role.users} users</p>
                <div className="flex -space-x-2">
                  {role.avatars && role.avatars.slice(0, 4).map((src: string, idx: number) => (
                    <Avatar key={idx} className="border-2 border-background w-8 h-8">
                      <AvatarImage src={src} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        U
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {role.avatars && role.avatars.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium z-10">
                      +{role.avatars.length - 4}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-lg font-semibold">{role.name}</h4>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => openEditRole(role)}>
                    Edit Role
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Role Card */}
        <Card className="bg-primary/5 border-primary/20 flex flex-col justify-center items-center text-center min-h-[160px]">
          <CardContent className="p-6 w-full h-full flex flex-col justify-center items-center">
            <Button className="mb-2" onClick={openAddRole}>Add New Role</Button>
            <p className="text-sm text-muted-foreground">Add role, if it does not exist</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <RoleDialogForm 
          onCancel={() => setDialogOpen(false)} 
          permissionsList={permissionsList}
          editingRole={editingRole}
          refreshData={fetchData}
        />
      </Dialog>

      {/* Users by Role Table Card */}
      <div className="border rounded-xl bg-card shadow-sm mt-4 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search user..." 
                className="pl-9 w-full bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableSkeleton columns={4} rows={5} />
              ) : filteredUsers.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found.</TableCell>
                 </TableRow>
              ) : filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.full_name?.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.full_name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                        <UserCog className="h-4 w-4" />
                      </div>
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 2 ? "default" : user.status === 1 ? "secondary" : "destructive"}>
                      {user.status === 2 ? "Active" : user.status === 1 ? "Pending" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function RoleDialogForm({ onCancel, permissionsList, editingRole, refreshData }: { onCancel: () => void, permissionsList: any[], editingRole: any, refreshData: () => void }) {
  const [roleName, setRoleName] = React.useState("")
  const [selectedPerms, setSelectedPerms] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name)
      setSelectedPerms(editingRole.permissions || [])
    } else {
      setRoleName("")
      setSelectedPerms([])
    }
  }, [editingRole])

  const togglePerm = (permName: string) => {
    if (selectedPerms.includes(permName)) {
      setSelectedPerms(selectedPerms.filter(p => p !== permName))
    } else {
      setSelectedPerms([...selectedPerms, permName])
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload = {
        roleId: editingRole?.id,
        modalRoleName: roleName,
        permissions: selectedPerms
      }
      
      const response = await fetch('/api/admin/roles/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        refreshData()
        onCancel()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to save role")
      }
    } catch (error) {
      console.error("Error saving role:", error)
      alert("Error saving role")
    } finally {
      setLoading(false)
    }
  }

  // Group permissions for rendering
  const groupedModules: Record<string, string[]> = {}
  permissionsList.forEach(p => {
    const [mod, act] = p.name.split(':')
    const action = act || 'Read'
    if (!groupedModules[mod]) groupedModules[mod] = []
    groupedModules[mod].push(action)
  })

  const modules = Object.keys(groupedModules)

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0">
      <div className="p-6 pb-0 shrink-0 text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription className="text-center">
            Set role permissions
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="roleName">Role Name</Label>
          <Input 
            id="roleName" 
            placeholder="Enter a role name" 
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Role Permissions</h4>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Permission Module</TableHead>
                  <TableHead className="w-[80px] text-center">Read</TableHead>
                  <TableHead className="w-[80px] text-center">Create</TableHead>
                  <TableHead className="w-[80px] text-center">Edit</TableHead>
                  <TableHead className="w-[80px] text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No permissions created yet. Go to the Permissions tab to create them.
                    </TableCell>
                  </TableRow>
                ) : modules.map((modName) => {
                  const availableActions = groupedModules[modName]
                  return (
                    <TableRow key={modName}>
                      <TableCell className="font-medium">{modName}</TableCell>
                      {['Read', 'Create', 'Edit', 'Delete'].map(action => {
                        const permString = `${modName}:${action}`
                        const exists = availableActions.includes(action)
                        return (
                          <TableCell key={action} className="text-center">
                            {exists && (
                              <Checkbox 
                                checked={selectedPerms.includes(permString)}
                                onCheckedChange={() => togglePerm(permString)}
                              />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 border-t mt-auto flex justify-center gap-3 shrink-0 bg-background pt-6">
        <Button onClick={handleSubmit} disabled={loading} className="px-8">
          {loading ? 'Saving...' : 'Submit'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="px-8">Cancel</Button>
      </div>
    </DialogContent>
  )
}
