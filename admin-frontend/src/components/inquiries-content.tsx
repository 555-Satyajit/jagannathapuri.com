"use client"

import * as React from "react"
import { 
  MoreVertical, Search, CheckCircle2, Clock, Trash
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { toast } from "sonner"

export function InquiriesContent() {
  const [inquiries, setInquiries] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  
  const [inquiryToDelete, setInquiryToDelete] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const fetchInquiries = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/inquiries?search=${searchQuery}`)
      if (res.ok) {
        const json = await res.json()
        setInquiries(json.inquiries)
      } else {
        toast.error("Failed to load inquiries")
      }
    } catch (e) {
      toast.error("An error occurred while fetching inquiries")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchInquiries()
  }, [searchQuery])

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryToDelete}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success("Inquiry deleted successfully")
        setInquiries(prev => prev.filter(i => i.id !== inquiryToDelete))
      } else {
        toast.error("Failed to delete inquiry")
      }
    } catch (e) {
      toast.error("Error deleting inquiry")
    } finally {
      setIsDeleting(false)
      setInquiryToDelete(null)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success("Status updated")
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      } else {
        toast.error("Failed to update status")
      }
    } catch (e) {
      toast.error("Error updating status")
    }
  }

  const filteredInquiries = inquiries.filter(i => 
    statusFilter === "all" ? true : i.status === statusFilter
  )

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>
      case 'Contacted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Contacted</Badge>
      case 'Resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patachitra Inquiries</h1>
          <p className="text-muted-foreground">Manage customer inquiries for exclusive Patachitra artworks.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, phone..."
                  className="pl-8 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                <SelectTrigger className="w-full sm:w-40 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <Table>
              <TableBody>
                <TableSkeleton columns={6} rows={5} />
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No inquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{inquiry.name}</span>
                          <span className="text-xs text-muted-foreground">{inquiry.email}</span>
                          <span className="text-xs text-muted-foreground">{inquiry.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">
                          {inquiry.product ? inquiry.product.product_name : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate" title={inquiry.message}>
                          {inquiry.message || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inquiry.status || 'Pending')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(inquiry.id, 'Pending')}>
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(inquiry.id, 'Contacted')}>
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(inquiry.id, 'Resolved')}>
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                              onClick={() => setInquiryToDelete(inquiry.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!inquiryToDelete} onOpenChange={(open) => !open && setInquiryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInquiryToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
