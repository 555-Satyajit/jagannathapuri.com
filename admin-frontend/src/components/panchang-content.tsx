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

// Dummy Data mapped from old EJS schema
const dummyPanchang = [
  { id: 1, date: "2026-06-13T00:00:00.000Z", sections: ["Sun & Moon", "Panchang Details", "Calendar"], createdAt: "2026-06-12T00:00:00.000Z" },
  { id: 2, date: "2026-06-14T00:00:00.000Z", sections: ["Sun & Moon", "Panchang Details", "Calendar"], createdAt: "2026-06-13T00:00:00.000Z" },
  { id: 3, date: "2026-06-15T00:00:00.000Z", sections: ["Sun & Moon", "Panchang Details"], createdAt: "2026-06-14T00:00:00.000Z" },
]

export function PanchangContent() {
  const columns: ColumnDef<typeof dummyPanchang[0]>[] = [
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
      header: "Sections",
      accessorKey: "sections",
      cell: (item) => (
        <div className="flex gap-2 flex-wrap">
          {item.sections.map((section, idx) => (
            <Badge key={idx} variant="secondary" className="bg-sky-100 text-sky-800 hover:bg-sky-200 border-none">
              {section}
            </Badge>
          ))}
        </div>
      )
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: (item) => new Date(item.createdAt).toLocaleDateString()
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
            <DropdownMenuItem>Edit Entry</DropdownMenuItem>
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
            <CardTitle>Panchang List</CardTitle>
            <CardDescription>Manage daily astrological details and calendar events.</CardDescription>
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Panchang Entry
                </Button>
              }
            />
            <SheetContent className="sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add Panchang Entry</SheetTitle>
                <SheetDescription>
                  Create a new astrological entry. Sections can be added dynamically.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="panchang-date">Select Date</Label>
                  <Input id="panchang-date" type="date" />
                </div>
                
                {/* Dummy UI for Dynamic Sections */}
                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Sun & Moon</h4>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive">Remove</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sunrise</Label>
                      <Input placeholder="05:30 AM" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sunset</Label>
                      <Input placeholder="06:45 PM" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-dashed mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Section
                </Button>
              </div>
              <SheetFooter>
                <SheetClose
                  render={
                    <Button variant="outline">Cancel</Button>
                  }
                />
                <Button type="submit">Save Panchang Entry</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={dummyPanchang} columns={columns} keyExtractor={(item) => item.id} />
        </CardContent>
      </Card>
    </div>
  )
}
