"use client"

import * as React from "react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Image as ImageIcon } from "lucide-react"
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

// Dummy Data
const dummyPopups = [
  { id: 1, image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2070&auto=format&fit=crop", startTime: "2026-06-01T00:00:00Z", endTime: "2026-06-30T23:59:00Z", status: "Active" },
  { id: 2, image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070&auto=format&fit=crop", startTime: "2026-05-01T00:00:00Z", endTime: "2026-05-31T23:59:00Z", status: "Inactive" },
]

export function PopupContent() {
  const columns: ColumnDef<typeof dummyPopups[0]>[] = [
    {
      header: "Image",
      accessorKey: "image",
      cell: (item) => (
        <div className="h-12 w-20 relative rounded overflow-hidden border">
          {item.image ? (
            <img src={item.image} alt="Popup" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )
    },
    {
      header: "Schedule",
      accessorKey: "startTime",
      cell: (item) => (
        <div className="text-sm">
          <div><span className="font-semibold text-muted-foreground">From:</span> {new Date(item.startTime).toLocaleString('en-GB')}</div>
          <div><span className="font-semibold text-muted-foreground">To:</span> {new Date(item.endTime).toLocaleString('en-GB')}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item) => (
        <Badge variant="secondary" className={item.status === 'Active' ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none" : "bg-muted text-muted-foreground border-none"}>
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
            <DropdownMenuItem>Edit Popup</DropdownMenuItem>
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
            <CardTitle>Popups List</CardTitle>
            <CardDescription>View and manage active and scheduled popups.</CardDescription>
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Popup
                </Button>
              }
            />
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add Popup</SheetTitle>
                <SheetDescription>
                  Upload a promotional image and set its display schedule.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="popup-image">Popup Image</Label>
                  <Input id="popup-image" type="file" accept="image/*" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Start Date & Time</Label>
                  <Input id="start-time" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">End Date & Time</Label>
                  <Input id="end-time" type="datetime-local" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="popup-status">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="popup-status">
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
                <Button type="submit">Save Popup</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={dummyPopups} columns={columns} keyExtractor={(item) => item.id} />
        </CardContent>
      </Card>
    </div>
  )
}
