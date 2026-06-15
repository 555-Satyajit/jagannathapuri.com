"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Sun, Moon, Clock, Info, ShieldAlert } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast, Toaster } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// --- Schemas ---
const ritualSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  time: z.string().min(1, "Time is required"),
  icon: z.string(),
  status: z.enum(["Active", "Inactive"]),
})

const darshanSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  timeRange: z.string().min(1, "Time Range is required"),
  type: z.enum(["General", "Special", "Pahuda"]),
  status: z.enum(["Active", "Inactive"]),
})

const factSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string(),
  colorClass: z.enum(["primary", "secondary", "success", "warning"]),
  status: z.enum(["Active", "Inactive"]),
})

type RitualFormValues = z.infer<typeof ritualSchema>
type DarshanFormValues = z.infer<typeof darshanSchema>
type FactFormValues = z.infer<typeof factSchema>

export function DailyRitualsContent() {
  const [rituals, setRituals] = React.useState<any[]>([])
  const [darshans, setDarshans] = React.useState<any[]>([])
  const [facts, setFacts] = React.useState<any[]>([])
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [deleteData, setDeleteData] = React.useState<{type: 'ritual' | 'darshan' | 'fact', id: number} | null>(null)
  
  const [activeTab, setActiveTab] = React.useState("rituals")
  const [ritualSheetOpen, setRitualSheetOpen] = React.useState(false)
  const [darshanSheetOpen, setDarshanSheetOpen] = React.useState(false)
  const [factSheetOpen, setFactSheetOpen] = React.useState(false)

  const ritualForm = useForm<RitualFormValues>({
    resolver: zodResolver(ritualSchema),
    defaultValues: { name: "", time: "", icon: "Sun", status: "Active" }
  })

  const darshanForm = useForm<DarshanFormValues>({
    resolver: zodResolver(darshanSchema),
    defaultValues: { name: "", timeRange: "", type: "General", status: "Active" }
  })

  const factForm = useForm<FactFormValues>({
    resolver: zodResolver(factSchema),
    defaultValues: { title: "", description: "", icon: "Info", colorClass: "primary", status: "Active" }
  })

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rRes, dRes, fRes] = await Promise.all([
        fetch('/api/admin/store/rituals/data'),
        fetch('/api/admin/store/darshans/data'),
        fetch('/api/admin/store/facts/data')
      ])
      
      const [r, d, f] = await Promise.all([rRes.json(), dRes.json(), fRes.json()])
      
      if (r.success) setRituals(r.data)
      if (d.success) setDarshans(d.data)
      if (f.success) setFacts(f.data)
      
    } catch (err) {
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  // Generic Submit
  const handleRitualSubmit = async (data: RitualFormValues) => {
    setIsSubmitting(true)
    try {
      const url = data.id ? `/api/admin/store/rituals/update/${data.id}` : '/api/admin/store/rituals/save'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success(data.id ? "Ritual updated" : "Ritual added")
        fetchData()
        setRitualSheetOpen(false)
        ritualForm.reset()
      } else {
        toast.error(result.error || "Failed to save ritual")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDarshanSubmit = async (data: DarshanFormValues) => {
    setIsSubmitting(true)
    try {
      const url = data.id ? `/api/admin/store/darshans/update/${data.id}` : '/api/admin/store/darshans/save'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success(data.id ? "Darshan updated" : "Darshan added")
        fetchData()
        setDarshanSheetOpen(false)
        darshanForm.reset()
      } else {
        toast.error(result.error || "Failed to save darshan")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFactSubmit = async (data: FactFormValues) => {
    setIsSubmitting(true)
    try {
      const url = data.id ? `/api/admin/store/facts/update/${data.id}` : '/api/admin/store/facts/save'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        toast.success(data.id ? "Fact updated" : "Fact added")
        fetchData()
        setFactSheetOpen(false)
        factForm.reset()
      } else {
        toast.error(result.error || "Failed to save fact")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generic Toggle Status
  const toggleStatus = async (type: 'ritual'|'darshan'|'fact', id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    
    // Optimistic Update
    if (type === 'ritual') setRituals(p => p.map(x => x.id === id ? {...x, status: nextStatus} : x))
    if (type === 'darshan') setDarshans(p => p.map(x => x.id === id ? {...x, status: nextStatus} : x))
    if (type === 'fact') setFacts(p => p.map(x => x.id === id ? {...x, status: nextStatus} : x))

    try {
      let endpoint = ''
      if (type === 'ritual') endpoint = 'rituals'
      if (type === 'darshan') endpoint = 'darshans'
      if (type === 'fact') endpoint = 'facts'
      
      const res = await fetch(`/api/admin/store/${endpoint}/toggle-status/${id}`, { method: 'POST' })
      const result = await res.json()
      if (result.success) {
        toast.success("Status updated")
      } else {
        throw new Error()
      }
    } catch (err) {
      toast.error("Failed to update status")
      // Revert
      if (type === 'ritual') setRituals(p => p.map(x => x.id === id ? {...x, status: currentStatus} : x))
      if (type === 'darshan') setDarshans(p => p.map(x => x.id === id ? {...x, status: currentStatus} : x))
      if (type === 'fact') setFacts(p => p.map(x => x.id === id ? {...x, status: currentStatus} : x))
    }
  }

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteData) return
    setIsSubmitting(true)
    try {
      let endpoint = ''
      if (deleteData.type === 'ritual') endpoint = 'rituals'
      if (deleteData.type === 'darshan') endpoint = 'darshans'
      if (deleteData.type === 'fact') endpoint = 'facts'

      const response = await fetch(`/api/admin/store/${endpoint}/delete/${deleteData.id}`)
      const result = await response.json()
      
      if (result.success) {
        toast.success("Deleted successfully")
        if (deleteData.type === 'ritual') setRituals(p => p.filter(x => x.id !== deleteData.id))
        if (deleteData.type === 'darshan') setDarshans(p => p.filter(x => x.id !== deleteData.id))
        if (deleteData.type === 'fact') setFacts(p => p.filter(x => x.id !== deleteData.id))
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
      setDeleteData(null)
    }
  }

  const renderIcon = (iconStr: string) => {
    switch(iconStr.toLowerCase()) {
      case 'moon': return <Moon className="h-4 w-4" />
      case 'clock': return <Clock className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      case 'shieldalert': return <ShieldAlert className="h-4 w-4" />
      default: return <Sun className="h-4 w-4" />
    }
  }

  // Columns
  const ritualColumns: ColumnDef<any>[] = [
    {
      header: "Icon",
      className: "w-[60px]",
      cell: (item) => (
        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {renderIcon(item.icon)}
        </div>
      ),
    },
    { header: "Name", accessorKey: "name", className: "font-medium" },
    {
      header: "Time",
      className: "text-muted-foreground",
      cell: (item) => <Badge variant="outline" className="bg-info/10 text-info border-none">{item.time}</Badge>,
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={`cursor-pointer transition-opacity hover:opacity-80 ${item.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
          onClick={() => toggleStatus('ritual', item.id, item.status)}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              ritualForm.reset(item)
              setRitualSheetOpen(true)
            }}>Edit Ritual</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => setDeleteData({type: 'ritual', id: item.id})}>
              Delete Ritual
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const darshanColumns: ColumnDef<any>[] = [
    { header: "Name", accessorKey: "name", className: "font-medium" },
    {
      header: "Time Range",
      className: "text-muted-foreground",
      cell: (item) => <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{item.timeRange}</Badge>,
    },
    {
      header: "Type",
      cell: (item) => {
        let colorClass = "bg-info/10 text-info"
        if (item.type === "Pahuda") colorClass = "bg-destructive/10 text-destructive"
        if (item.type === "Special") colorClass = "bg-warning/10 text-warning"
        
        return <Badge variant="outline" className={`${colorClass} border-none`}>{item.type}</Badge>
      },
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={`cursor-pointer transition-opacity hover:opacity-80 ${item.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
          onClick={() => toggleStatus('darshan', item.id, item.status)}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              darshanForm.reset(item)
              setDarshanSheetOpen(true)
            }}>Edit Timing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => setDeleteData({type: 'darshan', id: item.id})}>
              Delete Timing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const factsColumns: ColumnDef<any>[] = [
    {
      header: "Icon",
      className: "w-[60px]",
      cell: (item) => {
        const color = item.colorClass || 'primary'
        return (
          <div className={`h-8 w-8 rounded-md flex items-center justify-center bg-${color}/10 text-${color}`}>
            {renderIcon(item.icon)}
          </div>
        )
      },
    },
    { header: "Title", accessorKey: "title", className: "font-medium whitespace-nowrap" },
    {
      header: "Description",
      className: "text-muted-foreground max-w-[300px] truncate",
      cell: (item) => <span className="truncate block" title={item.description}>{item.description}</span>
    },
    {
      header: "Theme",
      cell: (item) => <Badge variant="outline">{item.colorClass}</Badge>,
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={`cursor-pointer transition-opacity hover:opacity-80 ${item.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
          onClick={() => toggleStatus('fact', item.id, item.status)}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              factForm.reset(item)
              setFactSheetOpen(true)
            }}>Edit Fact</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => setDeleteData({type: 'fact', id: item.id})}>
              Delete Fact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]



  return (
    <div className="flex flex-col gap-6">
      <Toaster position="top-center" richColors />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteData !== null} onOpenChange={(open) => !open && setDeleteData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the entry from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteData(null)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rituals">Daily Rituals Timeline</TabsTrigger>
          <TabsTrigger value="darshan">Darshan Timings</TabsTrigger>
          <TabsTrigger value="facts">Temple Facts</TabsTrigger>
        </TabsList>

        {/* Rituals Tab */}
        <TabsContent value="rituals" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Rituals Timeline</CardTitle>
                <CardDescription>Manage the sequential list of temple rituals throughout the day.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setRitualSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Ritual
              </Button>
              <Sheet open={ritualSheetOpen} onOpenChange={(open) => {
                setRitualSheetOpen(open)
                if(!open) ritualForm.reset({ name: "", time: "", icon: "Sun", status: "Active" })
              }}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{ritualForm.watch('id') ? 'Edit Ritual' : 'Add New Ritual'}</SheetTitle>
                    <SheetDescription>Configure ritual details below.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={ritualForm.handleSubmit(handleRitualSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Ritual Name</Label>
                      <Input {...ritualForm.register("name")} placeholder="e.g., Dwara Phita" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Time</Label>
                      <Input {...ritualForm.register("time")} placeholder="e.g., 05:00 AM" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Icon</Label>
                      <Input {...ritualForm.register("icon")} placeholder="e.g., Sun" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Controller
                        control={ritualForm.control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <SheetFooter className="mt-4">
                      <Button variant="outline" type="button" onClick={() => setRitualSheetOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Ritual"}</Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={rituals} columns={ritualColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Darshan Tab */}
        <TabsContent value="darshan" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Darshan Timings</CardTitle>
                <CardDescription>Configure public viewing times and Pahuda (closed) hours.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setDarshanSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Darshan Timing
              </Button>
              <Sheet open={darshanSheetOpen} onOpenChange={(open) => {
                setDarshanSheetOpen(open)
                if(!open) darshanForm.reset({ name: "", timeRange: "", type: "General", status: "Active" })
              }}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{darshanForm.watch('id') ? 'Edit Darshan' : 'Add Darshan Timing'}</SheetTitle>
                    <SheetDescription>Configure viewing window.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={darshanForm.handleSubmit(handleDarshanSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Darshan Name</Label>
                      <Input {...darshanForm.register("name")} placeholder="e.g., General Darshan" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Time Range</Label>
                      <Input {...darshanForm.register("timeRange")} placeholder="e.g., 07:00 AM - 01:00 PM" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Controller
                        control={darshanForm.control}
                        name="type"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Special">Special</SelectItem>
                              <SelectItem value="Pahuda">Pahuda</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Controller
                        control={darshanForm.control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <SheetFooter className="mt-4">
                      <Button variant="outline" type="button" onClick={() => setDarshanSheetOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Darshan"}</Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={darshans} columns={darshanColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facts Tab */}
        <TabsContent value="facts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Did You Know? (Temple Facts)</CardTitle>
                <CardDescription>Manage interesting facts displayed to the users.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setFactSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Temple Fact
              </Button>
              <Sheet open={factSheetOpen} onOpenChange={(open) => {
                setFactSheetOpen(open)
                if(!open) factForm.reset({ title: "", description: "", icon: "Info", colorClass: "primary", status: "Active" })
              }}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{factForm.watch('id') ? 'Edit Fact' : 'Add Temple Fact'}</SheetTitle>
                    <SheetDescription>Create a new interesting fact.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={factForm.handleSubmit(handleFactSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input {...factForm.register("title")} placeholder="e.g., Mahaprasad Mystery" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea {...factForm.register("description")} placeholder="Enter fact description..." rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Icon</Label>
                      <Input {...factForm.register("icon")} placeholder="e.g., Info" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Color Theme</Label>
                      <Controller
                        control={factForm.control}
                        name="colorClass"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary (Maroon)</SelectItem>
                              <SelectItem value="secondary">Secondary (Blue)</SelectItem>
                              <SelectItem value="success">Success (Green)</SelectItem>
                              <SelectItem value="warning">Warning (Orange)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Controller
                        control={factForm.control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <SheetFooter className="mt-4">
                      <Button variant="outline" type="button" onClick={() => setFactSheetOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Fact"}</Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={facts} columns={factsColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
