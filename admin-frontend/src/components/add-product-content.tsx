"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast, Toaster } from "sonner"
import { 
  Upload, Plus, X, Box, Truck, Globe, Link as LinkIcon, Lock 
} from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  
  regularPrice: z.number().min(0).or(z.string().transform(v => Number(v) || 0)),
  salePrice: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  onSale: z.boolean().default(false),
  chargeTax: z.boolean().default(true),
  allowCod: z.boolean().default(true),
  costPrice: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  showInExplore: z.boolean().default(false),

  vendor: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  productType: z.string().default("Simple"),
  status: z.string().default("Published"),
  tags: z.string().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  imageAlt: z.string().optional(),

  inventoryStock: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  lowStockThreshold: z.number().default(10).or(z.string().transform(v => Number(v) || 10)),
  shippingType: z.enum(["seller", "company"]).default("company"),
  specifications: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    value: z.string().min(1, "Value is required")
  })).optional()
});

type ProductFormValues = z.input<typeof productSchema>;

interface AddProductContentProps {
  editId?: string;
}

export function AddProductContent({ editId }: AddProductContentProps) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [attributes, setAttributes] = useState<{id: number, name: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      categoryId: "",
      vendor: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      imageAlt: "",
      status: "Published",
      productType: "Simple",
      onSale: false,
      chargeTax: true,
      allowCod: true,
      inStock: true,
      isFeatured: false,
      showInExplore: false,
      shippingType: "company",
      lowStockThreshold: 10,
      specifications: []
    }
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications"
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const watchedName = watch("name");

  useEffect(() => {
    if (!isSlugManuallyEdited && !editId && watchedName !== undefined) {
      const generatedSlug = watchedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchedName, isSlugManuallyEdited, editId, setValue]);

  const getSeoColor = (length: number, type: 'title' | 'description' | 'keywords') => {
    if (length === 0) return "text-muted-foreground";
    if (type === 'title') {
      if (length >= 50 && length <= 60) return "text-emerald-500 font-medium";
      if (length >= 30 && length <= 70) return "text-amber-500 font-medium";
      return "text-destructive font-medium";
    }
    if (type === 'description') {
      if (length >= 150 && length <= 160) return "text-emerald-500 font-medium";
      if (length >= 70 && length <= 180) return "text-amber-500 font-medium";
      return "text-destructive font-medium";
    }
    if (type === 'keywords') {
      if (length >= 3 && length <= 8) return "text-emerald-500 font-medium";
      if (length >= 1 && length <= 12) return "text-amber-500 font-medium";
      return "text-destructive font-medium";
    }
    return "text-muted-foreground";
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/ecommerce/categories/data");
        const json = await res.json();
        if (json.data) {
          setCategories(json.data.map((c: any) => ({ id: c.id, name: c.categories })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchAttributes = async () => {
      try {
        const res = await fetch("/api/admin/ecommerce/attributes/data");
        const json = await res.json();
        if (json.data) {
          setAttributes(json.data.map((a: any) => ({ id: a.id, name: a.name })));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
    fetchAttributes();

    if (editId) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/admin/ecommerce/products/view/${editId}`);
          const json = await res.json();
          const data = json.product;
          if (data && data.id) {
            setValue("name", data.product_name);
            setValue("slug", data.slug);
            setValue("sku", data.sku || "");
            setValue("description", data.description || "");
            setValue("regularPrice", data.price || 0);
            setValue("salePrice", data.sale_price || undefined);
            setValue("onSale", data.on_sale || false);
            setValue("allowCod", data.is_cod || false);
            setValue("costPrice", data.costPrice || undefined);
            setValue("inStock", data.status === 1 || data.status === 2);
            setValue("isFeatured", data.is_featured || false);
            setValue("showInExplore", data.show_in_explore || false);
            setValue("vendor", data.product_brand || "");
            setValue("categoryId", data.category_id ? String(data.category_id) : "");
            setValue("productType", data.product_type || "Simple");
            setValue("status", data.status === 1 ? "Published" : data.status === 2 ? "Scheduled" : "Inactive");
            setValue("metaTitle", data.meta_title || "");
            setValue("metaDescription", data.meta_description || "");
            setValue("metaKeywords", data.meta_keywords || "");
            setValue("imageAlt", data.image_alt || "");
            setValue("inventoryStock", data.quantity || 0);
            setValue("lowStockThreshold", data.lowStockThreshold || 10);
            if (data.images && data.images.length > 0) {
              setExistingImages(data.images);
            }
            if (data.specifications && Array.isArray(data.specifications)) {
              setValue("specifications", data.specifications);
            }
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to load product data");
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [editId, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray].slice(0, 10));
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_name", data.name);
      formData.append("slug", data.slug);
      formData.append("sku", data.sku || "");
      formData.append("description", data.description || "");
      formData.append("price", String(data.regularPrice));
      formData.append("regular_price", String(data.regularPrice));
      if (data.salePrice) formData.append("sale_price", String(data.salePrice));
      formData.append("on_sale", String(data.onSale || false));
      formData.append("is_cod", String(data.allowCod || false));
      if (data.costPrice) formData.append("costPrice", String(data.costPrice));
      formData.append("is_featured", String(data.isFeatured || false));
      formData.append("show_in_explore", String(data.showInExplore || false));
      formData.append("product_brand", data.vendor || "");
      formData.append("category", data.categoryId);
      formData.append("product_type", data.productType || "Simple");
      formData.append("status", (data.status || "Published") === "Published" ? "1" : (data.status || "Published") === "Scheduled" ? "2" : "0");
      formData.append("meta_title", data.metaTitle || "");
      formData.append("meta_description", data.metaDescription || "");
      formData.append("meta_keywords", data.metaKeywords || "");
      formData.append("image_alt", data.imageAlt || "");
      formData.append("quantity", String(data.inventoryStock || 0));
      formData.append("lowStockThreshold", String(data.lowStockThreshold || 10));
      formData.append("specifications", JSON.stringify(data.specifications || []));
      
      existingImages.forEach((img) => formData.append("product_images", img));
      images.forEach((file) => formData.append("product_images", file));

      const url = editId ? `/api/admin/ecommerce/products/update/${editId}` : `/api/admin/ecommerce/products/save`;
      
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(editId ? "Product updated!" : "Product created!");
        router.push("/admin/ecommerce/products");
      } else {
        toast.error(result.error || "Failed to save product");
      }
    } catch (err) {
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4 md:p-8">
      <Toaster position="top-center" richColors />
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{editId ? "Edit Product" : "Add a new Product"}</h2>
          <p className="text-muted-foreground">Manage your product details and inventory</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/ecommerce/products")}>Discard</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editId ? "Update product" : "Publish product"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Product title" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input 
                    id="slug" 
                    placeholder="product-slug" 
                    {...register("slug")} 
                    onChange={(e) => {
                      register("slug").onChange(e);
                      setIsSlugManuallyEdited(true);
                    }}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="SKU" {...register("sku")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" placeholder="0123-4567" {...register("barcode")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Controller 
                  name="description" 
                  control={control} 
                  render={({ field }) => (
                    <RichTextEditor 
                      value={field.value} 
                      onChange={field.onChange} 
                      placeholder="Enter detailed product description..." 
                    />
                  )} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative h-24 w-24 rounded-md border overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/uploads/${img}`} alt="preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 shadow-sm">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.map((file, index) => (
                  <div key={`new-${index}`} className="relative h-24 w-24 rounded-md border overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 shadow-sm">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label htmlFor="media-upload" className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer block w-full">
                <input id="media-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drag & Drop or Click to Upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Up to 10 images allowed. Max 5MB per image.</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Product Specifications / Attributes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Attributes & Specifications</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ name: "", value: "" })}>
                <Plus className="h-4 w-4 mr-2" /> Add Attribute
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {specFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Controller
                      name={`specifications.${index}.name` as const}
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Attribute" />
                          </SelectTrigger>
                          <SelectContent>
                            {attributes.map(attr => (
                              <SelectItem key={attr.id} value={attr.name}>{attr.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.specifications?.[index]?.name && <p className="text-sm text-destructive">{errors.specifications[index].name?.message}</p>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Value (e.g. Red)" {...register(`specifications.${index}.value` as const)} />
                    {errors.specifications?.[index]?.value && <p className="text-sm text-destructive">{errors.specifications[index].value?.message}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeSpec(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {specFields.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-md">
                  No attributes added yet. Click "Add Attribute" to define custom specifications.
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO & Meta Tags */}
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input id="meta-title" placeholder="SEO Title" {...register("metaTitle")} />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Optimal length: 50-60 chars</span>
                  <span className={getSeoColor(watch("metaTitle")?.length || 0, 'title')}>
                    {watch("metaTitle")?.length || 0} chars
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea id="meta-description" placeholder="SEO Description" rows={3} {...register("metaDescription")} />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Optimal length: 150-160 chars</span>
                  <span className={getSeoColor(watch("metaDescription")?.length || 0, 'description')}>
                    {watch("metaDescription")?.length || 0} chars
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input id="meta-keywords" placeholder="keyword1, keyword2" {...register("metaKeywords")} />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Optimal: 3-8 keywords</span>
                  <span className={getSeoColor(watch("metaKeywords")?.split(',').filter(k => k.trim() !== '').length || 0, 'keywords')}>
                    {watch("metaKeywords")?.split(',').filter(k => k.trim() !== '').length || 0} keywords
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Image Alt Text</Label>
                <Input id="image-alt" placeholder="Alt text for product images" {...register("imageAlt")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular Price</Label>
                <Input id="regularPrice" type="number" placeholder="Price" {...register("regularPrice")} />
                {errors.regularPrice && <p className="text-sm text-destructive">{errors.regularPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input id="salePrice" type="number" placeholder="Sale Price" {...register("salePrice")} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="onSale" className="cursor-pointer">On Sale</Label>
                <Controller name="onSale" control={control} render={({ field }) => <Switch id="onSale" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="allowCod" className="cursor-pointer">Allow Cash on Delivery</Label>
                <Controller name="allowCod" control={control} render={({ field }) => <Switch id="allowCod" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="costPrice">Cost Price <span className="text-muted-foreground font-normal">(Internal)</span></Label>
                <Input id="costPrice" type="number" placeholder="Cost Price" {...register("costPrice")} />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="inventoryStock">Stock Quantity</Label>
                <Input id="inventoryStock" type="number" placeholder="Quantity" {...register("inventoryStock")} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured Product</Label>
                <Controller name="isFeatured" control={control} render={({ field }) => <Switch id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller name="categoryId" control={control} render={({ field }) => (
                  <Select key={`cat-${categories.length}`} onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category">
                        {field.value ? (categories.length === 0 ? "Loading..." : (categories.find(c => String(c.id) === field.value)?.name || "Unknown Category")) : "Select Category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
