"use client"

import * as React from "react"
import { Plus, Edit, Trash, Image as ImageIcon, Link as LinkIcon, Star, MoreVertical } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "./data-table"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast, Toaster } from "sonner"

// --- SCHEMAS ---
const heroSchema = z.object({
  header: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  order: z.any(),
  status: z.enum(["Active", "Inactive"]),
  image: z.any().optional(),
  mobileImage: z.any().optional(),
})
type HeroFormValues = z.infer<typeof heroSchema>

const promoSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  order: z.any(),
  status: z.enum(["Active", "Inactive"]),
})
type PromoFormValues = z.infer<typeof promoSchema>

const homeTabSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.string().min(1, "Category is required"),
  order: z.any(),
  status: z.enum(["Active", "Inactive"]),
})
type HomeTabFormValues = z.infer<typeof homeTabSchema>

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  phone: z.string().optional(),
  link: z.string().optional(),
  rating: z.any(),
  reviewsCount: z.any(),
  status: z.enum(["Active", "Inactive"]),
  image: z.any().optional(),
})
type ServiceFormValues = z.infer<typeof serviceSchema>

export function ManageHomeContent() {
  const [activeTab, setActiveTab] = React.useState("hero")
  const [isLoading, setIsLoading] = React.useState(true)

  const [heroes, setHeroes] = React.useState<any[]>([])
  const [promos, setPromos] = React.useState<any[]>([])
  const [homeTabs, setHomeTabs] = React.useState<any[]>([])
  const [services, setServices] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])

  // Sheet states
  const [isHeroOpen, setIsHeroOpen] = React.useState(false)
  const [editingHero, setEditingHero] = React.useState<any>(null)

  const [isPromoOpen, setIsPromoOpen] = React.useState(false)
  const [editingPromo, setEditingPromo] = React.useState<any>(null)

  const [isTabOpen, setIsTabOpen] = React.useState(false)
  const [editingTab, setEditingTab] = React.useState<any>(null)

  const [isServiceOpen, setIsServiceOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<any>(null)

  // Forms
  const heroForm = useForm<HeroFormValues>({ resolver: zodResolver(heroSchema), defaultValues: { status: "Active", order: 0 } })
  const promoForm = useForm<PromoFormValues>({ resolver: zodResolver(promoSchema), defaultValues: { status: "Active", order: 0 } })
  const tabForm = useForm<HomeTabFormValues>({ resolver: zodResolver(homeTabSchema), defaultValues: { status: "Active", order: 0 } })
  const serviceForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), defaultValues: { status: "Active", rating: 5, reviewsCount: 0 } })

  const getImageUrl = (path: string | null | undefined, type: 'hero' | 'services') => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let cleanPath = path;
    if (cleanPath.startsWith('/uploads/hero/')) cleanPath = cleanPath.replace('/uploads/hero/', '/uploads/');
    if (cleanPath.startsWith('/uploads/services/')) cleanPath = cleanPath.replace('/uploads/services/', '/uploads/');
    if (!cleanPath.startsWith('/')) cleanPath = `/uploads/${cleanPath}`;
    return `http://localhost:5000${cleanPath}`;
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [hRes, pRes, tRes, sRes, cRes] = await Promise.all([
        fetch('/api/admin/store/home/hero/data'),
        fetch('/api/admin/store/home/promo/data'),
        fetch('/api/admin/store/home/hometab/data'),
        fetch('/api/admin/store/home/service/data'),
        fetch('/api/admin/store/home/hometab/categories')
      ])
      
      const hData = await hRes.json()
      const pData = await pRes.json()
      const tData = await tRes.json()
      const sData = await sRes.json()
      const cData = await cRes.json()

      if (hData.success) setHeroes(hData.data)
      if (pData.success) setPromos(pData.data)
      if (tData.success) setHomeTabs(tData.data)
      if (sData.success) setServices(sData.data)
      if (cData.success) setCategories(cData.data)
    } catch (err) {
      toast.error('Failed to load manage home data')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // --- Handlers: Hero ---
  const handleHeroSubmit = async (data: HeroFormValues) => {
    try {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (key !== 'image' && key !== 'mobileImage' && data[key as keyof HeroFormValues] !== undefined) {
          formData.append(key, data[key as keyof HeroFormValues] as any)
        }
      })
      if (data.image && data.image.length > 0) formData.append('image', data.image[0])
      if (data.mobileImage && data.mobileImage.length > 0) formData.append('mobileImage', data.mobileImage[0])

      const url = editingHero ? `/api/admin/store/home/hero/update/${editingHero.id}` : '/api/admin/store/home/hero/save'
      const res = await fetch(url, { method: 'POST', body: formData })
      const result = await res.json()
      
      if (result.success) {
        toast.success(editingHero ? 'Hero updated' : 'Hero added')
        setIsHeroOpen(false)
        fetchData()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    } catch (err) {
      toast.error('Operation failed')
    }
  }

  const handleDeleteHero = async (id: number) => {
    if (!confirm('Are you sure?')) return
    const res = await fetch(`/api/admin/store/home/hero/delete/${id}`)
    const result = await res.json()
    if (result.success) {
      toast.success('Hero deleted')
      fetchData()
    }
  }

  const toggleHeroStatus = async (id: number) => {
    const res = await fetch(`/api/admin/store/home/hero/toggle-status/${id}`, { method: 'POST' })
    const result = await res.json()
    if (result.success) {
      toast.success('Status updated')
      fetchData()
    }
  }

  const openEditHero = (hero: any) => {
    setEditingHero(hero)
    heroForm.reset({
      header: hero.header || '',
      title: hero.title || '',
      description: hero.description || '',
      buttonText: hero.buttonText || '',
      buttonLink: hero.buttonLink || '',
      order: hero.order,
      status: hero.status,
    })
    setIsHeroOpen(true)
  }

  // --- Handlers: Promo ---
  const handlePromoSubmit = async (data: PromoFormValues) => {
    try {
      const url = editingPromo ? `/api/admin/store/home/promo/update/${editingPromo.id}` : '/api/admin/store/home/promo/save'
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast.success(editingPromo ? 'Promo updated' : 'Promo added')
        setIsPromoOpen(false)
        fetchData()
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Operation failed')
    }
  }

  const openEditPromo = (promo: any) => {
    setEditingPromo(promo)
    promoForm.reset({
      icon: promo.icon || '',
      title: promo.title,
      subtitle: promo.subtitle || '',
      order: promo.order,
      status: promo.status
    })
    setIsPromoOpen(true)
  }

  // --- Handlers: Tab ---
  const handleTabSubmit = async (data: HomeTabFormValues) => {
    try {
      const url = editingTab ? `/api/admin/store/home/hometab/update/${editingTab.id}` : '/api/admin/store/home/hometab/save'
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast.success(editingTab ? 'Tab updated' : 'Tab added')
        setIsTabOpen(false)
        fetchData()
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Operation failed')
    }
  }

  const openEditTab = (tab: any) => {
    setEditingTab(tab)
    tabForm.reset({
      title: tab.title,
      categoryId: tab.categoryId.toString(),
      order: tab.order,
      status: tab.status
    })
    setIsTabOpen(true)
  }

  // --- Handlers: Service ---
  const handleServiceSubmit = async (data: ServiceFormValues) => {
    try {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (key !== 'image' && data[key as keyof ServiceFormValues] !== undefined) {
          formData.append(key, data[key as keyof ServiceFormValues] as any)
        }
      })
      if (data.image && data.image.length > 0) formData.append('image', data.image[0])

      const url = editingService ? `/api/admin/store/home/service/update/${editingService.id}` : '/api/admin/store/home/service/save'
      const res = await fetch(url, { method: 'POST', body: formData })
      const result = await res.json()
      
      if (result.success) {
        toast.success(editingService ? 'Service updated' : 'Service added')
        setIsServiceOpen(false)
        fetchData()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    } catch (err) {
      toast.error('Operation failed')
    }
  }

  const openEditService = (service: any) => {
    setEditingService(service)
    serviceForm.reset({
      title: service.title,
      subtitle: service.subtitle || '',
      description: service.description || '',
      icon: service.icon || '',
      phone: service.phone || '',
      link: service.link || '',
      rating: service.rating,
      reviewsCount: service.reviewsCount,
      status: service.status
    })
    setIsServiceOpen(true)
  }


  // --- Columns ---
  const heroColumns = [
    {
      header: "Image",
      cell: (hero: any) => (
        hero.image ? <img src={getImageUrl(hero.image, 'hero')} alt={hero.title} className="h-12 w-20 object-cover rounded" /> 
        : <div className="h-12 w-20 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-4 w-4" /></div>
      )
    },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "order", header: "Order" },
    {
      header: "Status",
      cell: (hero: any) => (
        <Badge 
          className="cursor-pointer" 
          variant={hero.status === "Active" ? "default" : "secondary"}
          onClick={() => toggleHeroStatus(hero.id)}
        >
          {hero.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (hero: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/store/home/hero/${hero.id}`}>
                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => handleDeleteHero(hero.id)} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const promoColumns = [
    { accessorKey: "icon", header: "Icon" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "subtitle", header: "Subtitle" },
    { accessorKey: "order", header: "Order" },
    {
      header: "Status",
      cell: (promo: any) => (
        <Badge 
          className="cursor-pointer" 
          variant={promo.status === "Active" ? "default" : "secondary"}
          onClick={async () => {
            const res = await fetch(`/api/admin/store/home/promo/toggle-status/${promo.id}`, { method: 'POST' })
            if ((await res.json()).success) { toast.success('Status updated'); fetchData(); }
          }}
        >
          {promo.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (promo: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditPromo(promo)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                if(!confirm('Are you sure?')) return;
                const res = await fetch(`/api/admin/store/home/promo/delete/${promo.id}`)
                if ((await res.json()).success) { toast.success('Deleted'); fetchData() }
              }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const tabColumns = [
    { accessorKey: "title", header: "Tab Title" },
    { header: "Category", cell: (t: any) => t.category?.name || t.categoryId },
    { accessorKey: "order", header: "Order" },
    {
      header: "Status",
      cell: (tab: any) => (
        <Badge 
          className="cursor-pointer" 
          variant={tab.status === "Active" ? "default" : "secondary"}
          onClick={async () => {
            const res = await fetch(`/api/admin/store/home/hometab/toggle-status/${tab.id}`, { method: 'POST' })
            if ((await res.json()).success) { toast.success('Status updated'); fetchData(); }
          }}
        >
          {tab.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (tab: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditTab(tab)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                if(!confirm('Are you sure?')) return;
                const res = await fetch(`/api/admin/store/home/hometab/delete/${tab.id}`)
                if ((await res.json()).success) { toast.success('Deleted'); fetchData() }
              }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const serviceColumns = [
    {
      header: "Image",
      cell: (s: any) => (
        s.image ? <img src={getImageUrl(s.image, 'services')} alt={s.title} className="h-10 w-10 object-cover rounded" /> 
        : <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">{s.icon}</div>
      )
    },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "subtitle", header: "Subtitle" },
    {
      header: "Status",
      cell: (s: any) => (
        <Badge 
          className="cursor-pointer" 
          variant={s.status === "Active" ? "default" : "secondary"}
          onClick={async () => {
            const res = await fetch(`/api/admin/store/home/service/toggle-status/${s.id}`, { method: 'POST' })
            if ((await res.json()).success) { toast.success('Status updated'); fetchData(); }
          }}
        >
          {s.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (s: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/store/home/service/${s.id}`}>
                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={async () => {
                if(!confirm('Are you sure?')) return;
                const res = await fetch(`/api/admin/store/home/service/delete/${s.id}`)
                if ((await res.json()).success) { toast.success('Deleted'); fetchData() }
              }} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Toaster position="top-center" richColors />
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Store Configuration / Manage Home</h2>
        <p className="text-muted-foreground">
          Configure Hero Sections, Promos, Tabs, and Services as defined in the database.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="promo">Promo Banners</TabsTrigger>
          <TabsTrigger value="hometabs">Home Tabs (Categories)</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* --- HERO SECTION TAB --- */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Hero Slides</CardTitle>
                <CardDescription>Manage main carousel banners.</CardDescription>
              </div>
              <Link href="/admin/store/home/hero/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Hero
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={heroes} columns={heroColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PROMO BANNERS TAB --- */}
        <TabsContent value="promo" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Promo Banners</CardTitle>
                <CardDescription>Manage small promotional callouts.</CardDescription>
              </div>
              <Sheet open={isPromoOpen} onOpenChange={setIsPromoOpen}>
                <SheetTrigger render={<Button onClick={() => { setEditingPromo(null); promoForm.reset({ status: "Active", order: 0, title: "", subtitle: "", icon: "" }) }} />}>
                  <Plus className="mr-2 h-4 w-4" /> Add Promo
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{editingPromo ? 'Edit Promo' : 'Add Promo Banner'}</SheetTitle>
                    <SheetDescription>Small text banners, usually displayed under the hero section.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={promoForm.handleSubmit(handlePromoSubmit)} className="flex flex-col gap-5 px-4 py-4">
                    <div className="space-y-2">
                      <Label>Icon Class</Label>
                      <Input placeholder="bx bx-truck" {...promoForm.register("icon")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input {...promoForm.register("title")} />
                      {promoForm.formState.errors.title && <p className="text-xs text-destructive">{promoForm.formState.errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input {...promoForm.register("subtitle")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input type="number" {...promoForm.register("order")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Controller
                          control={promoForm.control}
                          name="status"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <SheetFooter className="mt-4">
                      <Button type="submit">Save Promo</Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={promos} columns={promoColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- HOME TABS TAB --- */}
        <TabsContent value="hometabs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Home Tabs</CardTitle>
                <CardDescription>Manage category tabs displayed on the homepage.</CardDescription>
              </div>
              <Sheet open={isTabOpen} onOpenChange={setIsTabOpen}>
                <SheetTrigger render={<Button onClick={() => { setEditingTab(null); tabForm.reset({ status: "Active", order: 0, title: "", categoryId: "" }) }} />}>
                  <Plus className="mr-2 h-4 w-4" /> Add Tab
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{editingTab ? 'Edit Tab' : 'Add Home Tab'}</SheetTitle>
                    <SheetDescription>Add a category tab to the homepage showcase.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={tabForm.handleSubmit(handleTabSubmit)} className="flex flex-col gap-5 px-4 py-4">
                    <div className="space-y-2">
                      <Label>Tab Title</Label>
                      <Input {...tabForm.register("title")} />
                      {tabForm.formState.errors.title && <p className="text-xs text-destructive">{tabForm.formState.errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Controller
                          control={tabForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                              <SelectContent>
                                {categories.map(c => (
                                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {tabForm.formState.errors.categoryId && <p className="text-xs text-destructive">{tabForm.formState.errors.categoryId.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input type="number" {...tabForm.register("order")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Controller
                          control={tabForm.control}
                          name="status"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <SheetFooter className="mt-4">
                      <Button type="submit">Save Tab</Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={homeTabs} columns={tabColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SERVICES TAB --- */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage store services and feature highlights.</CardDescription>
              </div>
              <Link href="/admin/store/home/service/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={services} columns={serviceColumns} keyExtractor={(item) => item.id} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
