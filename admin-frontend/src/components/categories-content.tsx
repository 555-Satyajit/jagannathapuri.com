"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { toast, Toaster } from "sonner"
import { Plus, MoreVertical, Edit, Trash, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export function CategoriesContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/ecommerce/categories/data');
        const result = await response.json();
        if (result.data) {
          setData(result.data.map((item: any) => ({ 
            id: item.id, 
            title: item.categories, 
            slug: item.slug, 
            description: item.category_detail,
            parent: item.parentId,
            meta_title: item.meta_title,
            meta_desc: item.meta_description,
            meta_keywords: item.meta_keywords,
            products: item.total_products, 
            earning: 0, 
            status: item.status === 'Publish' || item.status === 'Active' ? 'Active' : 'Inactive', 
            image: item.cat_image 
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

  const [sheetOpen, setSheetOpen] = React.useState(false);

  
  const [formData, setFormData] = useState<any>({
    categoryTitle: '',
    slug: '',
    parentCategory: '',
    description: '',
    status: 'Publish',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    imageFile: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      categoryTitle: '',
      slug: '',
      parentCategory: '',
      description: '',
      status: 'Publish',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      imageFile: null
    });
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleEdit = (category: any) => {
    setFormData({
      categoryTitle: category.title || '',
      slug: category.slug || '',
      parentCategory: category.parent || '',
      description: category.description || '',
      status: category.status || 'Publish',
      meta_title: category.meta_title || '',
      meta_description: category.meta_desc || '',
      meta_keywords: category.meta_keywords || '',
      imageFile: null
    });
    setIsEditing(true);
    setSelectedId(category.id);
    setSheetOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/ecommerce/categories/delete/${id}`);
      const result = await res.json();
      if (result.success) {
        toast.success("Category deleted successfully");
        setData(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    // Optimistic Update
    const predictedNewStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setData(prev => prev.map(p => p.id === id ? { ...p, status: predictedNewStatus } : p));
    
    try {
      const response = await fetch(`/api/admin/ecommerce/categories/toggle-status/${id}`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        const actualStatus = result.data.status === 'Publish' || result.data.status === 'Active' ? 'Active' : 'Inactive';
        if (actualStatus !== predictedNewStatus) {
           setData(prev => prev.map(p => p.id === id ? { ...p, status: actualStatus } : p));
        }
      } else {
        setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
        toast.error("Failed to update status");
      }
    } catch (error) {
      setData(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus } : p));
      toast.error("An error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile' && formData[key] !== null) {
          fd.append(key, formData[key]);
        }
      });
      if (formData.imageFile) {
        fd.append('categoryImage', formData.imageFile);
      }

      const url = isEditing 
        ? `/api/admin/ecommerce/categories/update/${selectedId}`
        : '/api/admin/ecommerce/categories/save';

      const res = await fetch(url, {
        method: 'POST',
        body: fd
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
        setSheetOpen(false);
        resetForm();
        // Trigger a re-fetch
        const fetchRes = await fetch('/api/admin/ecommerce/categories/data');
        const fetchResult = await fetchRes.json();
        if (fetchResult.data) {
          setData(fetchResult.data.map((item: any) => ({ 
            id: item.id, 
            title: item.categories, 
            slug: item.slug, 
            description: item.category_detail,
            parent: item.parentId,
            meta_title: item.meta_title,
            meta_desc: item.meta_description,
            meta_keywords: item.meta_keywords,
            products: item.total_products, 
            earning: 0, 
            status: item.status, 
            image: item.cat_image 
          })));
        }
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch (err) {
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
      <Toaster position="top-center" richColors />
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
              This action cannot be undone. This will permanently delete the category and remove its data from our servers.
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
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">eCommerce / Categories</h2>
          <p className="text-muted-foreground">Manage your product categories and hierarchy.</p>
        </div>
        
        {/* Add Category Slide-out (Sheet) */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={<Button className="gap-2" onClick={resetForm}><Plus className="h-4 w-4" /> Add Category</Button>}
          />
          <SheetContent className="sm:max-w-[500px] flex flex-col h-[100dvh] p-0">
            <div className="p-6 pb-0 shrink-0">
              <SheetHeader className="mb-6">
                <SheetTitle>{isEditing ? "Edit Category" : "Add Category"}</SheetTitle>
                <SheetDescription>
                  Create a new category. Fill in the required details and click save when you're done.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-0">
              <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter category title" value={formData.categoryTitle} onChange={e => setFormData({...formData, categoryTitle: e.target.value})} required />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="enter-category-slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Attachment</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors relative overflow-hidden">
                      {formData.imageFile ? (
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                          <img src={URL.createObjectURL(formData.imageFile)} alt="Preview" className="w-full h-full object-contain rounded-md" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                            <p className="text-white text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Change Image</p>
                          </div>
                        </div>
                      ) : (selectedId && data.find(c => c.id === selectedId)?.image) ? (
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                          <img 
                            src={`/uploads/${data.find(c => c.id === selectedId)?.image}`} 
                            onError={(e) => { 
                              if (!e.currentTarget.dataset.retried) {
                                e.currentTarget.dataset.retried = 'true';
                                e.currentTarget.src = `/admin-assets/img/ecommerce-images/${data.find(c => c.id === selectedId)?.image}`;
                              } else {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png';
                              }
                            }} 
                            alt="Current" 
                            className="w-full h-full object-contain rounded-md" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                            <p className="text-white text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <p className="text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                      )}
                      <input id="dropzone-file" type="file" className="hidden" onChange={e => setFormData({...formData, imageFile: e.target.files ? e.target.files[0] : null})} accept="image/*" />
                    </label>
                  </div>
                </div>

                {/* Parent Category */}
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Category</Label>
                  <Select value={formData.parentCategory ? String(formData.parentCategory) : "none"} onValueChange={(v) => setFormData({...formData, parentCategory: v === "none" ? "" : v})}>
                    <SelectTrigger id="parent" className="w-full">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Category)</SelectItem>
                      {data.filter(c => c.id !== selectedId).map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description Textarea Placeholder */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Write category description..." className="min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Publish">Publish</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-border mt-6">
                  <h4 className="text-sm font-semibold mb-4">SEO & Meta Tags</h4>
                  
                  {/* Meta Title */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input id="meta-title" placeholder="SEO Title" value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Strength: Needs improvement</span>
                      <span>0 / 60 chars</span>
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="meta-desc">Meta Description</Label>
                    <Textarea id="meta-desc" placeholder="SEO Description" className="min-h-[80px]" value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Strength: Needs improvement</span>
                      <span>0 / 160 chars</span>
                    </div>
                  </div>

                  {/* Meta Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="meta-keywords">Meta Keywords</Label>
                    <Input id="meta-keywords" placeholder="keyword1, keyword2" value={formData.meta_keywords} onChange={e => setFormData({...formData, meta_keywords: e.target.value})} />
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-8 border-t pt-4">
                <SheetClose render={<Button variant="outline">Discard</Button>} />
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : (isEditing ? "Save Changes" : "Add Category")}</Button>
              </SheetFooter>
            </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Categories Table */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Earning</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded bg-muted flex items-center justify-center overflow-hidden border">
                      {cat.image ? (
                        <img 
                          src={`/uploads/${cat.image}`} 
                          onError={(e) => { 
                            if (!e.currentTarget.dataset.retried) {
                              e.currentTarget.dataset.retried = 'true';
                              e.currentTarget.src = `/admin-assets/img/ecommerce-images/${cat.image}`;
                            } else {
                              e.currentTarget.onerror = null; // Prevent infinite loop
                              e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png'; // Fallback to a remote placeholder that exists
                            }
                          }} 
                          alt={cat.title} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                    {cat.title}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                <TableCell className="text-right font-medium">{cat.products}</TableCell>
                <TableCell className="text-right">₹{cat.earning.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={cat.status === "Active" ? "default" : "secondary"}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${cat.status === "Active" ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 border-none" : ""}`}
                    onClick={() => toggleStatus(cat.id, cat.status)}
                  >
                    {cat.status}
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
                      
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(cat)}>
                        <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10" onClick={() => handleDelete(cat.id)}>
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
          <div>
            Showing {data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} categories
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(p => p - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.ceil(data.length / itemsPerPage) }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < Math.ceil(data.length / itemsPerPage)) setCurrentPage(p => p + 1);
                  }}
                  className={currentPage === Math.ceil(data.length / itemsPerPage) || data.length === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
