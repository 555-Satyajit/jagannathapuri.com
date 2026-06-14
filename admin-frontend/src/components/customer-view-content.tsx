"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Copy, Mail, Phone, MapPin, 
  ShoppingBag, Calendar, CheckCircle2, XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"

export function CustomerViewContent({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const ITEMS_PER_PAGE = 5

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/customers/view/${customerId}`)
        if (res.ok) {
          const json = await res.json()
          setData(json.customer)
        } else {
          toast.error("Failed to load customer details")
        }
      } catch (e) {
        toast.error("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [customerId])

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })
  }

  const paginatedOrders = React.useMemo(() => {
    if (!data?.orders) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [data, currentPage])

  const totalPages = data?.orders ? Math.ceil(data.orders.length / ITEMS_PER_PAGE) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">Customer Not Found</h2>
        <p className="text-muted-foreground mb-6">The customer you are looking for does not exist.</p>
        <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage src={data.avatar} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
              {data.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{data.fullName}</h2>
              <Badge variant={data.status === 'Active' ? 'default' : 'secondary'} className="px-2.5 py-0.5 text-xs font-semibold">
                {data.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Customer ID: #{data.id.toString().padStart(4, '0')}</span>
              <span>•</span>
              <span>Joined {new Date(data.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/50 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
                <h3 className="text-3xl font-bold text-emerald-600">{formatCurrency(data.stats.totalSpent)}</h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold">{data.stats.totalOrders}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Order Value</p>
                <h3 className="text-3xl font-bold">{formatCurrency(data.stats.avgOrderValue)}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Addresses */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{data.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(data.email, 'Email')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{data.phone || 'No phone number'}</span>
                </div>
                {data.phone && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(data.phone, 'Phone number')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.addresses && data.addresses.length > 0 ? (
                data.addresses.map((address: any) => (
                  <div key={address.id} className="p-4 border rounded-lg bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="font-semibold">{address.type}</Badge>
                      {address.isDefault && <Badge className="bg-emerald-500 hover:bg-emerald-600">Default</Badge>}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-muted-foreground border rounded-lg border-dashed">
                  No saved addresses found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {data.orders && data.orders.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Order</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order: any) => (
                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/admin/ecommerce/orders/${order.id}`)}>
                          <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={order.status === 1 ? 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/30' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30'}>
                              {order.status === 1 ? 'Processing' : 'Completed'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.paymentStatus === 1 ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4" /> Paid
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                                <XCircle className="h-4 w-4" /> Pending
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
                      <div>
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, data.orders.length)} of {data.orders.length} orders
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
              ) : (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                  <ShoppingBag className="h-12 w-12 text-muted/30 mb-4" />
                  <p className="font-medium text-lg text-foreground">No orders yet</p>
                  <p>This customer hasn't placed any orders.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
