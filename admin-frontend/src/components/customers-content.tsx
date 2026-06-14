"use client"

import * as React from "react"
import { 
  MoreVertical, Plus, Search, Eye, ShoppingBag, 
  Trash, Pencil, Mail, Phone, MapPin
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
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
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

const customerSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerContact: z.string().optional(),
  customerAddress1: z.string().optional(),
  customerAddress2: z.string().optional(),
  customerTown: z.string().optional(),
  customerState: z.string().optional(),
  pin: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

export function CustomersContent() {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [customersData, setCustomersData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [formError, setFormError] = React.useState("")
  const [editingCustomer, setEditingCustomer] = React.useState<any>(null)
  const [customerToDelete, setCustomerToDelete] = React.useState<number | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const ITEMS_PER_PAGE = 10

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery.trim()) return customersData
    const q = searchQuery.toLowerCase()
    return customersData.filter(c => 
      (c.customer && c.customer.toLowerCase().includes(q)) || 
      (c.email && c.email.toLowerCase().includes(q))
    )
  }, [customersData, searchQuery])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1
  
  const paginatedCustomers = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCustomers, currentPage])

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerContact: "",
      customerAddress1: "",
      customerAddress2: "",
      customerTown: "",
      customerState: "",
      pin: "",
    }
  })

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/customers/data')
      if (res.ok) {
        const data = await res.json()
        setCustomersData(data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchCustomers()
  }, [])

  const deleteCustomer = async () => {
    if (!customerToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/customers/delete/${customerToDelete}`)
      if (res.ok) {
        setCustomerToDelete(null)
        fetchCustomers()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditSheet = (customer: any) => {
    setEditingCustomer(customer)
    form.reset({
      customerName: customer.customer || "",
      customerEmail: customer.email || "",
      customerContact: customer.phone || "",
      customerAddress1: customer.addressLine1 || "",
      customerAddress2: customer.addressLine2 || "",
      customerTown: customer.city || "",
      customerState: customer.state || "",
      pin: customer.zipCode || "",
    })
    setSheetOpen(true)
  }

  const openAddSheet = () => {
    setEditingCustomer(null)
    form.reset({
      customerName: "",
      customerEmail: "",
      customerContact: "",
      customerAddress1: "",
      customerAddress2: "",
      customerTown: "",
      customerState: "",
      pin: "",
    })
    setSheetOpen(true)
  }

  const onSubmit = async (data: CustomerFormValues) => {
    setFormError("");
    setIsSubmitting(true);
    try {
      const url = editingCustomer 
        ? `/api/admin/customers/update/${editingCustomer.id}`
        : '/api/admin/customers/save';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSheetOpen(false);
        fetchCustomers();
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || 'Failed to save customer. Please check your inputs.');
      }
    } catch (e) { 
      console.error(e);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Customers</h2>
          <p className="text-muted-foreground">
            Manage your store customers, view their order history, and update details.
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={
            <Button className="shrink-0" onClick={openAddSheet}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          } />
          <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full">
            <div className="p-6 pb-0">
              <SheetHeader className="mb-6">
                <SheetTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</SheetTitle>
                <SheetDescription>
                  {editingCustomer ? "Update customer account details." : "Create a new customer account manually."}
                </SheetDescription>
              </SheetHeader>
            </div>
            <form className="flex flex-col flex-1 overflow-y-auto p-6 pt-0 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {formError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 font-medium">
                  {formError}
                </div>
              )}
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Basic Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Name *</Label>
                  <Input id="customer-name" {...form.register("customerName")} placeholder="John Doe" />
                  {form.formState.errors.customerName && <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email *</Label>
                  <Input id="customer-email" {...form.register("customerEmail")} placeholder="john.doe@example.com" />
                  {form.formState.errors.customerEmail && <p className="text-sm text-destructive">{form.formState.errors.customerEmail.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-contact">Mobile</Label>
                  <Input id="customer-contact" {...form.register("customerContact")} placeholder="+1 (234) 567-890" />
                </div>
              </div>

              <div className="border-t my-4"></div>

              {/* Shipping Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Shipping Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="address-1">Address Line 1</Label>
                  <Input id="address-1" {...form.register("customerAddress1")} placeholder="45 Roker Terrace" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-2">Address Line 2</Label>
                  <Input id="address-2" {...form.register("customerAddress2")} placeholder="Suite, Apartment, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="town">Town / City</Label>
                    <Input id="town" {...form.register("customerTown")} placeholder="New York" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" {...form.register("customerState")} placeholder="NY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postal Code</Label>
                    <Input id="postcode" {...form.register("pin")} placeholder="10001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select>
                      <SelectTrigger id="country" className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Billing Toggle */}
              <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between border">
                <div className="space-y-0.5">
                  <Label htmlFor="billing-toggle" className="text-base">Use as billing address?</Label>
                  <p className="text-xs text-muted-foreground">Toggle if shipping and billing match.</p>
                </div>
                <Switch id="billing-toggle" defaultChecked />
              </div>

              {/* Actions */}
              <div className="pt-6 mt-auto border-t flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSheetOpen(false)} disabled={isSubmitting}>Discard</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </div>
                  ) : (editingCustomer ? "Save Changes" : "Add Customer")}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center p-4 border-b gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search customers by name, email..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2 sm:ml-auto">
            <Button variant="outline">Export CSV</Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Customer</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={6} rows={5} />
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={customer.image} />
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">{customer.customer?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold">{customer.customer}</span>
                        <span className="text-sm text-muted-foreground">{customer.email}</span>
                        {customer.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">CUST-{customer.customer_id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {customer.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{customer.order}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">{customer.total_spent}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer p-0">
                          <Link href={`/admin/ecommerce/customers/${customer.id}`} className="flex w-full items-center px-2 py-1.5">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEditSheet(customer)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Mail className="mr-2 h-4 w-4" /> Email Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => setCustomerToDelete(customer.id)}>
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
        
        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                // simple windowing for pagination ellipsis
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === page}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(page) }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
              All associated addresses and orders will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setCustomerToDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={deleteCustomer} disabled={isDeleting}>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </div>
              ) : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
