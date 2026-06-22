"use client"

import * as React from "react"
import Link from "next/link"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Plus, Search, MoreHorizontal, Filter, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function LibraryManagementContent() {
  const [categories, setCategories] = React.useState<any[]>([])
  const [articles, setArticles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  // Category Form State
  const [catName, setCatName] = React.useState("")
  const [catDesc, setCatDesc] = React.useState("")
  const [catStatus, setCatStatus] = React.useState("Active")
  const [catShowOnHome, setCatShowOnHome] = React.useState(false)
  const [catMetaTitle, setCatMetaTitle] = React.useState("")
  const [catMetaDesc, setCatMetaDesc] = React.useState("")
  const [catMetaKeys, setCatMetaKeys] = React.useState("")
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, artRes] = await Promise.all([
        fetch('/api/admin/library/categories/data'),
        fetch('/api/admin/library/content/data')
      ])
      const catJson = await catRes.json()
      const artJson = await artRes.json()
      if (catJson.data) setCategories(catJson.data)
      if (artJson.data) setArticles(artJson.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const handleSaveCategory = async () => {
    try {
      const formData = new FormData()
      formData.append('name', catName)
      formData.append('description', catDesc)
      formData.append('status', catStatus)
      formData.append('show_on_home', catShowOnHome.toString())
      formData.append('meta_title', catMetaTitle)
      formData.append('meta_description', catMetaDesc)
      formData.append('meta_keywords', catMetaKeys)

      const res = await fetch('/api/admin/library/categories/save', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setIsSheetOpen(false)
        fetchData()
        // Reset form
        setCatName(""); setCatDesc(""); setCatStatus("Active"); setCatShowOnHome(false);
        setCatMetaTitle(""); setCatMetaDesc(""); setCatMetaKeys("");
      }
    } catch (err) {
      console.error("Failed to save category:", err)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/admin/library/categories/delete/${id}`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`/api/admin/library/content/delete/${id}`)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const categoriesColumns: ColumnDef<any>[] = [
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
      cell: (item) => <Badge variant="secondary">{item._count?.contents || 0}</Badge>,
    },
    {
      header: "Home",
      className: "text-center",
      cell: (item) => item.show_on_home ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={item.status === "Active" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none" : ""}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>} />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => alert('Edit is coming soon')}>Edit Category</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCategory(item.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const articlesColumns: ColumnDef<any>[] = [
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
      cell: (item) => <span title={item.title}>{item.title}</span>,
    },
    {
      header: "Category",
      cell: (item) => item.categories?.map((c: any) => c.name).join(', ') || 'Uncategorized',
    },
    {
      header: "Tags",
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.tags?.slice(0, 3).map((tag: any) => (
            <Badge key={tag.id} variant="outline" className="text-[10px] px-1 py-0">{tag.name}</Badge>
          ))}
          {item.tags?.length > 3 && <Badge variant="outline" className="text-[10px] px-1 py-0">+{item.tags.length - 3}</Badge>}
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
      cell: (item) => (
        <Badge 
          variant={item.status === "Active" ? "default" : "secondary"}
          className={item.status === "Active" ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none" : ""}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>} />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit Article</DropdownMenuItem>
            <DropdownMenuItem>View on Frontend</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteArticle(item.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

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
                
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                        <Input id="cat-name" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Pooja Methods" />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="cat-desc">Description</Label>
                        <Textarea id="cat-desc" value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="Brief description..." rows={3} />
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
                        <Select value={catStatus} onValueChange={setCatStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
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
                        <Switch checked={catShowOnHome} onCheckedChange={setCatShowOnHome} />
                      </div>

                      <div className="border-t pt-4 mt-2 grid gap-4">
                        <h4 className="text-sm font-medium">SEO & Meta Tags</h4>
                        
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="meta-title">Meta Title</Label>
                            <span className="text-[10px] text-muted-foreground">{catMetaTitle.length} / 60</span>
                          </div>
                          <Input id="meta-title" value={catMetaTitle} onChange={e => setCatMetaTitle(e.target.value)} placeholder="SEO Title" />
                        </div>
                        
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="meta-desc">Meta Description</Label>
                            <span className="text-[10px] text-muted-foreground">{catMetaDesc.length} / 160</span>
                          </div>
                          <Textarea id="meta-desc" value={catMetaDesc} onChange={e => setCatMetaDesc(e.target.value)} placeholder="SEO Description" rows={2} />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="meta-keys">Meta Keywords</Label>
                          <Input id="meta-keys" value={catMetaKeys} onChange={e => setCatMetaKeys(e.target.value)} placeholder="keyword1, keyword2" />
                        </div>
                      </div>
                    </div>
                    
                    <SheetFooter className="sticky bottom-0 bg-background pt-2 border-t mt-auto">
                      <SheetClose render={<Button variant="outline" className="w-full sm:w-auto">Cancel</Button>} />
                      <Button onClick={handleSaveCategory} className="w-full sm:w-auto">Save Category</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={categoriesColumns} 
                data={categories} 
                keyExtractor={(item) => item.id} 
                isLoading={loading}
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
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
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
                data={articles} 
                keyExtractor={(item) => item.id} 
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
