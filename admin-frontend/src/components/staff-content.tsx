"use client"

import * as React from "react"
import { 
  MoreVertical, Plus, Search, Pencil, Trash, 
  Users, UserCheck, UserCog, UserPlus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function StaffContent() {
  const [data, setData] = React.useState<any[]>([])
  const [roles, setRoles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<any>(null)

  // Form State
  const [userFullname, setUserFullname] = React.useState("")
  const [userEmail, setUserEmail] = React.useState("")
  const [userContact, setUserContact] = React.useState("")
  const [userRole, setUserRole] = React.useState("")
  const [userPassword, setUserPassword] = React.useState("")
  const [formLoading, setFormLoading] = React.useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/admin/staff/data'),
        fetch('/api/admin/roles/data')
      ])
      const staffResult = await staffRes.json()
      const rolesResult = await rolesRes.json()

      if (staffResult.data) setData(staffResult.data)
      if (rolesResult.data) setRoles(rolesResult.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const openAddSheet = () => {
    setEditingStaff(null)
    setUserFullname("")
    setUserEmail("")
    setUserContact("")
    setUserRole("")
    setUserPassword("")
    setSheetOpen(true)
  }

  const openEditSheet = (staff: any) => {
    setEditingStaff(staff)
    setUserFullname(staff.name)
    setUserEmail(staff.email)
    setUserContact(staff.contact || "")
    setUserRole(staff.role)
    setUserPassword("") // Leave empty unless they want to change it
    setSheetOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = { userFullname, userEmail, userContact, userRole, userPassword }
      const url = editingStaff ? `/api/admin/staff/update/${editingStaff.id}` : `/api/admin/staff/save`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        fetchData()
        setSheetOpen(false)
      } else {
        const err = await response.json()
        alert(err.error || "Failed to save staff")
      }
    } catch (error) {
      console.error('Error saving staff:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const response = await fetch(`/api/admin/staff/delete/${id}`)
      if (response.ok) {
        setData(data.filter(s => s.id !== id))
      } else {
        const err = await response.json()
        alert(err.error || "Failed to delete staff")
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const predictedNewStatusStr = currentStatus === 'Active' ? 'Inactive' : 'Active'
    
    // Optimistic UI update
    setData(prevData => prevData.map(item => 
      item.id === id ? { ...item, status: predictedNewStatusStr } : item
    ))

    try {
      const response = await fetch(`/api/admin/staff/toggle-status/${id}`, { method: 'POST' })
      const result = await response.json()
      
      if (!result.success) {
        // Revert on failure
        setData(prevData => prevData.map(item => 
          item.id === id ? { ...item, status: currentStatus } : item
        ))
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      // Revert on failure
      setData(prevData => prevData.map(item => 
        item.id === id ? { ...item, status: currentStatus } : item
      ))
    }
  }

  const filteredData = data.filter(staff => 
    staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeStaffCount = data.filter(s => s.status === 'Active').length
  const pendingStaffCount = data.filter(s => s.status === 'Pending').length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Our Staff</h2>
          <p className="text-muted-foreground">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <Button className="shrink-0" onClick={openAddSheet}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full">
            <div className="p-6 pb-0">
              <SheetHeader className="mb-6">
                <SheetTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</SheetTitle>
                <SheetDescription>
                  {editingStaff ? 'Update staff member details.' : 'Create a new staff member account.'}
                </SheetDescription>
              </SheetHeader>
            </div>
            <form className="flex flex-col flex-1 overflow-y-auto p-6 pt-0 space-y-6" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="add-user-fullname">Full Name</Label>
                <Input id="add-user-fullname" placeholder="John Doe" value={userFullname} onChange={e => setUserFullname(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-user-email">Email</Label>
                <Input id="add-user-email" type="email" placeholder="john.doe@example.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-user-contact">Contact</Label>
                <Input id="add-user-contact" placeholder="+91 91234 56789" value={userContact} onChange={e => setUserContact(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">User Role</Label>
                <Select required value={userRole} onValueChange={(val) => setUserRole(val || "")}>
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-user-password">Password {editingStaff && "(Leave blank to keep current)"}</Label>
                <Input id="add-user-password" type="password" placeholder="****" value={userPassword} onChange={e => setUserPassword(e.target.value)} required={!editingStaff} />
              </div>
              <div className="pt-6 mt-auto border-t flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={formLoading}>{formLoading ? 'Saving...' : 'Submit'}</Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Staff</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{data.length}</h3>
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Staff</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{activeStaffCount}</h3>
              </div>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <UserCog className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Staff</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{pendingStaffCount}</h3>
              </div>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center p-4 border-b gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search staff..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableSkeleton columns={5} rows={5} />
              ) : filteredData.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No staff found.</TableCell>
                 </TableRow>
              ) : filteredData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={staff.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">{staff.name?.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold">{staff.name}</span>
                        <span className="text-sm text-muted-foreground">{staff.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{staff.role}</TableCell>
                  <TableCell className="text-muted-foreground">{staff.joiningDate}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={staff.status === "Active" ? "default" : "secondary"}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${staff.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
                      onClick={() => toggleStatus(staff.id, staff.status)}
                    >
                      {staff.status}
                    </Badge>
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditSheet(staff)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(staff.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
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
