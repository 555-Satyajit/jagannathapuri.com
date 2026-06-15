"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, Info, Settings2, Star, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const serviceSchema = z.object({
  title: z.string().min(1, "Service Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  link: z.string().optional(),
  phone: z.string().optional(),
  rating: z.any(),
  reviewsCount: z.any(),
  status: z.enum(["Active", "Inactive"]),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export function AdminServiceEdit({ id }: { id: string }) {
  const router = useRouter()
  const [serviceImage, setServiceImage] = useState<File | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let cleanPath = path;
    if (cleanPath.startsWith('/uploads/services/')) cleanPath = cleanPath.replace('/uploads/services/', '/uploads/');
    if (!cleanPath.startsWith('/')) cleanPath = `/uploads/${cleanPath}`;
    return `http://localhost:5000${cleanPath}`;
  }

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      icon: "",
      link: "/service",
      phone: "",
      rating: 5,
      reviewsCount: 0,
      status: "Active"
    }
  })

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch('/api/admin/store/home/service/data')
        const json = await res.json()
        const service = json.data?.find((s: any) => s.id === parseInt(id))
        
        if (service) {
          reset({
            title: service.title || "",
            subtitle: service.subtitle || "",
            description: service.description || "",
            icon: service.icon || "",
            link: service.link || "",
            phone: service.phone || "",
            rating: service.rating || 5,
            reviewsCount: service.reviewsCount || 0,
            status: service.status || "Active"
          })
          if (service.image) setExistingImage(service.image)
        } else {
          toast.error("Service not found")
          router.push("/admin/store/home")
        }
      } catch (err) {
        toast.error("Failed to load service data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchService()
  }, [id, reset, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setServiceImage(e.target.files[0])
      setExistingImage(null)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setServiceImage(null)
    setExistingImage(null)
  }

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      if (data.subtitle) formData.append("subtitle", data.subtitle)
      if (data.description) formData.append("description", data.description)
      if (data.icon) formData.append("icon", data.icon)
      if (data.link) formData.append("link", data.link)
      if (data.phone) formData.append("phone", data.phone)
      
      formData.append("rating", data.rating?.toString() || "5")
      formData.append("reviewsCount", data.reviewsCount?.toString() || "0")
      formData.append("status", data.status)

      if (serviceImage) {
        formData.append("image", serviceImage)
      } else if (existingImage) {
        formData.append("existingImage", existingImage)
      }

      const response = await fetch(`/api/admin/store/home/service/update/${id}`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Service updated successfully!")
        router.push("/admin/store/home")
      } else {
        toast.error(result.message || "Failed to update service")
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
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-[350px] w-full rounded-xl" />
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Service Block</h1>
            <p className="text-sm text-muted-foreground mt-1">Update feature or service highlight.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/store/home" className="flex-1 sm:flex-none">
            <Button type="button" variant="outline" className="w-full sm:w-auto rounded-lg">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none rounded-lg shadow-sm">
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Update Service"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Details Card */}
          <Card className="rounded-xl shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Core Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="service-title" className="font-medium text-foreground">Service Title <span className="text-red-500">*</span></Label>
                  <Input id="service-title" placeholder="e.g. 24/7 Support" className="rounded-lg h-10" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="service-subtitle" className="font-medium text-foreground">Subtitle</Label>
                  <Input id="service-subtitle" placeholder="e.g. Always here for you" className="rounded-lg h-10" {...register("subtitle")} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="service-icon" className="font-medium text-foreground">Icon Class <span className="text-muted-foreground font-normal">(Heroicons / Boxicons)</span></Label>
                  <Input id="service-icon" placeholder="e.g. bx bx-support" className="rounded-lg h-10 font-mono text-sm" {...register("icon")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="service-link" className="font-medium text-foreground">Learn More Link</Label>
                  <Input id="service-link" placeholder="/service" className="rounded-lg h-10" {...register("link")} />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="service-desc" className="font-medium text-foreground">Detailed Description</Label>
                <Textarea id="service-desc" placeholder="Explain the benefits of this service..." rows={4} className="rounded-lg resize-none" {...register("description")} />
              </div>
            </CardContent>
          </Card>

          {/* Social Proof Card */}
          <Card className="rounded-xl shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Metrics & Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="service-rating" className="font-medium text-foreground">Rating Score</Label>
                  <Input id="service-rating" type="number" step="0.1" className="rounded-lg h-10" {...register("rating")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="service-reviews" className="font-medium text-foreground">Review Count</Label>
                  <Input id="service-reviews" type="number" className="rounded-lg h-10" {...register("reviewsCount")} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="service-phone" className="font-medium text-foreground">Support Phone</Label>
                  <Input id="service-phone" placeholder="+91..." className="rounded-lg h-10" {...register("phone")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Column */}
        <div className="space-y-8">
          <Card className="rounded-xl shadow-sm border-border overflow-hidden sticky top-6">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Configuration & Media</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-3">
                <Label className="font-medium text-foreground">Service Image <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                {serviceImage ? (
                  <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                    <img src={URL.createObjectURL(serviceImage)} alt="Service preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeImage}>
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : existingImage ? (
                  <div className="relative h-32 rounded-lg border border-border overflow-hidden bg-muted/20 group">
                    <img src={getImageUrl(existingImage)} alt="Service preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="sm" className="h-8 rounded-md" onClick={removeImage}>
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Label htmlFor="service-image" className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground">Upload Image</span>
                    <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</span>
                    <Input id="service-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </Label>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="service-status" className="font-medium text-foreground">Visibility Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger id="service-status" className="rounded-lg h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="Active" className="rounded-md">Active - Visible</SelectItem>
                        <SelectItem value="Inactive" className="rounded-md">Inactive - Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
