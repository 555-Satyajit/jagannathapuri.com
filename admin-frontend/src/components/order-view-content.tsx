"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, MapPin, Phone, Mail, User,
  CheckCircle2, XCircle, Package, CreditCard,
  Calendar, Download, ChevronDown, Receipt, Truck
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function OrderViewContent({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/ecommerce/orders/view/${orderId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.order)
      } else {
        toast.error("Failed to load order details")
      }
    } catch (e) {
      toast.error("An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchOrder()
  }, [orderId])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })
  }

  const handleUpdateStatus = async (type: 'status' | 'paymentStatus', value: number) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/ecommerce/orders/update-status/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: value })
      })
      if (res.ok) {
        toast.success(`Order updated successfully`)
        fetchOrder() // Refresh data
      } else {
        toast.error("Failed to update status")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
      </div>
    )
  }

  const subtotal = data.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  const tax = subtotal * 0.05; 
  const total = subtotal + tax + (data.shippingFee || 0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="mt-1 rounded-full shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Order #{data.orderNumber}
              </h1>
              <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold ${
                data.status === 2 ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' : 
                data.status === 1 ? 'border-blue-500 text-blue-600 bg-blue-500/10' : 
                'border-rose-500 text-rose-600 bg-rose-500/10'
              }`}>
                {data.status === 1 ? 'Processing' : data.status === 2 ? 'Completed' : 'Cancelled'}
              </Badge>
              <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold ${
                data.paymentStatus === 1 ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' : 
                'border-amber-500 text-amber-600 bg-amber-500/10'
              }`}>
                {data.paymentStatus === 1 ? 'Paid' : data.paymentStatus === 2 ? 'Pending' : data.paymentStatus === 3 ? 'Failed' : 'Refunded'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(data.date).toLocaleString()}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                {data.paymentMethod || 'COD'} ({data.methodNumber || 'N/A'})
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.open(`/admin/ecommerce/orders/invoice/${orderId}`, '_blank')}>
            <Download className="mr-2 h-4 w-4" /> Export Invoice
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "default" })} disabled={isUpdating}>
              Update Status <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Order Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleUpdateStatus('status', 1)} className="cursor-pointer">
                <Package className="mr-2 h-4 w-4 text-blue-500" /> Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus('status', 2)} className="cursor-pointer">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus('status', 3)} className="cursor-pointer text-destructive focus:text-destructive">
                <XCircle className="mr-2 h-4 w-4 text-rose-500" /> Cancelled
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleUpdateStatus('paymentStatus', 1)} className="cursor-pointer">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus('paymentStatus', 2)} className="cursor-pointer">
                <Receipt className="mr-2 h-4 w-4 text-amber-500" /> Mark as Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Ordered Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 py-4 w-full">Product</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Price</TableHead>
                      <TableHead className="text-center whitespace-nowrap px-4">Qty</TableHead>
                      <TableHead className="text-right pr-6 whitespace-nowrap">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                              {item.product?.images?.[0] ? (
                                <img src={`/uploads/${item.product.images[0]}`} alt="Product" className="object-cover h-full w-full" />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[400px] xl:max-w-[500px]">
                              <span className="font-semibold line-clamp-2 break-words leading-snug">{item.product?.product_name || 'Unknown Product'}</span>
                              {item.variant_name && <span className="text-sm text-muted-foreground mt-1">Variant: {item.variant_name}</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col bg-muted/10 p-6 border-t">
              <div className="w-full sm:w-1/2 ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span className="font-medium">{formatCurrency(data.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax (5%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between pt-4 mt-4 border-t">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Customer details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.customer ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border shadow-sm">
                    <AvatarImage src={data.customer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {data.customer.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">{data.customer.fullName}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      {data.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      {data.customer.phone || <span className="italic opacity-50">Not provided</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Guest Checkout or Customer Deleted</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Shipping address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.shippingAddress ? (
                <div className="flex flex-col gap-1.5 text-sm">
                  <p className="font-medium text-base mb-1">{data.customer?.fullName}</p>
                  <p className="text-muted-foreground">{data.shippingAddress.addressLine1}</p>
                  {data.shippingAddress.addressLine2 && <p className="text-muted-foreground">{data.shippingAddress.addressLine2}</p>}
                  <p className="text-muted-foreground">{data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.zipCode}</p>
                  <p className="text-muted-foreground">{data.shippingAddress.country}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {data.shippingAddress.phone || <span className="italic opacity-50">Not provided</span>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No shipping address provided</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Billing address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {data.billingAddress ? (
                <div className="flex flex-col gap-1.5 text-sm">
                  <p className="font-medium text-base mb-1">{data.customer?.fullName}</p>
                  <p className="text-muted-foreground">{data.billingAddress.addressLine1}</p>
                  {data.billingAddress.addressLine2 && <p className="text-muted-foreground">{data.billingAddress.addressLine2}</p>}
                  <p className="text-muted-foreground">{data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.zipCode}</p>
                  <p className="text-muted-foreground">{data.billingAddress.country}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {data.billingAddress.phone || <span className="italic opacity-50">Not provided</span>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Same as shipping address</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
