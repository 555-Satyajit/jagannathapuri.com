"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreVertical, Plus, Search, Pencil, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
} from "@/components/ui/sheet"


import { Toaster, toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AttributesContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/ecommerce/attributes/data');
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
    setName("");
    setDescription("");
    setSheetOpen(true);
  };

  const openEdit = (attr: any) => {
    setEditId(attr.id);
    setName(attr.name);
    setDescription(attr.description || "");
    setSheetOpen(true);
  };

  const onSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/ecommerce/attributes/update/${editId}` : '/api/admin/ecommerce/attributes/save';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(editId ? "Attribute updated" : "Attribute added");
        if (editId) {
          setData(prev => prev.map(a => a.id === editId ? result.data : a));
        } else {
          setData(prev => [result.data, ...prev]);
        }
        setSheetOpen(false);
      } else {
        toast.error(result.error || "Failed to save attribute");
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
      const res = await fetch(`/api/admin/ecommerce/attributes/delete/${id}`);
      const result = await res.json();
      if (result.success) {
        toast.success("Attribute deleted");
        setData(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error(result.error || "Failed to delete attribute");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredData = data.filter(attr => attr.name?.toLowerCase().includes(searchQuery.toLowerCase()));
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
              This action cannot be undone. This will permanently delete the attribute.
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
          <h2 className="text-2xl font-bold tracking-tight">Attributes</h2>
          <p className="text-muted-foreground">Manage product specification attributes</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Attribute
          </Button>
          <SheetContent className="sm:max-w-[500px] flex flex-col h-[100dvh] p-0">
            <div className="p-6 pb-0 shrink-0">
              <SheetHeader className="mb-6">
                <SheetTitle>{editId ? "Edit Attribute" : "Add Attribute"}</SheetTitle>
                <SheetDescription>
                  {editId ? "Update the specification attribute." : "Create a new specification attribute to link to your products."}
                </SheetDescription>
              </SheetHeader>
            </div>
            
            <form className="flex flex-col flex-1 overflow-y-auto p-6 pt-0 space-y-6">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Name</Label>
                  <Input id="title" placeholder="Enter attribute name (e.g. Size)" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter description" 
                    rows={4} 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 mt-auto border-t">
                <Button type="button" onClick={onSave} disabled={isSaving}>{isSaving ? "Saving..." : (editId ? "Save Changes" : "Add Attribute")}</Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isSaving}>Discard</Button>
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
              placeholder="Search attributes..." 
              className="pl-9 w-full bg-background"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button variant="outline" size="sm">Export</Button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-medium">{attr.name}</TableCell>
                  <TableCell className="text-muted-foreground">{attr.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(attr)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(attr.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No attributes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredData.length} attributes</div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
