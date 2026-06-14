"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { MoreVertical, Plus, Search, Pencil, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/components/ui/sheet"

export function CouponsContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState("Percentage");
  const [amount, setAmount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [status, setStatus] = useState("Active");

  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/ecommerce/coupons/data');
        const result = await response.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setCode("");
    setType("Percentage");
    setAmount("");
    setExpiry("");
    setUsageLimit("");
    setPerUserLimit("");
    setStatus("Active");
    setSheetOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setAmount(coupon.amount.toString());
    setExpiry(coupon.expiry || "");
    setUsageLimit(coupon.usage_limit ? coupon.usage_limit.toString() : "");
    setPerUserLimit(coupon.per_user_limit ? coupon.per_user_limit.toString() : "");
    setStatus(coupon.status);
    setSheetOpen(true);
  };

  const onSave = async () => {
    if (!code.trim() || !amount.trim()) return toast.error("Code and Amount are required");
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/ecommerce/coupons/update/${editId}` : '/api/admin/ecommerce/coupons/save';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          type, 
          amount, 
          expiry, 
          usage_limit: usageLimit, 
          per_user_limit: perUserLimit, 
          status 
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(editId ? "Coupon updated" : "Coupon added");
        
        // Refetch to get formatted dates consistently
        const response = await fetch('/api/admin/ecommerce/coupons/data');
        const newResult = await response.json();
        if (newResult.data) {
          setData(newResult.data);
        }
        
        setSheetOpen(false);
      } else {
        toast.error(result.error || "Failed to save coupon");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/ecommerce/coupons/delete/${id}`);
      const result = await res.json();
      if (result.success) {
        toast.success("Coupon deleted");
        setData(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(result.error || "Failed to delete coupon");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const predictedNewStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setData(prev => prev.map(p => p.id === id ? { ...p, status: predictedNewStatus } : p));
    
    try {
      const res = await fetch(`/api/admin/ecommerce/coupons/toggle-status/${id}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        if (result.data.status !== predictedNewStatus) {
           setData(prev => prev.map(p => p.id === id ? { ...p, status: result.data.status } : p));
        }
      } else {
        setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
        toast.error(result.error || "Failed to update status");
      }
    } catch (err) {
      setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
      toast.error("An error occurred");
    }
  };

  const filteredData = data.filter(c => c.code?.toLowerCase().includes(searchQuery.toLowerCase()));
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
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the coupon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && confirmDelete(deleteId)} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">Manage discount codes and promotional offers</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Coupon
          </Button>
          <SheetContent className="sm:max-w-[500px] flex flex-col h-[100dvh] p-0">
            <div className="p-6 pb-0 shrink-0">
              <SheetHeader className="mb-6">
                <SheetTitle>{editId ? "Edit Coupon" : "Add New Coupon"}</SheetTitle>
                <SheetDescription>
                  {editId ? "Update the promotional discount code." : "Create a new promotional discount code for your store."}
                </SheetDescription>
              </SheetHeader>
            </div>
            
            <form className="flex flex-col flex-1 overflow-y-auto p-6 pt-0 space-y-6">
              <div className="space-y-4">
                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" placeholder="e.g. SUMMER20" required value={code} onChange={e => setCode(e.target.value)} />
                </div>
                
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v || "Percentage")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                      <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="e.g. 20" required value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                {/* Expiry */}
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usage-limit">Max Usage Limit</Label>
                    <Input id="usage-limit" type="number" placeholder="e.g. 100" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-limit">Limit Per User</Label>
                    <Input id="user-limit" type="number" placeholder="e.g. 1" value={perUserLimit} onChange={e => setPerUserLimit(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leave limits empty for unlimited uses.</p>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v || "Active")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              
              <div className="flex gap-3 pt-6 mt-auto border-t">
                <Button type="button" onClick={onSave} disabled={isSaving}>{isSaving ? "Saving..." : (editId ? "Save Changes" : "Save Coupon")}</Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isSaving}>Cancel</Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Table Card */}
      <div className="border rounded-xl bg-card overflow-hidden flex flex-col shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search coupons..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 whitespace-nowrap">
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Used Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-semibold text-primary">{coupon.code}</TableCell>
                  <TableCell>{coupon.type}</TableCell>
                  <TableCell>{coupon.amount}</TableCell>
                  <TableCell>{coupon.expiry || "No Expiry"}</TableCell>
                  <TableCell className="text-muted-foreground">{coupon.usage_limit || "Unlimited"}</TableCell>
                  <TableCell>{coupon.used_count || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={coupon.status === "Active" ? "default" : "secondary"}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${coupon.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
                      onClick={() => toggleStatus(coupon.id, coupon.status)}
                    >
                      {coupon.status}
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
                        <DropdownMenuItem onClick={() => openEdit(coupon)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(coupon.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No coupons found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredData.length} coupons</div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm">{currentPage} / {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
