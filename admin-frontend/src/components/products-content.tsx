"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { 
  Package, 
  CheckCircle2, 
  Tag, 
  AlertTriangle, 
  Plus, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash, 
  Search,
  Image as ImageIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


export function ProductsContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/ecommerce/products/data');
        const result = await response.json();
        if (result.data) {
          setData(result.data.map((item: any) => ({ 
            id: item.id, 
            name: item.product_name || item.name, 
            category: item.category?.categories || item.category?.name || item.category || 'Uncategorized', 
            stock: item.qty > 0 ? (item.qty <= (item.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock') : 'Out of Stock', 
            sku: item.sku, 
            price: item.price || item.regular_price, 
            qty: item.qty || item.quantity, 
            status: item.status === 1 || item.status === 'Published' || item.status === 'Active' ? 'Active' : 'Inactive', 
            image: item.image || item.product_images?.[0] || '',
            onSale: item.on_sale === 'true' || item.on_sale === true || item.on_sale === 1 || item.on_sale === '1'
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleStatus = async (id: number, currentStatus: string) => {
    // Optimistic Update
    const predictedNewStatusStr = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setData(prev => prev.map(p => p.id === id ? { ...p, status: predictedNewStatusStr } : p));
    
    try {
      const response = await fetch(`/api/admin/ecommerce/products/toggle-status/${id}`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        // Sync with actual server state just in case
        const actualNewStatusStr = result.data.status === 1 || result.data.status === 'Active' ? 'Active' : 'Inactive';
        if (actualNewStatusStr !== predictedNewStatusStr) {
           setData(prev => prev.map(p => p.id === id ? { ...p, status: actualNewStatusStr } : p));
        }
      } else {
        // Revert on failure
        setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
        toast.error("Failed to update status");
      }
    } catch (error) {
      // Revert on error
      setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
      toast.error("An error occurred");
    }
  };

  const confirmDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/ecommerce/products/delete/${id}`);
      const result = await res.json();
      if (result.success) {
        toast.success("Product deleted successfully");
        setData(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const filteredData = data.filter(prod => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!prod.name?.toLowerCase().includes(q) && !prod.sku?.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "All" && prod.status !== statusFilter) return false;
    if (categoryFilter !== "All" && prod.category !== categoryFilter) return false;
    if (stockFilter !== "All") {
      if (stockFilter === "In Stock" && prod.stock !== "In Stock") return false;
      if (stockFilter === "Low Stock" && prod.stock !== "Low Stock") return false;
      if (stockFilter === "Out of Stock" && prod.stock !== "Out of Stock") return false;
    }
    return true;
  });

  const uniqueCategories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));

  const totalProducts = data.length;
  const activeProducts = data.filter(p => p.status === 'Published').length;
  const onSaleProducts = data.filter(p => p.onSale).length;
  const lowStockProducts = data.filter(p => p.stock === 'Low Stock').length;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-[40px] w-[300px]" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Toaster position="top-center" richColors />
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the product and remove its data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && confirmDelete(deleteId)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">eCommerce / Product List</h2>
          <p className="text-muted-foreground">Manage your store's inventory and product details.</p>
        </div>
        <Button render={<Link href="/admin/ecommerce/products/add" />} nativeButton={false} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{data.length}</p>
              <p className="text-xs text-muted-foreground">All items</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Products</p>
              <p className="text-2xl font-bold">{activeProducts}</p>
              <p className="text-xs text-muted-foreground">Live on store</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">On Sale</p>
              <p className="text-2xl font-bold">{onSaleProducts}</p>
              <p className="text-xs text-muted-foreground">Special offers</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-destructive">{lowStockProducts}</p>
              <p className="text-xs text-muted-foreground">Items to restock</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v || "All"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v || "All"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {uniqueCategories.map(c => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v || "All"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stock</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Table */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3 max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
                    <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                      {prod.image ? (
                        <img src={`/uploads/${prod.image}`} alt={prod.name} className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <span className="line-clamp-2 leading-tight" title={prod.name}>{prod.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{prod.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      prod.stock === "In Stock" ? "bg-emerald-500" :
                      prod.stock === "Low Stock" ? "bg-amber-500" : "bg-destructive"
                    }`} />
                    <span className="whitespace-nowrap">{prod.stock}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{prod.sku}</TableCell>
                <TableCell className="text-right font-medium">₹{prod.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">{prod.qty}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={prod.status === "Active" ? "default" : "secondary"}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${prod.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
                    onClick={() => toggleStatus(prod.id, prod.status)}
                  >
                    {prod.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 cursor-pointer p-0" render={<Link href={`/admin/ecommerce/products/view/${prod.id}`} />} nativeButton={false}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer p-0" render={<Link href={`/admin/ecommerce/products/edit/${prod.id}`} />} nativeButton={false}>
                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(prod.id)} className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10">
                        <Trash className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} products</div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                  className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
