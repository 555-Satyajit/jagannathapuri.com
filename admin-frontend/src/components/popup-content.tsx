"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Image as ImageIcon, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast, Toaster } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
const popupSchema = z.object({
  image: z.any().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(["Active", "Inactive"]),
})

type PopupFormValues = z.infer<typeof popupSchema>

export function PopupContent() {
  const [popups, setPopups] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<PopupFormValues>({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      status: "Active"
    }
  })

  const fetchPopups = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/store/popups/data')
      const data = await res.json()
      if (data.success) {
        setPopups(data.data)
      }
    } catch (error) {
      toast.error("Failed to fetch popups")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPopups()
  }, [])

  const onSubmit = async (data: PopupFormValues) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('startTime', data.startTime)
      formData.append('endTime', data.endTime)
      formData.append('status', data.status)
      
      // image is a FileList from input type="file"
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0])
      } else if (!editingId) {
        toast.error("Image is required for a new popup")
        setIsSaving(false)
        return
      }

      const url = editingId ? `/api/admin/store/popups/update/${editingId}` : '/api/admin/store/popups/save'
      
      const res = await fetch(url, {
        method: 'POST',
        body: formData
      })
      const result = await res.json()
      
      if (result.success) {
        toast.success(`Popup ${editingId ? 'updated' : 'saved'} successfully`)
        setIsSheetOpen(false)
        reset()
        setEditingId(null)
        fetchPopups()
      } else {
        toast.error(result.error || "Failed to save popup")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async (id: number) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/store/popups/delete/${id}`)
      const data = await res.json()
      if (data.success) {
        toast.success("Popup deleted successfully")
        fetchPopups()
      } else {
        toast.error("Failed to delete popup")
      }
    } catch (error) {
      toast.error("Failed to delete popup")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    // Optimistic Update
    const predictedNewStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setPopups(prev => prev.map(p => p.id === id ? { ...p, status: predictedNewStatus } : p));
    
    try {
      const response = await fetch(`/api/admin/store/popups/toggle-status/${id}`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        const actualStatus = result.data.status;
        if (actualStatus !== predictedNewStatus) {
           setPopups(prev => prev.map(p => p.id === id ? { ...p, status: actualStatus } : p));
        }
        toast.success("Status updated");
      } else {
        setPopups(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
        toast.error("Failed to update status");
      }
    } catch (error) {
      setPopups(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
      toast.error("An error occurred");
    }
  };

  const handleEdit = (popup: any) => {
    setEditingId(popup.id)
    // Convert dates to local ISO format for datetime-local input
    const start = new Date(popup.startTime)
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset())
    setValue("startTime", start.toISOString().slice(0, 16))

    const end = new Date(popup.endTime)
    end.setMinutes(end.getMinutes() - end.getTimezoneOffset())
    setValue("endTime", end.toISOString().slice(0, 16))
    
    setValue("status", popup.status)
    setIsSheetOpen(true)
  }

  const columns: ColumnDef<any>[] = [
    {
      header: "Image",
      accessorKey: "image",
      cell: (item) => (
        <div className="h-12 w-20 relative rounded overflow-hidden border">
          {item.image ? (
            <img src={item.image} alt="Popup" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )
    },
    {
      header: "Schedule",
      accessorKey: "startTime",
      cell: (item) => (
        <div className="text-sm">
          <div><span className="font-semibold text-muted-foreground">From:</span> {new Date(item.startTime).toLocaleString('en-GB')}</div>
          <div><span className="font-semibold text-muted-foreground">To:</span> {new Date(item.endTime).toLocaleString('en-GB')}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={`cursor-pointer hover:opacity-80 transition-opacity ${item.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
          onClick={() => toggleStatus(item.id, item.status)}
        >
          {item.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Actions</div>
            <DropdownMenuItem onClick={() => handleEdit(item)}>Edit Popup</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(item.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Toaster position="top-center" richColors />
        <Card>
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle>Popups List</CardTitle>
              <CardDescription>View and manage active and scheduled popups.</CardDescription>
            </div>
            <Skeleton className="h-9 w-32" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-center" richColors />
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>Popups List</CardTitle>
            <CardDescription>View and manage active and scheduled popups.</CardDescription>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={(open) => {
            setIsSheetOpen(open)
            if (!open) {
              reset()
              setEditingId(null)
            }
          }}>
            <SheetTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Popup
                </Button>
              }
            />
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)}>
                <SheetHeader>
                  <SheetTitle>{editingId ? "Edit Popup" : "Add Popup"}</SheetTitle>
                  <SheetDescription>
                    Upload a promotional image and set its display schedule.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="popup-image">Popup Image {editingId && "(Leave empty to keep existing)"}</Label>
                    <Input id="popup-image" type="file" accept="image/*" {...register("image")} />
                    {errors.image && <p className="text-sm text-destructive">{errors.image.message?.toString()}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Date & Time</Label>
                    <Input id="start-time" type="datetime-local" {...register("startTime")} />
                    {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Date & Time</Label>
                    <Input id="end-time" type="datetime-local" {...register("endTime")} />
                    {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="popup-status">Status</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="popup-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Popup
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            data={popups} 
            columns={columns} 
            keyExtractor={(item) => item.id} 
          />
        </CardContent>
      </Card>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Popup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this popup? This action cannot be undone and will permanently remove it from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && confirmDelete(deleteId)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
