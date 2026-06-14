"use client"

import * as React from "react"
import {
  Plus, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, Star, MoreVertical, Eye, Trash
} from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// --- Mock Data mapping to actual legacy schema ---
const heroes = [
  { id: 1, image: "hero1.jpg", mobileImage: "hero1-m.jpg", header: "Adorn Your Walls", title: "Authentic Pattachitra", buttonText: "Shop Now", buttonLink: "/shop", description: "Experience Divine Grace" }
]

const promos = [
  { id: 1, icon: "bx bx-truck", title: "Free Shipping", subtitle: "On orders over ₹999" }
]

const homeTabs = [
  { id: 1, title: "Pooja Samagri", categoryId: 10, order: 1, status: "Active" }
]

const services = [
  { id: 1, image: "service1.jpg", icon: "bx bx-support", title: "24/7 Support", subtitle: "Always here for you", rating: 5.0, reviewsCount: 120, status: "Active" }
]

export function ManageHomeContent() {
  const [activeTab, setActiveTab] = React.useState("hero")

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
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
                <Button><Plus className="mr-2 h-4 w-4" /> Add Hero</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Sub-Title (Header)</TableHead>
                    <TableHead>Button</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heroes.map((hero) => (
                    <TableRow key={hero.id}>
                      <TableCell>
                        <div className="h-12 w-20 bg-muted rounded border flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{hero.title}</TableCell>
                      <TableCell className="text-muted-foreground">{hero.header}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <LinkIcon className="mr-1 h-3 w-3" /> {hero.buttonText} ({hero.buttonLink})
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div>Showing 1-10 of 10 items</div>
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
              <Sheet>
                <SheetTrigger className={buttonVariants({ variant: "default" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Promo
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Promo Banner</SheetTitle>
                    <SheetDescription>Small text banners, usually displayed under the hero section.</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-5 px-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="promo-icon" className="font-medium">Icon Class (e.g., Boxicons)</Label>
                      <Input id="promo-icon" placeholder="bx bx-truck" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-title" className="font-medium">Title</Label>
                      <Input id="promo-title" placeholder="Free Shipping" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-subtitle" className="font-medium">Subtitle</Label>
                      <Input id="promo-subtitle" placeholder="On orders over ₹999" className="h-10" />
                    </div>
                  </div>
                  <SheetFooter className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <SheetClose render={<Button variant="outline" className="w-full sm:w-auto" />}>
                      Cancel
                    </SheetClose>
                    <Button type="submit" className="w-full sm:w-auto">Save Promo</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Icon Class</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promos.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono text-xs">{promo.icon}</TableCell>
                      <TableCell className="font-medium">{promo.title}</TableCell>
                      <TableCell className="text-muted-foreground">{promo.subtitle}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div>Showing 1-10 of 10 items</div>
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
              <Sheet>
                <SheetTrigger className={buttonVariants({ variant: "default" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Tab
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Home Tab</SheetTitle>
                    <SheetDescription>Add a category tab to the homepage showcase.</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-5 px-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="tab-title" className="font-medium">Tab Title</Label>
                      <Input id="tab-title" placeholder="Pooja Samagri" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tab-category" className="font-medium">Category</Label>
                      <Select>
                        <SelectTrigger id="tab-category" className="w-full h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">Pooja Samagri</SelectItem>
                          <SelectItem value="11">Idols & Murtis</SelectItem>
                          <SelectItem value="12">Spiritual Books</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tab-order" className="font-medium">Display Order</Label>
                        <Input id="tab-order" type="number" defaultValue="0" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tab-status" className="font-medium">Status</Label>
                        <Select defaultValue="Active">
                          <SelectTrigger id="tab-status" className="w-full h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <SheetClose render={<Button variant="outline" className="w-full sm:w-auto" />}>
                      Cancel
                    </SheetClose>
                    <Button type="submit" className="w-full sm:w-auto">Save Tab</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Tab Title</TableHead>
                    <TableHead>Category ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeTabs.map((tab) => (
                    <TableRow key={tab.id}>
                      <TableCell>{tab.order}</TableCell>
                      <TableCell className="font-medium">{tab.title}</TableCell>
                      <TableCell className="text-muted-foreground">ID: {tab.categoryId}</TableCell>
                      <TableCell>
                        <Badge variant={tab.status === 'Active' ? 'default' : 'secondary'}>{tab.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div>Showing 1-10 of 10 items</div>
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
                <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Image/Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="h-10 w-10 bg-muted rounded border flex items-center justify-center text-xs">
                          {service.icon}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell className="text-muted-foreground">{service.subtitle}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 text-amber-500 mr-1 fill-amber-500" /> 
                          {service.rating} ({service.reviewsCount})
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.status === 'Active' ? 'default' : 'secondary'}>{service.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer hover:!text-destructive hover:!bg-destructive/10">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div>Showing 1-10 of 10 items</div>
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
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
