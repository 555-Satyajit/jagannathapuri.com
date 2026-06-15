"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast, Toaster } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function NewsletterContent() {
  const [subscribers, setSubscribers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/store/newsletter/data')
      const result = await response.json()
      if (result.success) {
        setSubscribers(result.data)
      } else {
        toast.error("Failed to fetch subscribers")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const predictedNewStatus = currentStatus === 'Subscribed' ? 'Unsubscribed' : 'Subscribed'
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: predictedNewStatus } : s))
    
    try {
      const response = await fetch(`/api/admin/store/newsletter/toggle-status/${id}`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        const actualStatus = result.data.status
        if (actualStatus !== predictedNewStatus) {
           setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: actualStatus } : s))
        }
        toast.success("Status updated")
      } else {
        setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus } : s))
        toast.error("Failed to update status")
      }
    } catch (error) {
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus } : s))
      toast.error("An error occurred")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/store/newsletter/delete/${deleteId}`)
      const result = await response.json()
      if (result.success) {
        toast.success("Subscriber deleted successfully")
        setSubscribers(prev => prev.filter(s => s.id !== deleteId))
      } else {
        toast.error("Failed to delete subscriber")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      header: "Email",
      accessorKey: "email",
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {item.email}
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Subscribed" ? "default" : "secondary"}
          className={`cursor-pointer hover:opacity-80 transition-opacity ${item.status === "Subscribed" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
          onClick={() => toggleStatus(item.id, item.status)}
        >
          {item.status}
        </Badge>
      )
    },
    {
      header: "Subscribed At",
      accessorKey: "createdAt",
      cell: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.createdAt).toLocaleString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
          })}
        </span>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => setDeleteId(item.id)}>
              Delete Subscriber
            </DropdownMenuItem>
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
          <CardHeader className="pb-3 border-b">
            <CardTitle>Subscribers List</CardTitle>
            <CardDescription>All users who have opted in to receive the newsletter.</CardDescription>
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
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this subscriber from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscribers List</CardTitle>
            <CardDescription>All users who have opted in to receive the newsletter.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={subscribers} columns={columns} keyExtractor={(item) => item.id} />
        </CardContent>
      </Card>
    </div>
  )
}
