"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, Image as ImageIcon, Type, Link as LinkIcon, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const heroSchema = z.object({
  title: z.string().min(1, "Main Headline is required"),
  header: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
})

type HeroFormValues = z.infer<typeof heroSchema>

export function AdminHeroEdit({ id }: { id: string }) {
  const router = useRouter()
  const [desktopImage, setDesktopImage] = useState<File | null>(null)
  const [mobileImage, setMobileImage] = useState<File | null>(null)
  
  const [existingDesktop, setExistingDesktop] = useState<string | null>(null)
  const [existingMobile, setExistingMobile] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let cleanPath = path;
    if (cleanPath.startsWith('/uploads/hero/')) cleanPath = cleanPath.replace('/uploads/hero/', '/uploads/');
    if (!cleanPath.startsWith('/')) cleanPath = `/uploads/${cleanPath}`;
    return cleanPath;
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      title: "",
      header: "",
      description: "",
      buttonText: "",
      buttonLink: ""
    }
  })

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch('/api/admin/store/home/hero/data')
        const json = await res.json()
        const hero = json.data?.find((h: any) => h.id === parseInt(id))
        
        if (hero) {
          reset({
            title: hero.title || "",
            header: hero.header || "",
            description: hero.description || "",
            buttonText: hero.buttonText || "",
            buttonLink: hero.buttonLink || ""
          })
          if (hero.image) setExistingDesktop(hero.image)
          if (hero.mobileImage) setExistingMobile(hero.mobileImage)
        } else {
          toast.error("Hero not found")
          router.push("/admin/store/home")
        }
      } catch (err) {
        toast.error("Failed to load hero data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHero()
  }, [id, reset, router])

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDesktopImage(e.target.files[0])
      setExistingDesktop(null)
    }
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMobileImage(e.target.files[0])
      setExistingMobile(null)
    }
  }

  const removeDesktopImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setDesktopImage(null)
    setExistingDesktop(null)
  }

  const removeMobileImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileImage(null)
    setExistingMobile(null)
  }

  const onSubmit = async (data: HeroFormValues) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      if (data.header) formData.append("header", data.header)
      if (data.description) formData.append("description", data.description)
      if (data.buttonText) formData.append("buttonText", data.buttonText)
      if (data.buttonLink) formData.append("buttonLink", data.buttonLink)

      if (desktopImage) {
        formData.append("image", desktopImage)
      } else if (existingDesktop) {
        formData.append("existingImage", existingDesktop)
      }

      if (mobileImage) {
        formData.append("mobileImage", mobileImage)
      } else if (existingMobile) {
        formData.append("existingMobileImage", existingMobile)
      }

      const response = await fetch(`/api/admin/store/home/hero/update/${id}`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Hero slide updated successfully!")
        router.push("/admin/store/home")
      } else {
        toast.error(result.message || "Failed to update hero slide")
      }
    } catch (error) {
      toast.error("An error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto w-full">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 pt-2">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto w-full">
      
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/admin/store/home">
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Hero Slide</h1>
            <p className="text-sm text-muted-foreground mt-1">Update your homepage banner.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/store/home" className="flex-1 sm:flex-none">
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none rounded-lg shadow-sm">
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Update Slide"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media Card */}
          <Card className="rounded-xl shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Media Elements</CardTitle>
              </div>
              <CardDescription>Upload background images for desktop and mobile.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Desktop Upload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <Label className="font-medium text-foreground">Desktop Background</Label>
                    <span className="text-xs text-muted-foreground">1920 × 800px</span>
                  </div>
                  {desktopImage ? (
                    <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                      <img src={URL.createObjectURL(desktopImage)} alt="Desktop preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeDesktopImage}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : existingDesktop ? (
                    <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                      <img src={getImageUrl(existingDesktop)} alt="Desktop preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeDesktopImage}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="hero-image" className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Upload Image</span>
                      <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</span>
                      <Input id="hero-image" type="file" className="hidden" accept="image/*" onChange={handleDesktopChange} />
                    </Label>
                  )}
                </div>

                {/* Mobile Upload */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <Label className="font-medium text-foreground">Mobile Background <span className="font-normal text-muted-foreground">(Optional)</span></Label>
                    <span className="text-xs text-muted-foreground">800 × 1200px</span>
                  </div>
                  {mobileImage ? (
                    <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                      <img src={URL.createObjectURL(mobileImage)} alt="Mobile preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeMobileImage}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : existingMobile ? (
                    <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                      <img src={getImageUrl(existingMobile)} alt="Mobile preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeMobileImage}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="hero-mobile-image" className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Upload Image</span>
                      <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</span>
                      <Input id="hero-mobile-image" type="file" className="hidden" accept="image/*" onChange={handleMobileChange} />
                    </Label>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Typography Card */}
          <Card className="rounded-xl shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Typography & Messaging</CardTitle>
              </div>
              <CardDescription>The text displayed over your banner images.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="hero-header" className="font-medium">Sub-title (Eyebrow)</Label>
                <Input id="hero-header" placeholder="e.g. Adorn Your Walls with History" className="rounded-lg h-10" {...register("header")} />
              </div>
              <div className="space-y-3">
                <Label htmlFor="hero-title" className="font-medium">Main Headline</Label>
                <Textarea id="hero-title" placeholder="e.g. Experience Divine Grace" rows={2} className="rounded-lg resize-none text-base" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-3">
                <Label htmlFor="hero-desc" className="font-medium">Description</Label>
                <Textarea id="hero-desc" placeholder="Write a brief supporting description..." rows={3} className="rounded-lg resize-none" {...register("description")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Column */}
        <div className="space-y-8">
          <Card className="rounded-xl shadow-sm border-border overflow-hidden sticky top-6">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Call to Action</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="hero-btn-text" className="font-medium">Button Text</Label>
                <Input id="hero-btn-text" placeholder="Shop Now" className="rounded-lg h-10" {...register("buttonText")} />
              </div>
              <div className="space-y-3">
                <Label htmlFor="hero-btn-link" className="font-medium">Target URL</Label>
                <Input id="hero-btn-link" placeholder="/collections/new" className="rounded-lg h-10" {...register("buttonLink")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
