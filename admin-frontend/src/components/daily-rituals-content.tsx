"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Sun, Moon, Clock, Info, ShieldAlert } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Dummy Data
const dummyRituals = [
  { id: 1, icon: <Sun className="h-4 w-4" />, name: "Dwara Phita", time: "05:00 AM", status: "Active" },
  { id: 2, icon: <Sun className="h-4 w-4" />, name: "Mangala Alati", time: "05:30 AM", status: "Active" },
  { id: 3, icon: <Clock className="h-4 w-4" />, name: "Mailam", time: "06:00 AM", status: "Active" },
  { id: 4, icon: <Sun className="h-4 w-4" />, name: "Abakasha", time: "06:30 AM", status: "Active" },
  { id: 5, icon: <Moon className="h-4 w-4" />, name: "Pahuda", time: "11:00 PM", status: "Active" },
]

const dummyDarshans = [
  { id: 1, name: "Sahana Mela", timeRange: "07:00 AM - 08:00 AM", type: "General", status: "Active" },
  { id: 2, name: "Parimanik Darshan", timeRange: "08:00 AM - 09:00 AM", type: "Special", status: "Active" },
  { id: 3, name: "General Darshan", timeRange: "09:00 AM - 01:00 PM", type: "General", status: "Active" },
  { id: 4, name: "Pahuda (Closed)", timeRange: "01:00 PM - 03:00 PM", type: "Pahuda", status: "Active" },
  { id: 5, name: "Evening Darshan", timeRange: "03:00 PM - 10:00 PM", type: "General", status: "Active" },
]

const dummyFacts = [
  { id: 1, icon: <Info className="h-4 w-4" />, title: "Mahaprasad Mystery", description: "The quantity of cooked food remains exactly same for the entire year.", colorClass: "primary", status: "Active" },
  { id: 2, icon: <ShieldAlert className="h-4 w-4" />, title: "No Bird Flies Above", description: "Nothing flies above the temple. No planes, no birds.", colorClass: "secondary", status: "Active" },
  { id: 3, icon: <Sun className="h-4 w-4" />, title: "The Flag", description: "The flag always flaps in a direction opposite to the direction of the wind.", colorClass: "warning", status: "Active" },
]

// Column Definitions
const ritualColumns: ColumnDef<typeof dummyRituals[0]>[] = [
  {
    header: "Icon",
    className: "w-[60px]",
    cell: (item) => (
      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {item.icon}
      </div>
    ),
  },
  {
    header: "Name",
    accessorKey: "name",
    className: "font-medium",
  },
  {
    header: "Time",
    className: "text-muted-foreground",
    cell: (item) => <Badge variant="outline" className="bg-info/10 text-info border-none">{item.time}</Badge>,
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
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Ritual</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete Ritual</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const darshanColumns: ColumnDef<typeof dummyDarshans[0]>[] = [
  {
    header: "Name",
    accessorKey: "name",
    className: "font-medium",
  },
  {
    header: "Time Range",
    className: "text-muted-foreground",
    cell: (item) => <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{item.timeRange}</Badge>,
  },
  {
    header: "Type",
    cell: (item) => {
      let colorClass = "bg-info/10 text-info";
      if (item.type === "Pahuda") colorClass = "bg-destructive/10 text-destructive";
      if (item.type === "Special") colorClass = "bg-warning/10 text-warning";
      
      return (
        <Badge variant="outline" className={`${colorClass} border-none`}>
          {item.type}
        </Badge>
      )
    },
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
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Timing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete Timing</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

const factsColumns: ColumnDef<typeof dummyFacts[0]>[] = [
  {
    header: "Icon",
    className: "w-[60px]",
    cell: (item) => (
      <div className={`h-8 w-8 rounded-md flex items-center justify-center bg-${item.colorClass}/10 text-${item.colorClass}`}>
        {item.icon}
      </div>
    ),
  },
  {
    header: "Title",
    accessorKey: "title",
    className: "font-medium whitespace-nowrap",
  },
  {
    header: "Description",
    className: "text-muted-foreground max-w-[300px] truncate",
    cell: (item) => <span className="truncate block" title={item.description}>{item.description}</span>
  },
  {
    header: "Theme",
    cell: (item) => <Badge variant="outline">{item.colorClass}</Badge>,
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
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Fact</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete Fact</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DailyRitualsContent() {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="rituals" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rituals">Daily Rituals Timeline</TabsTrigger>
          <TabsTrigger value="darshan">Darshan Timings</TabsTrigger>
          <TabsTrigger value="facts">Temple Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="rituals" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Rituals Timeline</CardTitle>
                <CardDescription>Manage the sequential list of temple rituals throughout the day.</CardDescription>
              </div>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Ritual
                    </Button>
                  }
                />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add New Ritual</SheetTitle>
                    <SheetDescription>
                      Add a new ritual to the daily temple schedule.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ritual-name">Ritual Name</Label>
                      <Input id="ritual-name" placeholder="e.g., Dwara Phita" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ritual-time">Time</Label>
                      <Input id="ritual-time" placeholder="e.g., 05:00 AM" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ritual-icon">Icon (Lucide/FontAwesome)</Label>
                      <Input id="ritual-icon" placeholder="e.g., Sun" defaultValue="Sun" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ritual-status">Status</Label>
                      <Select defaultValue="active">
                        <SelectTrigger id="ritual-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose
                      render={
                        <Button variant="outline">Cancel</Button>
                      }
                    />
                    <Button type="submit">Save Ritual</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={dummyRituals} columns={ritualColumns} keyExtractor={(item) => item.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="darshan" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Darshan Timings</CardTitle>
                <CardDescription>Configure public viewing times and Pahuda (closed) hours.</CardDescription>
              </div>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Darshan Timing
                    </Button>
                  }
                />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Darshan Timing</SheetTitle>
                    <SheetDescription>
                      Configure a new public viewing or closed window.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="darshan-name">Darshan Name</Label>
                      <Input id="darshan-name" placeholder="e.g., General Darshan" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="darshan-time">Time Range</Label>
                      <Input id="darshan-time" placeholder="e.g., 07:00 AM - 01:00 PM" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="darshan-type">Type</Label>
                      <Select defaultValue="general">
                        <SelectTrigger id="darshan-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                          <SelectItem value="pahuda">Pahuda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="darshan-status">Status</Label>
                      <Select defaultValue="active">
                        <SelectTrigger id="darshan-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose
                      render={
                        <Button variant="outline">Cancel</Button>
                      }
                    />
                    <Button type="submit">Save Darshan</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={dummyDarshans} columns={darshanColumns} keyExtractor={(item) => item.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>Did You Know? (Temple Facts)</CardTitle>
                <CardDescription>Manage interesting facts displayed to the users.</CardDescription>
              </div>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Temple Fact
                    </Button>
                  }
                />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add Temple Fact</SheetTitle>
                    <SheetDescription>
                      Create a new interesting fact about the temple.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fact-title">Title</Label>
                      <Input id="fact-title" placeholder="e.g., Mahaprasad Mystery" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fact-description">Description</Label>
                      <Textarea id="fact-description" placeholder="Enter fact description..." rows={3} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fact-icon">Icon (Lucide/FontAwesome)</Label>
                      <Input id="fact-icon" placeholder="e.g., Info" defaultValue="Info" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fact-color">Color Theme</Label>
                      <Select defaultValue="primary">
                        <SelectTrigger id="fact-color">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary (Maroon)</SelectItem>
                          <SelectItem value="secondary">Secondary (Blue)</SelectItem>
                          <SelectItem value="success">Success (Green)</SelectItem>
                          <SelectItem value="warning">Warning (Orange)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose
                      render={
                        <Button variant="outline">Cancel</Button>
                      }
                    />
                    <Button type="submit">Save Fact</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable data={dummyFacts} columns={factsColumns} keyExtractor={(item) => item.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
