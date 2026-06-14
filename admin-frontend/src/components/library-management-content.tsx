"use client"

import * as React from "react"
import Link from "next/link"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Plus, Search, MoreHorizontal, Filter, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Removed direct Table imports, using DataTable instead
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
// Pagination handled inside DataTable

// Dummy Data
const dummyCategories = [
  { id: 1, name: "Pooja Methods", slug: "pooja-methods", contents: 12, isHome: true, status: "Active" },
  { id: 2, name: "Vedic Chants", slug: "vedic-chants", contents: 8, isHome: true, status: "Active" },
  { id: 3, name: "Temple History", slug: "temple-history", contents: 5, isHome: false, status: "Active" },
  { id: 4, name: "Daily Rituals", slug: "daily-rituals", contents: 15, isHome: true, status: "Active" },
  { id: 5, name: "Festivals Guide", slug: "festivals-guide", contents: 24, isHome: false, status: "Inactive" },
]

const dummyArticles = [
  { id: 101, title: "How to perform morning Aarti", category: "Daily Rituals", tags: ["Aarti", "Morning"], author: "Jagannathapuri Team", status: "Active" },
  { id: 102, title: "Significance of Ekadashi Fasting", category: "Festivals Guide", tags: ["Fasting", "Ekadashi"], author: "Swami Vedant", status: "Active" },
  { id: 103, title: "Daily Mantra Chants for Peace", category: "Vedic Chants", tags: ["Mantra", "Peace"], author: "Jagannathapuri Team", status: "Active" },
  { id: 104, title: "Understanding the Panchang", category: "Pooja Methods", tags: ["Astrology", "Calendar"], author: "Pundit Ram", status: "Draft" },
  { id: 105, title: "Preparing for Diwali Pooja", category: "Festivals Guide", tags: ["Diwali", "Pooja"], author: "Jagannathapuri Team", status: "Active" },
]

const categoriesColumns: ColumnDef<typeof dummyCategories[0]>[] = [
  {
    header: "Image",
    className: "w-[80px]",
    cell: () => (
      <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
      </div>
    ),
  },
  {
    header: "Name",
    accessorKey: "name",
    className: "font-medium",
  },
  {
    header: "Slug",
    accessorKey: "slug",
    className: "text-muted-foreground",
  },
  {
    header: "Contents",
    className: "text-center",
    cell: (cat) => <Badge variant="secondary">{cat.contents}</Badge>,
  },
  {
    header: "Home",
    className: "text-center",
    cell: (cat) => cat.isHome ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
    ) : (
      <XCircle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
    ),
  },
  {
    header: "Status",
    cell: (cat) => (
      <Badge 
        variant={cat.status === "Active" ? "default" : "secondary"}
        className={cat.status === "Active" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none" : ""}
      >
        {cat.status}
      </Badge>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>} />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Category</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const articlesColumns: ColumnDef<typeof dummyArticles[0]>[] = [
  {
    header: "Banner",
    className: "w-[80px]",
    cell: () => (
      <div className="h-10 w-14 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
      </div>
    ),
  },
  {
    header: "Title",
    className: "font-medium max-w-[200px] truncate",
    cell: (art) => <span title={art.title}>{art.title}</span>,
  },
  {
    header: "Category",
    accessorKey: "category",
  },
  {
    header: "Tags",
    cell: (art) => (
      <div className="flex flex-wrap gap-1">
        {art.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">{tag}</Badge>
        ))}
      </div>
    ),
  },
  {
    header: "Author",
    accessorKey: "author",
    className: "text-muted-foreground text-sm",
  },
  {
    header: "Status",
    cell: (art) => (
      <Badge 
        variant={art.status === "Active" ? "default" : "secondary"}
        className={art.status === "Active" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none" : ""}
      >
        {art.status}
      </Badge>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>} />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Article</DropdownMenuItem>
          <DropdownMenuItem>View on Frontend</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function LibraryManagementContent() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize religious content, articles, and categories.
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 mb-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="articles">Articles / Content</TabsTrigger>
        </TabsList>

        {/* ========================================================
            CATEGORIES TAB
        ======================================================== */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search categories..."
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                <Sheet>
                  <SheetTrigger render={<Button className="w-full sm:w-auto gap-2"><Plus className="h-4 w-4" /> Add Category</Button>} />
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Add Category</SheetTitle>
                      <SheetDescription>
                        Create a new category for the library. Click save when you're done.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex flex-col gap-5 px-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input id="cat-name" placeholder="e.g. Pooja Methods" />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="cat-desc">Description</Label>
                        <Textarea id="cat-desc" placeholder="Brief description..." rows={3} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Cover Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select defaultValue="active">
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <Label className="text-base">Show on Home Page</Label>
                          <p className="text-sm text-muted-foreground">
                            Display this category prominently on the frontend.
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="border-t pt-4 mt-2 grid gap-4">
                        <h4 className="text-sm font-medium">SEO & Meta Tags</h4>
                        
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="meta-title">Meta Title</Label>
                            <span className="text-[10px] text-muted-foreground">0 / 60</span>
                          </div>
                          <Input id="meta-title" placeholder="SEO Title" />
                        </div>
                        
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="meta-desc">Meta Description</Label>
                            <span className="text-[10px] text-muted-foreground">0 / 160</span>
                          </div>
                          <Textarea id="meta-desc" placeholder="SEO Description" rows={2} />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="meta-keys">Meta Keywords</Label>
                          <Input id="meta-keys" placeholder="keyword1, keyword2" />
                        </div>
                      </div>
                    </div>
                    
                    <SheetFooter className="sticky bottom-0 bg-background pt-2 border-t mt-auto">
                      <SheetClose render={<Button variant="outline" className="w-full sm:w-auto">Cancel</Button>} />
                      <Button type="submit" className="w-full sm:w-auto">Save Category</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={categoriesColumns} 
                data={dummyCategories} 
                keyExtractor={(item) => item.id} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================
            ARTICLES / CONTENT TAB
        ======================================================== */}
        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="pooja">Pooja Methods</SelectItem>
                      <SelectItem value="festivals">Festivals Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Link href="/admin/library/content/add">
                  <Button className="w-full sm:w-auto gap-2">
                    <Plus className="h-4 w-4" /> Add Article
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={articlesColumns} 
                data={dummyArticles} 
                keyExtractor={(item) => item.id} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
