"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Star, StarHalf, Edit, CheckCircle2, XCircle, 
  ChevronLeft, ChevronRight, MessageSquare 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ViewProductContentProps {
  productId: string;
}

export function ViewProductContent({ productId }: ViewProductContentProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/ecommerce/products/view/${productId}`);
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Skeleton className="h-[600px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.product) {
    return <div className="p-8">Product not found.</div>;
  }

  const { product, mockRating, relatedProducts, reviews } = data;

  // Process specifications
  let colors: string[] = [];
  let sizes: string[] = [];
  if (product.specifications && Array.isArray(product.specifications)) {
    const colorSpec = product.specifications.find((s: any) => s.name.toLowerCase() === 'color');
    const sizeSpec = product.specifications.find((s: any) => s.name.toLowerCase() === 'size');
    if (colorSpec) colors = colorSpec.value.split(',').map((v: string) => v.trim());
    if (sizeSpec) sizes = sizeSpec.value.split(',').map((v: string) => v.trim());
  }

  // Helper for images
  const getImageUrl = (img: string) => img.startsWith('http') ? img : `/uploads/${img}`;

  // Filter reviews
  const filteredReviews = reviews.filter((r: any) => {
    // Rating filter
    if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) return false;
    
    // Date filter
    if (dateFilter !== "all") {
      const reviewDate = new Date(r.created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - reviewDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > parseInt(dateFilter)) return false;
    }
    
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <span>eCommerce</span> / <span className="text-foreground font-medium">Product Details</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <Card>
            <CardContent className="p-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{product.product_name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < mockRating ? "fill-current" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({mockRating}/5 Mock Rating)</span>
                  </div>
                </div>
                <div>
                  <Badge variant={product.status === 1 ? "default" : product.status === 2 ? "secondary" : "destructive"} 
                    className={product.status === 1 ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none" : ""}>
                    {product.status === 1 ? 'Published' : product.status === 2 ? 'Scheduled' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="mb-8">
                <div className="relative border rounded-xl overflow-hidden bg-muted/30 aspect-video md:aspect-[21/9] flex items-center justify-center group">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={getImageUrl(product.images[activeImageIndex])} 
                      alt={product.product_name} 
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image available</div>
                  )}
                  
                  {product.images && product.images.length > 1 && (
                    <>
                      <Button variant="secondary" size="icon" className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActiveImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {product.images.map((img: string, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {product.specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="flex items-center">
                        <span className="font-medium mr-2">{spec.name}:</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Variations */}
              {(colors.length > 0 || sizes.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t">
                  {colors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Color Variations</h4>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color, idx) => (
                          <div 
                            key={idx} 
                            className="h-8 w-8 rounded-full border shadow-sm" 
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {sizes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Size Variations</h4>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1 text-sm">{size}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Reviews */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
              <div className="flex items-center gap-3">
                <CardTitle>Customer Reviews</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{reviews.length} Reviews</Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val || "all")}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="All Stars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "all")}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p>No reviews match your filters.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review: any) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">
                                {review.customer?.fullName?.charAt(0) || 'U'}
                              </div>
                              <span className="font-medium">{review.customer?.fullName || 'Unknown User'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[250px]">
                            <p className="text-sm text-muted-foreground truncate" title={review.comment}>
                              {review.comment}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {review.images && review.images.length > 0 ? (
                                <>
                                  {review.images.slice(0, 2).map((img: string, idx: number) => {
                                    const imgPath = img.startsWith('http') ? img : (img.startsWith('/uploads/') ? img : `/uploads/reviews/${img}`);
                                    return (
                                      <img key={idx} src={imgPath} alt="review" className="h-8 w-8 rounded object-cover border" />
                                    )
                                  })}
                                  {review.images.length > 2 && (
                                    <Badge variant="secondary" className="h-8 px-2 flex items-center justify-center text-xs">+{review.images.length - 2}</Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                            {review.date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                  <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Cost Price</h3>
                  <p className="text-lg text-muted-foreground">₹{product.costPrice || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Stock Status</h3>
                  <Badge variant={product.quantity > 0 ? "default" : "destructive"} className={product.quantity > 0 ? "bg-emerald-500/15 text-emerald-600 border-none" : ""}>
                    {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <Badge variant="secondary">{product.category?.name || 'Uncategorized'}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Product Type</h3>
                  <p className="font-medium text-primary">{product.product_type || 'Simple'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Brand</h3>
                  <p className="font-medium">{product.product_brand || 'None'}</p>
                </div>

                <hr />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Product Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {product.is_cod ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Cash on Delivery: <span className="font-medium">{product.is_cod ? 'Available' : 'Not Allowed'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.is_featured ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Featured Product: <span className="font-medium">{product.is_featured ? 'Yes' : 'No'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.show_in_explore ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-sm">Show in Explore: <span className="font-medium">{product.show_in_explore ? 'Yes' : 'No'}</span></span>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {new Date(product.created_at).toLocaleString()}</p>
                  <p>Last Updated: {new Date(product.updated_at).toLocaleString()}</p>
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => router.push(`/admin/ecommerce/products/edit/${product.id}`)}>
                  <Edit className="h-4 w-4" /> Edit Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Related Products</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Same Category: {product.category?.name || 'Uncategorized'}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rel: any) => {
                const relImg = (rel.images && rel.images.length > 0) ? getImageUrl(rel.images[0]) : '/assets/images/logo.png';
                return (
                  <div key={rel.id} className="border rounded-xl p-4 flex flex-col text-center hover:border-primary/50 transition-colors">
                    <div className="h-[120px] mb-4 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={relImg} alt={rel.product_name} className="h-full w-full object-contain" />
                    </div>
                    <h4 className="font-medium text-sm line-clamp-1 mb-1" title={rel.product_name}>{rel.product_name}</h4>
                    <p className="text-primary font-bold mb-4">₹{rel.price}</p>
                    <Button variant="outline" size="sm" className="mt-auto w-full" render={<Link href={`/admin/ecommerce/products/view/${rel.id}`} />} nativeButton={false}>
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
