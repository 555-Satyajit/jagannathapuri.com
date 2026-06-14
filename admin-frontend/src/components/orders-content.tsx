"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  MoreVertical, Search, Eye, 
  CalendarClock, CheckCircle2, XCircle, AlertCircle, 
  CreditCard, Truck, RefreshCcw, Trash
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import Link from "next/link"

export function OrdersContent() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")
  
  const [currentPage, setCurrentPage] = React.useState(1)
  const ITEMS_PER_PAGE = 10

  const [orderToDelete, setOrderToDelete] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/ecommerce/orders/data")
      if (res.ok) {
        const json = await res.json()
        setOrders(json.data)
      } else {
        toast.error("Failed to load orders")
      }
    } catch (e) {
      toast.error("An error occurred while fetching orders")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchOrders()
  }, [])

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/ecommerce/orders/delete/${orderToDelete}`)
      if (res.ok) {
        toast.success("Order deleted successfully")
        setOrderToDelete(null)
        fetchOrders()
      } else {
        toast.error("Failed to delete order")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.order.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "processing") matchesStatus = order.status === 1;
        if (statusFilter === "completed") matchesStatus = order.status === 2;
        if (statusFilter === "cancelled") matchesStatus = order.status === 3;
      }

      let matchesPayment = true;
      if (paymentFilter !== "all") {
        if (paymentFilter === "paid") matchesPayment = order.payment === 1;
        if (paymentFilter === "pending") matchesPayment = order.payment === 2;
        if (paymentFilter === "failed") matchesPayment = order.payment === 3;
        if (paymentFilter === "cancelled") matchesPayment = order.payment === 4;
      }

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter])

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setCurrentPage(1)
  }

  const stats = React.useMemo(() => {
    return {
      pending: orders.filter(o => o.payment === 2).length,
      completed: orders.filter(o => o.payment === 1).length,
      cancelled: orders.filter(o => o.payment === 4).length,
      failed: orders.filter(o => o.payment === 3).length,
    }
  }, [orders])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Orders</h2>
        <p className="text-muted-foreground">
          Track and process customer orders across your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Payment</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <CalendarClock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Completed (Paid)</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{stats.completed}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Payment successful</p>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Cancelled</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{stats.cancelled}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Customer or store initiated</p>
            </div>
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Failed</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{stats.failed}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Payment gateway errors</p>
            </div>
            <div className="h-12 w-12 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center p-4 border-b gap-4 bg-muted/20">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by Order ID, customer..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2 sm:ml-auto">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(val) => setPaymentFilter(val || "all")}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="shrink-0" title="Clear Filters" onClick={clearFilters}>
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} rows={5} />
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No orders found matching your filters.
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/admin/ecommerce/orders/${order.id}`)}>
                  <TableCell className="font-mono font-medium text-primary">#{order.order}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={order.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{order.customer?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{order.customer}</span>
                        <span className="text-xs text-muted-foreground">{order.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.payment === 1 ? "default" : order.payment === 2 ? "outline" : "destructive"} 
                           className={order.payment === 1 ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                      {order.payment === 1 ? "Paid" : order.payment === 2 ? "Pending" : order.payment === 3 ? "Failed" : "Cancelled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="whitespace-nowrap bg-muted">
                      {order.status === 2 && <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" />}
                      {order.status === 1 && <Truck className="mr-1 h-3 w-3 text-blue-500" />}
                      {order.status === 3 && <XCircle className="mr-1 h-3 w-3 text-rose-500" />}
                      {order.status === 1 ? 'Processing' : order.status === 2 ? 'Completed' : 'Cancelled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                      <CreditCard className="h-4 w-4" />
                      {order.method_number === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer p-0" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/admin/ecommerce/orders/${order.id}`} className="flex w-full items-center px-2 py-1.5">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setOrderToDelete(order.id)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone and will remove all order items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOrderToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
