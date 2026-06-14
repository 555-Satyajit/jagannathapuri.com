"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
const dummyFestivals = [
  { id: 1, date: "2026-03-08T00:00:00.000Z", name: "Maha Shivratri", type: "Major", status: "Active" },
  { id: 2, date: "2026-07-14T00:00:00.000Z", name: "Ratha Yatra", type: "Major", status: "Active" },
  { id: 3, date: "2026-11-10T00:00:00.000Z", name: "Diwali (Deepavali)", type: "Major", status: "Inactive" },
]

export function FestivalsContent() {
  const columns: ColumnDef<typeof dummyFestivals[0]>[] = [
    {
      header: "Date",
      accessorKey: "date",
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    {
      header: "Festival Name",
      accessorKey: "name",
      className: "font-medium"
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (item) => (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
          {item.type || 'N/A'}
        </Badge>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge variant="secondary" className={item.status === 'Active' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none"}>
          {item.status}
        </Badge>
      )
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
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Actions</div>
            <DropdownMenuItem>Edit Festival</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle>Festivals List</CardTitle>
            <CardDescription>View and manage all registered temple festivals.</CardDescription>
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Festival
                </Button>
              }
            />
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add New Festival</SheetTitle>
                <SheetDescription>
                  Enter festival details to display on the Vedic Calendar.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="festival-name">Festival Name</Label>
                  <Input id="festival-name" placeholder="e.g. Maha Shivratri" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="festival-date">Date</Label>
                  <Input id="festival-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="festival-type">Type</Label>
                  <Input id="festival-type" placeholder="e.g. Major, Regional" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="festival-status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="festival-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="festival-description">Description</Label>
                  <Textarea id="festival-description" placeholder="Enter festival description..." rows={4} />
                </div>
              </div>
              <SheetFooter>
                <SheetClose
                  render={
                    <Button variant="outline">Cancel</Button>
                  }
                />
                <Button type="submit">Submit</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={dummyFestivals} columns={columns} keyExtractor={(item) => item.id} />
        </CardContent>
      </Card>
    </div>
  )
}
