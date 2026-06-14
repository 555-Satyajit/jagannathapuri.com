"use client"

import * as React from "react"
import { MoreVertical, Plus, Search, Pencil, Trash, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

export function PermissionsContent() {
  const [data, setData] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  
  // Form states
  const [permissionName, setPermissionName] = React.useState("")

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/permissions/data')
      const result = await response.json()
      if (result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/permissions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modalPermissionName: permissionName })
      })
      if (response.ok) {
        setAddDialogOpen(false)
        setPermissionName("")
        fetchData() // Refresh list
      }
    } catch (error) {
      console.error('Error adding permission:', error)
    }
  }

  const handleDelete = async (moduleName: string) => {
    if (!confirm(`Are you sure you want to delete the "${moduleName}" module? It will remove all associated permissions from all roles.`)) return;
    try {
      const response = await fetch(`/api/admin/permissions/delete-module`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName })
      })
      if (response.ok) {
        setData(data.filter(p => !p.name.startsWith(moduleName)))
      }
    } catch (error) {
      console.error('Error deleting permission module:', error)
    }
  }

  // Group permissions by Module Name
  const groupedModules: Record<string, any> = {}
  data.forEach(p => {
    const parts = p.name.split(':')
    const mod = parts[0]
    const action = parts[1] || 'All'
    
    if (!groupedModules[mod]) {
      groupedModules[mod] = { id: p.id, name: mod, actions: [] }
    }
    groupedModules[mod].actions.push(action)
  })

  const displayData = Object.values(groupedModules).filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Permissions List</h2>
          <p className="text-muted-foreground">
            Each category includes predefined roles and granular permissions. Manage them here.
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger render={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Permission</DialogTitle>
              <DialogDescription>
                Permissions you may use and assign to your users.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-6 pt-4" onSubmit={handleAdd}>
              <div className="space-y-2">
                <Label htmlFor="permissionName">Permission Module Name</Label>
                <Input 
                  id="permissionName" 
                  placeholder="e.g. Inventory Management" 
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value)}
                  autoFocus 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Discard</Button>
                <Button type="submit">Create Permission</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center p-4 border-b">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search permissions..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Module Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={2} rows={5} />
              ) : displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No permissions found.
                  </TableCell>
                </TableRow>
              ) : displayData.map((mod) => (
                <TableRow key={mod.name}>
                  <TableCell>
                    <div className="font-semibold text-primary">{mod.name}</div>
                    <div className="flex gap-1 mt-1 text-xs">
                      {mod.actions.map((act: string) => (
                        <Badge key={act} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {act}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(mod.name)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete Module
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
